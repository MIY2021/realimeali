
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Household, HouseholdMember, HouseholdJoinRequest } from '@/types';

export function useHouseholdData(user: User | null, currentHousehold: Household | null) {
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const fetchHousehold = useCallback(async (): Promise<Household | null> => {
    if (!user) {
      console.log('No user found, skipping household fetch');
      return null;
    }

    setIsLoadingHousehold(true);
    try {
      console.log('Fetching household for user:', user.id);
      
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
        console.error('Error fetching household membership:', memberError);
        return null;
      }

      if (!memberData?.households) {
        console.log('No household found for user');
        return null;
      }

      console.log('Found household:', memberData.households);
      return memberData.households as Household;
    } catch (error) {
      console.error('Unexpected error fetching household:', error);
      return null;
    } finally {
      setIsLoadingHousehold(false);
    }
  }, [user]);

  const fetchHouseholdMembers = useCallback(async (): Promise<HouseholdMember[]> => {
    if (!currentHousehold) {
      console.log('No household available, skipping members fetch');
      return [];
    }

    setIsLoadingMembers(true);
    try {
      console.log('Fetching household members for household:', currentHousehold.id);
      
      // Try the query with a simpler approach first
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          id,
          user_id,
          household_id,
          role,
          joined_at
        `)
        .eq('household_id', currentHousehold.id);

      if (error) {
        console.error('Error fetching household members:', error);
        return [];
      }

      if (!data) {
        console.log('No members found for household');
        return [];
      }

      // Fetch profile data separately to avoid complex joins
      const memberIds = data.map(member => member.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', memberIds);

      if (profileError) {
        console.error('Error fetching member profiles:', profileError);
        // Continue without profile data
      }

      // Combine member data with profile data
      const membersWithProfiles = data.map(member => ({
        ...member,
        profiles: profiles?.find(profile => profile.id === member.user_id) || null
      }));

      console.log('Successfully fetched household members:', membersWithProfiles.length);
      return membersWithProfiles as HouseholdMember[];
    } catch (error) {
      console.error('Unexpected error fetching household members:', error);
      return [];
    } finally {
      setIsLoadingMembers(false);
    }
  }, [currentHousehold]);

  const fetchJoinRequests = useCallback(async (): Promise<HouseholdJoinRequest[]> => {
    if (!currentHousehold) {
      console.log('No household available, skipping join requests fetch');
      return [];
    }

    try {
      console.log('Fetching join requests for household:', currentHousehold.id);
      
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
        console.error('Error fetching join requests:', error);
        return [];
      }

      console.log('Successfully fetched join requests:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching join requests:', error);
      return [];
    }
  }, [currentHousehold]);

  return {
    fetchHousehold,
    fetchHouseholdMembers,
    fetchJoinRequests,
    isLoadingHousehold,
    isLoadingMembers,
  };
}
