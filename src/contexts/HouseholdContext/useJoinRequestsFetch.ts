
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Household, HouseholdJoinRequest } from '@/types';

export function useJoinRequestsFetch(currentHousehold: Household | null) {
  const fetchJoinRequests = useCallback(async (): Promise<HouseholdJoinRequest[]> => {
    if (!currentHousehold) {
      console.log('DEBUG JOIN: No household available, skipping join requests fetch');
      return [];
    }

    try {
      console.log('DEBUG JOIN: Fetching join requests for household:', currentHousehold.id);
      
      const { data, error } = await supabase
        .from('household_join_requests')
        .select(`
          id,
          user_id,
          household_id,
          status,
          created_at,
          updated_at
        `)
        .eq('household_id', currentHousehold.id)
        .eq('status', 'pending');

      if (error) {
        console.error('DEBUG JOIN: Error fetching join requests:', error);
        return [];
      }

      // Transform data to match HouseholdJoinRequest interface
      const joinRequests: HouseholdJoinRequest[] = (data || []).map(request => ({
        id: request.id,
        user_id: request.user_id,
        household_id: request.household_id,
        status: request.status as 'pending' | 'approved' | 'rejected',
        created_at: request.created_at,
        updated_at: request.updated_at
      }));

      console.log('DEBUG JOIN: Successfully fetched join requests:', joinRequests.length);
      return joinRequests;
    } catch (error) {
      console.error('DEBUG JOIN: Unexpected error fetching join requests:', error);
      return [];
    }
  }, [currentHousehold?.id]);

  return {
    fetchJoinRequests,
  };
}
