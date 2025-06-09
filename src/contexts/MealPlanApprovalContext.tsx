
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useHousehold } from './HouseholdContext';
import { supabase } from '@/integrations/supabase/client';

interface MealPlanApproval {
  id: string;
  approval_request_id: string;
  user_id: string;
  approved: boolean;
  notes?: string;
  created_at: string;
  approval_request?: {
    id: string;
    household_id: string;
    requested_by: string;
    meal_plan_data: any;
    status: string;
    created_at: string;
  };
}

interface MealPlanApprovalRequest {
  id: string;
  household_id: string;
  requested_by: string;
  meal_plan_data: any;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface MealPlanApprovalContextType {
  approvals: MealPlanApproval[];
  approvalRequests: MealPlanApprovalRequest[];
  loading: boolean;
  error: string | null;
  fetchApprovals: () => Promise<void>;
  fetchApprovalRequests: () => Promise<void>;
  submitApproval: (requestId: string, approved: boolean, notes?: string) => Promise<void>;
  createApprovalRequest: (mealPlanData: any) => Promise<void>;
}

const MealPlanApprovalContext = createContext<MealPlanApprovalContextType | undefined>(undefined);

export function MealPlanApprovalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  
  const [approvals, setApprovals] = useState<MealPlanApproval[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<MealPlanApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoized fetch functions to prevent infinite loops
  const fetchApprovals = useCallback(async () => {
    if (!currentHousehold?.id || !user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching meal plan approvals for household:', currentHousehold.id);
      
      const { data, error: fetchError } = await supabase
        .from('meal_plan_approvals')
        .select(`
          *,
          approval_request:meal_plan_approval_requests!inner(household_id)
        `)
        .eq('approval_request.household_id', currentHousehold.id);

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
  }, [currentHousehold?.id, user]);

  const fetchApprovalRequests = useCallback(async () => {
    if (!currentHousehold?.id || !user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching meal plan approval requests for household:', currentHousehold.id);
      
      const { data, error: fetchError } = await supabase
        .from('meal_plan_approval_requests')
        .select('*')
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
  }, [currentHousehold?.id, user]);

  const submitApproval = useCallback(async (requestId: string, approved: boolean, notes?: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('meal_plan_approvals')
        .insert({
          approval_request_id: requestId,
          user_id: user.id,
          approved,
          notes
        });

      if (error) throw error;

      // Refresh data
      await Promise.all([fetchApprovals(), fetchApprovalRequests()]);
    } catch (err) {
      console.error('Error submitting approval:', err);
      setError('Failed to submit approval');
    }
  }, [user, fetchApprovals, fetchApprovalRequests]);

  const createApprovalRequest = useCallback(async (mealPlanData: any) => {
    if (!user || !currentHousehold?.id) return;
    
    try {
      const { error } = await supabase
        .from('meal_plan_approval_requests')
        .insert({
          household_id: currentHousehold.id,
          requested_by: user.id,
          meal_plan_data: mealPlanData,
          status: 'pending'
        });

      if (error) throw error;

      // Refresh data
      await fetchApprovalRequests();
    } catch (err) {
      console.error('Error creating approval request:', err);
      setError('Failed to create approval request');
    }
  }, [user, currentHousehold?.id, fetchApprovalRequests]);

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
      }, 500);
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
