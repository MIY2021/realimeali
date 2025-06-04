
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Loader } from "lucide-react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { EnhancedAvatar } from "@/components/ui/enhanced-avatar";

export const HouseholdMembersDisplay = () => {
  const { currentHousehold, householdMembers, isLoadingMembers } = useHousehold();

  if (!currentHousehold) {
    return null;
  }

  // Show loading state while members are being fetched
  if (isLoadingMembers) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader className="h-4 w-4 animate-spin" />
        <span>Loading members...</span>
      </div>
    );
  }

  // Log member data for debugging
  console.log('HouseholdMembersDisplay - Current state:', {
    householdId: currentHousehold.id,
    householdName: currentHousehold.name,
    totalMembers: householdMembers.length,
    isLoadingMembers,
    members: householdMembers.map(m => ({
      id: m.id,
      user_id: m.user_id,
      role: m.role,
      profile: {
        full_name: m.profile?.full_name,
        avatar_url: m.profile?.avatar_url,
        avatar_type: m.profile?.avatar_type,
        avatar_data: m.profile?.avatar_data,
        auth_provider: m.profile?.auth_provider
      }
    })),
    timestamp: new Date().toISOString()
  });

  // Show member avatars if we have members, otherwise show placeholder
  if (householdMembers.length === 0) {
    return (
      <TooltipProvider>
        <div className="flex -space-x-2">
          <Tooltip>
            <TooltipTrigger>
              <div className="h-8 w-8 rounded-full border-2 border-background bg-terracotta/20 flex items-center justify-center">
                <User className="h-4 w-4 text-terracotta" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>No members found</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex -space-x-2">
        {householdMembers.map((member) => (
          <Tooltip key={member.id}>
            <TooltipTrigger>
              <div className="relative">
                <EnhancedAvatar
                  src={member.profile?.avatar_url}
                  alt={member.profile?.full_name || 'User'}
                  fallbackText={member.profile?.full_name}
                  avatarType={member.profile?.avatar_type as 'google' | 'uploaded' | 'fruit' || 'fruit'}
                  avatarData={member.profile?.avatar_data}
                  size="sm"
                  className="border-2 border-background hover:scale-105 transition-transform"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <p className="font-medium">{member.profile?.full_name || 'Unknown User'}</p>
                <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                <p className="text-xs text-muted-foreground">
                  Avatar: {member.profile?.avatar_type || 'default'}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
