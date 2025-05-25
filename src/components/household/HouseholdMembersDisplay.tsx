
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Users } from "lucide-react";
import { useHouseholdMembers } from "@/hooks/useHouseholdMembers";
import { useHousehold } from "@/contexts/HouseholdContext";

export const HouseholdMembersDisplay = () => {
  const { currentHousehold } = useHousehold();
  const { members, isLoading } = useHouseholdMembers(currentHousehold?.id || null);

  if (!currentHousehold || isLoading) {
    return null;
  }

  if (members.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>No members</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{members.length}</span>
        </div>
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((member) => (
            <Tooltip key={member.id}>
              <TooltipTrigger>
                <Avatar className="h-8 w-8 border-2 border-background hover:scale-105 transition-transform">
                  <AvatarImage 
                    src={member.profile?.avatar_url} 
                    alt={member.profile?.full_name || 'User'} 
                  />
                  <AvatarFallback className="bg-terracotta/20 text-terracotta text-xs">
                    {member.profile?.full_name 
                      ? member.profile.full_name.charAt(0).toUpperCase()
                      : <User className="h-3 w-3" />
                    }
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{member.profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          {members.length > 4 && (
            <Tooltip>
              <TooltipTrigger>
                <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                  +{members.length - 4}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{members.length - 4} more member{members.length - 4 > 1 ? 's' : ''}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
