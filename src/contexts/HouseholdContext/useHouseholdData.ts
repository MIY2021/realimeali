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

  const syncGoogleAvatarUrl = useCallback(async (userId: string) => {
    try {
      console.log('DEBUG AVATAR SYNC: Starting sync for user:', userId);
      
      // Get the current user's auth data to access Google avatar
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      console.log('DEBUG AVATAR SYNC: Auth user data:', {
        authUserId: authUser?.id,
        targetUserId: userId,
        hasAvatarUrl: !!authUser?.user_metadata?.avatar_url,
        avatarUrl: authUser?.user_metadata?.avatar_url
      });
      
      if (authUser?.id === userId && authUser?.user_metadata?.avatar_url) {
        console.log('DEBUG AVATAR SYNC: Syncing Google avatar for user:', userId, authUser.user_metadata.avatar_url);
        
        // Update the profile with the Google avatar URL
        const { error } = await supabase
          .from('profiles')
          .update({ 
            avatar_url: authUser.user_metadata.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('DEBUG AVATAR SYNC: Error syncing Google avatar:', error);
        } else {
          console.log('DEBUG AVATAR SYNC: Successfully synced Google avatar to profiles table');
        }
      } else {
        console.log('DEBUG AVATAR SYNC: Skipping sync - not current user or no avatar URL');
      }
    } catch (error) {
      console.error('DEBUG AVATAR SYNC: Error in syncGoogleAvatarUrl:', error);
    }
  }, []);

  const fetchHouseholdMembers = useCallback(async (): Promise<HouseholdMember[]> => {
    if (!currentHousehold) {
      console.log('DEBUG MEMBERS: No household available, skipping members fetch');
      return [];
    }

    console.log('DEBUG MEMBERS: Starting fetch for household:', currentHousehold.id);

    // Reset loading state and prevent duplicate fetches
    if (isCurrentlyFetchingMembersRef.current) {
      console.log('DEBUG MEMBERS: Already fetching members, skipping duplicate request');
      return [];
    }

    setIsLoadingMembers(true);
    isCurrentlyFetchingMembersRef.current = true;
    lastFetchedHouseholdIdRef.current = currentHousehold.id;

    try {
      console.log('DEBUG MEMBERS: Fetching household members for household:', currentHousehold.id);
      
      // First, get the household members
      const { data: membersData, error: membersError } = await supabase
        .from('household_members')
        .select(`
          id,
          user_id,
          household_id,
          role,
          joined_at
        `)
        .eq('household_id', currentHousehold.id);

      if (membersError) {
        console.error('DEBUG MEMBERS: Error fetching household members:', membersError);
        return [];
      }

      if (!membersData || membersData.length === 0) {
        console.warn('DEBUG MEMBERS: No members found for household - this should not happen!', {
          householdId: currentHousehold.id,
          householdName: currentHousehold.name,
          createdBy: currentHousehold.created_by
        });
        return [];
      }

      console.log('DEBUG MEMBERS: Found members data:', {
        count: membersData.length,
        members: membersData.map(m => ({ id: m.id, user_id: m.user_id, role: m.role }))
      });

      // Get current user info for syncing
      const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
      const currentUserId = currentAuthUser?.id;
      
      console.log('DEBUG MEMBERS: Current auth user:', {
        currentUserId,
        hasAvatarUrl: !!currentAuthUser?.user_metadata?.avatar_url,
        avatarUrl: currentAuthUser?.user_metadata?.avatar_url
      });

      // Sync Google avatar for current user if needed
      if (currentUserId && currentAuthUser?.user_metadata?.avatar_url) {
        console.log('DEBUG MEMBERS: Syncing Google avatar before fetching profiles');
        await syncGoogleAvatarUrl(currentUserId);
      }

      // Then get profiles for these users with all avatar fields
      const userIds = membersData.map(member => member.user_id);
      console.log('DEBUG MEMBERS: Fetching profiles for user IDs:', userIds);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          auth_provider,
          avatar_type,
          avatar_data
        `)
        .in('id', userIds);

      if (profilesError) {
        console.error('DEBUG MEMBERS: Error fetching profiles:', profilesError);
      }

      console.log('DEBUG MEMBERS: Found profiles data:', {
        count: profilesData?.length || 0,
        profiles: profilesData?.map(p => ({
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          avatar_type: p.avatar_type,
          avatar_data: p.avatar_data,
          auth_provider: p.auth_provider
        }))
      });

      // Combine members with their profiles
      const membersWithProfiles: HouseholdMember[] = membersData.map(member => {
        const profile = profilesData?.find(p => p.id === member.user_id);
        
        // For Google users, ensure we have their avatar URL
        let avatarUrl = profile?.avatar_url;
        if (!avatarUrl && profile?.auth_provider === 'google' && member.user_id === currentUserId) {
          avatarUrl = currentAuthUser?.user_metadata?.avatar_url || null;
          console.log('DEBUG MEMBERS: Using auth avatar URL for current Google user:', avatarUrl);
        }
        
        const memberWithProfile = {
          id: member.id,
          user_id: member.user_id,
          household_id: member.household_id,
          role: member.role as 'owner' | 'member',
          joined_at: member.joined_at,
          profile: profile ? {
            full_name: profile.full_name || null,
            email: profile.email || null,
            avatar_url: avatarUrl,
            auth_provider: profile.auth_provider || null,
            avatar_type: profile.avatar_type || null,
            avatar_data: profile.avatar_data || null,
          } : undefined
        };

        console.log('DEBUG MEMBERS: Processing member:', {
          memberId: member.id,
          userId: member.user_id,
          role: member.role,
          hasProfile: !!profile,
          profileName: profile?.full_name,
          originalAvatarUrl: profile?.avatar_url,
          finalAvatarUrl: avatarUrl,
          avatarType: profile?.avatar_type,
          avatarData: profile?.avatar_data,
          authProvider: profile?.auth_provider,
          isCurrentUser: member.user_id === currentUserId
        });

        return memberWithProfile;
      });

      console.log('DEBUG MEMBERS: Successfully processed household members:', {
        memberCount: membersWithProfiles.length,
        householdId: currentHousehold.id,
        membersWithAvatars: membersWithProfiles.filter(m => m.profile?.avatar_url || m.profile?.avatar_data).length,
        allMembers: membersWithProfiles.map(m => ({
          id: m.id,
          name: m.profile?.full_name,
          hasAvatar: !!(m.profile?.avatar_url || m.profile?.avatar_data),
          avatarType: m.profile?.avatar_type,
          avatarUrl: m.profile?.avatar_url
        }))
      });
      
      return membersWithProfiles;
    } catch (error) {
      console.error('DEBUG MEMBERS: Unexpected error fetching household members:', error);
      return [];
    } finally {
      setIsLoadingMembers(false);
      isCurrentlyFetchingMembersRef.current = false;
    }
  }, [currentHousehold?.id, syncGoogleAvatarUrl]);

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
    fetchHousehold,
    fetchHouseholdMembers,
    fetchJoinRequests,
    isLoadingHousehold,
    isLoadingMembers,
  };
}
