
import { useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Household, HouseholdMember, HouseholdJoinRequest } from '@/types';

export function useHouseholdData(user: User | null, currentHousehold: Household | null) {
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  
  // Use refs to prevent duplicate requests without causing dependency issues
  const lastFetchedUserIdRef = useRef<string | null>(null);
  const lastFetchedHouseholdIdRef = useRef<string | null>(null);
  const isCurrentlyFetchingUserRef = useRef<boolean>(false);
  const isCurrentlyFetchingMembersRef = useRef<boolean>(false);

  const fetchHousehold = useCallback(async (): Promise<Household | null> => {
    if (!user) {
      console.log('DEBUG: No user found, skipping household fetch');
      return null;
    }

    // Prevent duplicate fetches for the same user
    if (lastFetchedUserIdRef.current === user.id && isCurrentlyFetchingUserRef.current) {
      console.log('DEBUG: Already fetching household for this user, skipping duplicate request');
      return null;
    }

    setIsLoadingHousehold(true);
    isCurrentlyFetchingUserRef.current = true;
    lastFetchedUserIdRef.current = user.id;

    try {
      console.log('DEBUG: Fetching household for user:', user.id);
      
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
        console.log('DEBUG: No household found for user');
        return null;
      }

      console.log('DEBUG: Found household:', memberData.households);
      return memberData.households as Household;
    } catch (error) {
      console.error('Unexpected error fetching household:', error);
      return null;
    } finally {
      setIsLoadingHousehold(false);
      isCurrentlyFetchingUserRef.current = false;
    }
  }, [user?.id]);

  const fetchHouseholdMembers = useCallback(async (): Promise<HouseholdMember[]> => {
    if (!currentHousehold) {
      console.log('DEBUG: No household available, skipping members fetch');
      return [];
    }

    // Prevent duplicate fetches for the same household
    if (lastFetchedHouseholdIdRef.current === currentHousehold.id && isCurrentlyFetchingMembersRef.current) {
      console.log('DEBUG: Already fetching members for this household, skipping duplicate request');
      return [];
    }

    setIsLoadingMembers(true);
    isCurrentlyFetchingMembersRef.current = true;
    lastFetchedHouseholdIdRef.current = currentHousehold.id;

    try {
      console.log('DEBUG: Fetching household members for household:', currentHousehold.id);
      
      // Use a single joined query to get members with their profiles
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          id,
          user_id,
          household_id,
          role,
          joined_at,
          profiles!inner(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('household_id', currentHousehold.id);

      if (error) {
        console.error('Error fetching household members with profiles:', error);
        // Fallback: Try to get members without profiles
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('household_members')
          .select(`
            id,
            user_id,
            household_id,
            role,
            joined_at
          `)
          .eq('household_id', currentHousehold.id);

        if (fallbackError) {
          console.error('Error in fallback fetch:', fallbackError);
          return [];
        }

        console.log('DEBUG: Using fallback data without profiles:', fallbackData?.length || 0);
        
        // Transform fallback data without profiles
        const membersWithoutProfiles: HouseholdMember[] = (fallbackData || []).map(member => ({
          id: member.id,
          user_id: member.user_id,
          household_id: member.household_id,
          role: member.role as 'owner' | 'member',
          joined_at: member.joined_at,
        }));

        return membersWithoutProfiles;
      }

      if (!data) {
        console.log('DEBUG: No members found for household');
        return [];
      }

      // Transform joined data to match HouseholdMember interface
      const membersWithProfiles: HouseholdMember[] = data.map(member => ({
        id: member.id,
        user_id: member.user_id,
        household_id: member.household_id,
        role: member.role as 'owner' | 'member',
        joined_at: member.joined_at,
        profile: member.profiles ? {
          full_name: member.profiles.full_name || null,
          email: member.profiles.email || null,
          avatar_url: member.profiles.avatar_url || null,
        } : undefined
      }));

      console.log('DEBUG: Successfully fetched household members with profiles:', {
        memberCount: membersWithProfiles.length,
        membersWithProfiles: membersWithProfiles.map(m => ({
          id: m.id,
          hasProfile: !!m.profile,
          profileName: m.profile?.full_name
        }))
      });
      
      return membersWithProfiles;
    } catch (error) {
      console.error('Unexpected error fetching household members:', error);
      return [];
    } finally {
      setIsLoadingMembers(false);
      isCurrentlyFetchingMembersRef.current = false;
    }
  }, [currentHousehold?.id]);

  const fetchJoinRequests = useCallback(async (): Promise<HouseholdJoinRequest[]> => {
    if (!currentHousehold) {
      console.log('DEBUG: No household available, skipping join requests fetch');
      return [];
    }

    try {
      console.log('DEBUG: Fetching join requests for household:', currentHousehold.id);
      
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

      console.log('DEBUG: Successfully fetched join requests:', joinRequests.length);
      return joinRequests;
    } catch (error) {
      console.error('Unexpected error fetching join requests:', error);
      return [];
    }
  }, [currentHousehold?.id]);

  return {
    fetchHousehold,
    fetchHouseholdMembers,
    fetchJoinRequests,
    isLoadingHousehold,
    isLoadingMembers,
  };
}
