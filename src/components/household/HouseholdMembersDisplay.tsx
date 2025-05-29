
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Users } from "lucide-react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useState } from "react";

export const HouseholdMembersDisplay = () => {
  const { currentHousehold, householdMembers, isLoadingMembers } = useHousehold();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (memberId: string, avatar_url?: string) => {
    console.error(`Avatar image failed to load in HouseholdMembersDisplay for member ${memberId}:`, {
      memberId,
      avatar_url,
      timestamp: new Date().toISOString()
    });
    
    setImageErrors(prev => new Set(prev).add(memberId));
  };

  const handleImageLoad = (memberId: string, avatar_url?: string) => {
    console.log(`Avatar image loaded successfully in HouseholdMembersDisplay for member ${memberId}:`, {
      memberId,
      avatar_url,
      timestamp: new Date().toISOString()
    });
    
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(memberId);
      return newSet;
    });
  };

  if (!currentHousehold || isLoadingMembers) {
    return null;
  }

  if (householdMembers.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>No members</span>
      </div>
    );
  }

  // Log member data for debugging
  console.log('HouseholdMembersDisplay - Member data:', {
    householdId: currentHousehold.id,
    totalMembers: householdMembers.length,
    members: householdMembers.map(m => ({
      id: m.id,
      user_id: m.user_id,
      profile: {
        full_name: m.profile?.full_name,
        avatar_url: m.profile?.avatar_url,
        hasAvatarUrl: !!m.profile?.avatar_url
      }
    })),
    imageErrors: Array.from(imageErrors),
    timestamp: new Date().toISOString()
  });

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{householdMembers.length}</span>
        </div>
        <div className="flex -space-x-2">
          {householdMembers.slice(0, 4).map((member) => (
            <Tooltip key={member.id}>
              <TooltipTrigger>
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-background hover:scale-105 transition-transform">
                    <AvatarImage 
                      src={member.profile?.avatar_url} 
                      alt={member.profile?.full_name || 'User'}
                      onError={() => handleImageError(member.id, member.profile?.avatar_url)}
                      onLoad={() => handleImageLoad(member.id, member.profile?.avatar_url)}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-terracotta/20 text-terracotta text-xs">
                      {member.profile?.full_name 
                        ? member.profile.full_name.charAt(0).toUpperCase()
                        : <User className="h-3 w-3" />
                      }
                    </AvatarFallback>
                  </Avatar>
                  {imageErrors.has(member.id) && member.profile?.avatar_url && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" 
                         title="Avatar failed to load" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{member.profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                  {member.profile?.avatar_url && (
                    <p className="text-xs text-muted-foreground">
                      Avatar: {imageErrors.has(member.id) ? '❌ Failed' : '✅ Loaded'}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          {householdMembers.length > 4 && (
            <Tooltip>
              <TooltipTrigger>
                <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                  +{householdMembers.length - 4}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{householdMembers.length - 4} more member{householdMembers.length - 4 > 1 ? 's' : ''}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
