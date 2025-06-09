
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useHousehold } from './HouseholdContext';
import { supabase } from '@/integrations/supabase/client';

interface MealPlanApproval {
  id: string;
  approval_request_id: string;
  user_id: string;
  approved: boolean;
  comments?: string;
  responded_at: string;
  approval_request?: {
    id: string;
    household_id: string;
    requested_by: string;
    meal_plan_data: any;
    status: string;
    created_at: string;
  };
}

export interface ApprovalRequest {
  id: string;
  household_id: string;
  requested_by: string;
  week_number: number;
  message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  created_at: string;
  updated_at: string;
  expires_at: string;
}

interface MealPlanApprovalContextType {
  approvals: MealPlanApproval[];
  approvalRequests: ApprovalRequest[];
  loading: boolean;
  error: string | null;
  fetchApprovals: () => Promise<void>;
  fetchApprovalRequests: () => Promise<void>;
  submitApproval: (requestId: string, approved: boolean, notes?: string) => Promise<void>;
  createApprovalRequest: (weekNumber: number, message?: string) => Promise<void>;
  respondToRequest: (requestId: string, approved: boolean, comments?: string) => Promise<void>;
  getRequestApprovals: (requestId: string) => MealPlanApproval[];
}

const MealPlanApprovalContext = createContext<MealPlanApprovalContextType | undefined>(undefined);

export function MealPlanApprovalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  
  const [approvals, setApprovals] = useState<MealPlanApproval[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Debounced API calls to prevent resource exhaustion
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const FETCH_COOLDOWN = 3000; // 3 seconds cooldown

  const fetchApprovals = useCallback(async () => {
    if (!currentHousehold?.id || !user) return;
    
    const now = Date.now();
    if (now - lastFetchTime < FETCH_COOLDOWN) {
      console.log('⏳ Skipping fetch - too soon after last call');
      return;
    }
    setLastFetchTime(now);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching meal plan approvals for household:', currentHousehold.id);
      
      // Only select columns that actually exist in the meal_plan_approvals table
      const { data, error: fetchError } = await supabase
        .from('meal_plan_approvals')
        .select(`
          id,
          approval_request_id,
          user_id,
          approved,
          comments,
          responded_at
        `);

      if (fetchError) {
        console.error('❌ Error fetching approvals:', fetchError);
        setError('Failed to fetch approvals');
        return;
      }

      console.log('✅ Successfully fetched approvals:', data?.length || 0);
      setApprovals(data || []);
    } catch (err) {
      console.error('❌ Error fetching approvals:', err);
      setError('Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  }, [currentHousehold?.id, user, lastFetchTime]);

  const fetchApprovalRequests = useCallback(async () => {
    if (!currentHousehold?.id || !user) return;
    
    const now = Date.now();
    if (now - lastFetchTime < FETCH_COOLDOWN) {
      console.log('⏳ Skipping fetch - too soon after last call');
      return;
    }
    setLastFetchTime(now);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching meal plan approval requests for household:', currentHousehold.id);
      
      const { data, error: fetchError } = await supabase
        .from('meal_plan_approval_requests')
        .select(`
          id,
          household_id,
          requested_by,
          week_number,
          message,
          status,
          created_at,
          updated_at,
          expires_at
        `)
        .eq('household_id', currentHousehold.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Error fetching approval requests:', fetchError);
        setError('Failed to fetch approval requests');
        return;
      }

      console.log('✅ Successfully fetched approval requests:', data?.length || 0);
      setApprovalRequests(data || []);
    } catch (err) {
      console.error('❌ Error fetching approval requests:', err);
      setError('Failed to fetch approval requests');
    } finally {
      setLoading(false);
    }
  }, [currentHousehold?.id, user, lastFetchTime]);

  const submitApproval = useCallback(async (requestId: string, approved: boolean, notes?: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('meal_plan_approvals')
        .insert({
          approval_request_id: requestId,
          user_id: user.id,
          approved,
          comments: notes,
          responded_at: new Date().toISOString()
        });

      if (error) throw error;

      // Refresh data
      await Promise.all([fetchApprovals(), fetchApprovalRequests()]);
    } catch (err) {
      console.error('Error submitting approval:', err);
      setError('Failed to submit approval');
    }
  }, [user, fetchApprovals, fetchApprovalRequests]);

  const respondToRequest = useCallback(async (requestId: string, approved: boolean, comments?: string) => {
    return submitApproval(requestId, approved, comments);
  }, [submitApproval]);

  const createApprovalRequest = useCallback(async (weekNumber: number, message?: string) => {
    if (!user || !currentHousehold?.id) return;
    
    try {
      const { error } = await supabase
        .from('meal_plan_approval_requests')
        .insert({
          household_id: currentHousehold.id,
          requested_by: user.id,
          week_number: weekNumber,
          message: message,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        });

      if (error) throw error;

      // Refresh data
      await fetchApprovalRequests();
    } catch (err) {
      console.error('Error creating approval request:', err);
      setError('Failed to create approval request');
    }
  }, [user, currentHousehold?.id, fetchApprovalRequests]);

  const getRequestApprovals = useCallback((requestId: string) => {
    return approvals.filter(approval => approval.approval_request_id === requestId);
  }, [approvals]);

  // Initialize data when household changes, but only once per household
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (currentHousehold?.id && user && !isInitialized) {
      console.log('🏠 Initializing meal plan approval context for household:', currentHousehold.id);
      
      // Debounce the initialization to prevent rapid calls
      timeoutId = setTimeout(() => {
        Promise.all([fetchApprovals(), fetchApprovalRequests()]).finally(() => {
          setIsInitialized(true);
        });
      }, 1000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentHousehold?.id, user, isInitialized, fetchApprovals, fetchApprovalRequests]);

  // Reset when household changes
  useEffect(() => {
    setIsInitialized(false);
    setApprovals([]);
    setApprovalRequests([]);
    setError(null);
  }, [currentHousehold?.id]);

  const value = {
    approvals,
    approvalRequests,
    loading,
    error,
    fetchApprovals,
    fetchApprovalRequests,
    submitApproval,
    createApprovalRequest,
    respondToRequest,
    getRequestApprovals,
  };

  return (
    <MealPlanApprovalContext.Provider value={value}>
      {children}
    </MealPlanApprovalContext.Provider>
  );
}

export function useMealPlanApproval() {
  const context = useContext(MealPlanApprovalContext);
  if (context === undefined) {
    throw new Error('useMealPlanApproval must be used within a MealPlanApprovalProvider');
  }
  return context;
}
