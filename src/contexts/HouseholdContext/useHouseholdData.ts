
import { User } from '@supabase/supabase-js';
import { Household } from '@/types';
import { useHouseholdFetch } from './useHouseholdFetch';
import { useMembersFetch } from './useMembersFetch';
import { useJoinRequestsFetch } from './useJoinRequestsFetch';

export function useHouseholdData(user: User | null, currentHousehold: Household | null) {
  const { fetchHousehold, isLoadingHousehold } = useHouseholdFetch(user);
  const { fetchHouseholdMembers, isLoadingMembers } = useMembersFetch(currentHousehold);
  const { fetchJoinRequests } = useJoinRequestsFetch(currentHousehold);

  return {
    fetchHousehold,
    fetchHouseholdMembers,
    fetchJoinRequests,
    isLoadingHousehold,
    isLoadingMembers,
  };
}
