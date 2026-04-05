import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Household, HouseholdMember } from "@/types";
import { useAvatarSync } from "./useAvatarSync";
import { oauthProfilePhotoFromMetadata } from "@/utils/resolveProfilePhotoUrl";

export function useMembersFetch(currentHousehold: Household | null) {
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const { syncGoogleAvatarUrl } = useAvatarSync();
  
  const lastFetchedHouseholdIdRef = useRef<string | null>(null);
  const isCurrentlyFetchingMembersRef = useRef<boolean>(false);

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
      
      console.log("DEBUG MEMBERS: Current auth user:", {
        currentUserId,
        hasOAuthPhoto: !!oauthProfilePhotoFromMetadata(currentAuthUser),
      });

      if (currentUserId && oauthProfilePhotoFromMetadata(currentAuthUser)) {
        console.log("DEBUG MEMBERS: Syncing OAuth avatar before fetching profiles");
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
        
        /* Fruit / preset accounts use emoji only — never surface stale row URLs or OAuth fill-ins. */
        let avatarUrl = profile?.avatar_url ?? null;
        if (profile?.avatar_type === "fruit") {
          avatarUrl = null;
        } else if (
          !avatarUrl &&
          member.user_id === currentUserId &&
          profile?.avatar_type === "google"
        ) {
          avatarUrl = oauthProfilePhotoFromMetadata(currentAuthUser) || null;
          console.log("DEBUG MEMBERS: Using OAuth metadata photo for current Google user:", avatarUrl);
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

  return {
    fetchHouseholdMembers,
    isLoadingMembers,
  };
}
