
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";

export interface ApprovalRequest {
  id: string;
  household_id: string;
  week_number: 1 | 2;
  requested_by: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  message?: string;
  created_at: string;
  expires_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  approval_request_id: string;
  user_id: string;
  approved: boolean;
  comments?: string;
  responded_at: string;
}

interface MealPlanApprovalContextType {
  approvalRequests: ApprovalRequest[];
  approvals: Approval[];
  pendingRequests: ApprovalRequest[];
  isLoading: boolean;
  createApprovalRequest: (weekNumber: 1 | 2, message?: string) => Promise<void>;
  respondToRequest: (requestId: string, approved: boolean, comments?: string) => Promise<void>;
  getRequestApprovals: (requestId: string) => Approval[];
}

const MealPlanApprovalContext = createContext<MealPlanApprovalContextType | undefined>(undefined);

export const MealPlanApprovalProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchApprovalRequests = useCallback(async () => {
    if (!user || !currentHousehold) {
      setApprovalRequests([]);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('meal_plan_approval_requests')
        .select('*')
        .eq('household_id', currentHousehold.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure week_number is typed as 1 | 2
      const transformedData: ApprovalRequest[] = (data || []).map(item => ({
        ...item,
        week_number: item.week_number as 1 | 2,
      }));
      
      setApprovalRequests(transformedData);
    } catch (error) {
      console.error('Error fetching approval requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch approval requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentHousehold?.id, toast]);

  const fetchApprovals = useCallback(async () => {
    if (!user || !currentHousehold) {
      setApprovals([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('meal_plan_approvals')
        .select(`
          *,
          approval_request:meal_plan_approval_requests!inner(household_id)
        `)
        .eq('approval_request.household_id', currentHousehold.id);

      if (error) throw error;
      setApprovals(data?.map(item => ({
        id: item.id,
        approval_request_id: item.approval_request_id,
        user_id: item.user_id,
        approved: item.approved,
        comments: item.comments,
        responded_at: item.responded_at,
      })) || []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  }, [user?.id, currentHousehold?.id]);

  useEffect(() => {
    fetchApprovalRequests();
    fetchApprovals();
  }, [fetchApprovalRequests, fetchApprovals]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || !currentHousehold) return;

    const requestsChannel = supabase
      .channel('approval-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_plan_approval_requests',
          filter: `household_id=eq.${currentHousehold.id}`,
        },
        () => {
          fetchApprovalRequests();
        }
      )
      .subscribe();

    const approvalsChannel = supabase
      .channel('approvals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_plan_approvals',
        },
        () => {
          fetchApprovals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(approvalsChannel);
    };
  }, [user?.id, currentHousehold?.id, fetchApprovalRequests, fetchApprovals]);

  const createApprovalRequest = useCallback(async (weekNumber: 1 | 2, message?: string) => {
    if (!user || !currentHousehold) return;

    try {
      const { error } = await supabase
        .from('meal_plan_approval_requests')
        .insert({
          household_id: currentHousehold.id,
          week_number: weekNumber,
          requested_by: user.id,
          message,
        });

      if (error) throw error;

      toast({
        title: "Approval Request Sent",
        description: `Approval request for Week ${weekNumber} has been sent to all household members.`,
      });
    } catch (error) {
      console.error('Error creating approval request:', error);
      toast({
        title: "Error",
        description: "Failed to send approval request.",
        variant: "destructive",
      });
    }
  }, [user?.id, currentHousehold?.id, toast]);

  const respondToRequest = useCallback(async (requestId: string, approved: boolean, comments?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('meal_plan_approvals')
        .upsert({
          approval_request_id: requestId,
          user_id: user.id,
          approved,
          comments,
        });

      if (error) throw error;

      toast({
        title: approved ? "Meal Plan Approved" : "Meal Plan Rejected",
        description: `You have ${approved ? 'approved' : 'rejected'} the meal plan.`,
      });
    } catch (error) {
      console.error('Error responding to approval request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to approval request.",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);

  const getRequestApprovals = useCallback((requestId: string) => {
    return approvals.filter(approval => approval.approval_request_id === requestId);
  }, [approvals]);

  const pendingRequests = approvalRequests.filter(request => 
    request.status === 'pending' && 
    !approvals.some(approval => 
      approval.approval_request_id === request.id && 
      approval.user_id === user?.id
    )
  );

  return (
    <MealPlanApprovalContext.Provider value={{
      approvalRequests,
      approvals,
      pendingRequests,
      isLoading,
      createApprovalRequest,
      respondToRequest,
      getRequestApprovals,
    }}>
      {children}
    </MealPlanApprovalContext.Provider>
  );
};

export const useMealPlanApproval = () => {
  const context = useContext(MealPlanApprovalContext);
  if (context === undefined) {
    throw new Error("useMealPlanApproval must be used within a MealPlanApprovalProvider");
  }
  return context;
};
