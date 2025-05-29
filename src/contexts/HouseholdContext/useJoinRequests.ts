
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useJoinRequests = (
  user: User | null,
  fetchJoinRequests: () => Promise<void>
) => {
  const requestToJoinHousehold = useCallback(async (householdCode: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: existingRequest, error: existingRequestError } = await supabase
        .from('household_join_requests')
        .select('*')
        .eq('household_id', householdCode)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingRequestError) {
        console.error('Error checking existing join request:', existingRequestError);
        return false;
      }

      if (existingRequest) {
        console.log('Pending join request already exists for this household.');
        return false;
      }

      const { error } = await supabase
        .from('household_join_requests')
        .insert([
          {
            household_id: householdCode,
            user_id: user.id,
            status: 'pending',
          },
        ]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error requesting to join household:', error);
      return false;
    }
  }, [user]);

  const joinHousehold = useCallback(async (householdId: string): Promise<boolean> => {
    return requestToJoinHousehold(householdId);
  }, [requestToJoinHousehold]);

  const approveJoinRequest = useCallback(async (requestId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('household_join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;
      
      fetchJoinRequests();
      return true;
    } catch (error) {
      console.error('Error approving join request:', error);
      return false;
    }
  }, [fetchJoinRequests]);

  const rejectJoinRequest = useCallback(async (requestId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('household_join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      
      fetchJoinRequests();
      return true;
    } catch (error) {
      console.error('Error rejecting join request:', error);
      return false;
    }
  }, [fetchJoinRequests]);

  return {
    requestToJoinHousehold,
    joinHousehold,
    approveJoinRequest,
    rejectJoinRequest,
  };
};
