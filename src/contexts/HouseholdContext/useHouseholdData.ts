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
      
      // Fetch household members with only existing fields
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

      // Transform data to match HouseholdMember interface
      const membersWithProfiles: HouseholdMember[] = data.map(member => ({
        id: member.id,
        user_id: member.user_id,
        household_id: member.household_id,
        role: member.role as 'owner' | 'member',
        joined_at: member.joined_at,
        profile: profiles?.find(profile => profile.id === member.user_id) ? {
          full_name: profiles.find(profile => profile.id === member.user_id)?.full_name || null,
          email: profiles.find(profile => profile.id === member.user_id)?.email || null,
          avatar_url: profiles.find(profile => profile.id === member.user_id)?.avatar_url || null,
        } : undefined
      }));

      console.log('Successfully fetched household members:', membersWithProfiles.length);
      return membersWithProfiles;
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

      // Transform data to match HouseholdJoinRequest interface
      const joinRequests: HouseholdJoinRequest[] = (data || []).map(request => ({
        id: request.id,
        user_id: request.user_id,
        household_id: request.household_id,
        status: request.status as 'pending' | 'approved' | 'rejected',
        created_at: request.created_at,
        updated_at: request.updated_at
      }));

      console.log('Successfully fetched join requests:', joinRequests.length);
      return joinRequests;
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
