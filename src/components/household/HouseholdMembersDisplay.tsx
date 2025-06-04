
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Loader } from "lucide-react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { EnhancedAvatar } from "@/components/ui/enhanced-avatar";
import { Badge } from "@/components/ui/badge";

export const HouseholdMembersDisplay = () => {
  const { currentHousehold, householdMembers, isLoadingMembers } = useHousehold();

  // Enhanced debug logging
  console.log('HouseholdMembersDisplay render - DETAILED DEBUG:', {
    timestamp: new Date().toISOString(),
    hasHousehold: !!currentHousehold,
    householdId: currentHousehold?.id,
    householdName: currentHousehold?.name,
    membersCount: householdMembers?.length || 0,
    isLoading: isLoadingMembers,
    rawMembers: householdMembers,
    membersDetails: householdMembers?.map(m => ({
      id: m.id,
      userId: m.user_id,
      role: m.role,
      name: m.profile?.full_name,
      email: m.profile?.email,
      avatarUrl: m.profile?.avatar_url,
      avatarType: m.profile?.avatar_type,
      avatarData: m.profile?.avatar_data,
      authProvider: m.profile?.auth_provider,
      hasProfile: !!m.profile
    }))
  });

  if (!currentHousehold) {
    console.log('HouseholdMembersDisplay: No household found, not rendering');
    return null;
  }

  // Show loading state while members are being fetched
  if (isLoadingMembers) {
    console.log('HouseholdMembersDisplay: Showing loading state');
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader className="h-4 w-4 animate-spin" />
        <span>Loading members...</span>
      </div>
    );
  }

  // Always show something, even if no members (which shouldn't happen)
  const membersToShow = householdMembers || [];
  const memberCount = membersToShow.length;

  console.log('HouseholdMembersDisplay: Rendering with data:', {
    memberCount,
    shouldRender: memberCount > 0,
    firstThreeMembers: membersToShow.slice(0, 3).map(m => ({
      id: m.id,
      name: m.profile?.full_name,
      avatarUrl: m.profile?.avatar_url,
      avatarType: m.profile?.avatar_type,
      avatarData: m.profile?.avatar_data
    }))
  });

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {memberCount === 0 ? (
            <Tooltip>
              <TooltipTrigger>
                <div className="h-8 w-8 rounded-full border-2 border-white bg-terracotta/20 flex items-center justify-center shadow-sm">
                  <User className="h-4 w-4 text-terracotta" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>No members found</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              {membersToShow.slice(0, 3).map((member, index) => {
                console.log(`HouseholdMembersDisplay: Rendering avatar for member ${index}:`, {
                  memberId: member.id,
                  name: member.profile?.full_name,
                  avatarUrl: member.profile?.avatar_url,
                  avatarType: member.profile?.avatar_type,
                  avatarData: member.profile?.avatar_data,
                  hasProfile: !!member.profile
                });

                return (
                  <Tooltip key={member.id}>
                    <TooltipTrigger>
                      <div className="relative" style={{ zIndex: 10 - index }}>
                        <EnhancedAvatar
                          src={member.profile?.avatar_url}
                          alt={member.profile?.full_name || 'User'}
                          fallbackText={member.profile?.full_name}
                          avatarType={member.profile?.avatar_type as 'google' | 'uploaded' | 'fruit' || 'fruit'}
                          avatarData={member.profile?.avatar_data}
                          size="sm"
                          className="border-2 border-white hover:scale-105 transition-transform shadow-sm"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-medium">{member.profile?.full_name || 'Unknown User'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {memberCount > 3 && (
                <div className="h-8 w-8 rounded-full border-2 border-white bg-muted flex items-center justify-center text-xs font-medium shadow-sm">
                  +{memberCount - 3}
                </div>
              )}
            </>
          )}
        </div>
        <Badge variant="secondary" className="h-6 px-2 text-xs font-medium bg-gray-100 text-gray-700">
          {memberCount}
        </Badge>
      </div>
    </TooltipProvider>
  );
};
