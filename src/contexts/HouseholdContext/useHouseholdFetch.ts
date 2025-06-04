
import { useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Household } from '@/types';

export function useHouseholdFetch(user: User | null) {
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);
  
  // Use refs to prevent duplicate requests without causing dependency issues
  const lastFetchedUserIdRef = useRef<string | null>(null);
  const isCurrentlyFetchingUserRef = useRef<boolean>(false);

  const fetchHousehold = useCallback(async (): Promise<Household | null> => {
    if (!user) {
      console.log('DEBUG HOUSEHOLD: No user found, skipping household fetch');
      return null;
    }

    // Prevent duplicate fetches for the same user
    if (lastFetchedUserIdRef.current === user.id && isCurrentlyFetchingUserRef.current) {
      console.log('DEBUG HOUSEHOLD: Already fetching household for this user, skipping duplicate request');
      return null;
    }

    setIsLoadingHousehold(true);
    isCurrentlyFetchingUserRef.current = true;
    lastFetchedUserIdRef.current = user.id;

    try {
      console.log('DEBUG HOUSEHOLD: Fetching household for user:', user.id);
      
      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .select(`
          household_id,
          households!inner(
            id,
            name,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (memberError) {
        console.error('DEBUG HOUSEHOLD: Error fetching household membership:', memberError);
        return null;
      }

      if (!memberData?.households) {
        console.log('DEBUG HOUSEHOLD: No household found for user');
        return null;
      }

      const household = memberData.households as Household;
      console.log('DEBUG HOUSEHOLD: Found household:', {
        id: household.id,
        name: household.name,
        created_by: household.created_by
      });
      return household;
    } catch (error) {
      console.error('DEBUG HOUSEHOLD: Unexpected error fetching household:', error);
      return null;
    } finally {
      setIsLoadingHousehold(false);
      isCurrentlyFetchingUserRef.current = false;
    }
  }, [user?.id]);

  return {
    fetchHousehold,
    isLoadingHousehold,
  };
}
