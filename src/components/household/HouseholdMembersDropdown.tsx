
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Users } from "lucide-react";

export const HouseholdMembersDropdown = () => {
  const { currentHousehold, householdMembers, isLoadingMembers } = useHousehold();

  if (!currentHousehold) {
    return null;
  }

  const memberCount = householdMembers?.length || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2 p-2">
          <div className="relative">
            <Users className="h-5 w-5 text-navy" />
            {memberCount > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-sage text-white"
              >
                {memberCount}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2 border-b">
          <p className="font-medium text-sm">{currentHousehold.name}</p>
          <p className="text-xs text-muted-foreground">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </p>
        </div>
        
        {isLoadingMembers ? (
          <div className="px-3 py-2">
            <p className="text-sm text-muted-foreground">Loading members...</p>
          </div>
        ) : memberCount === 0 ? (
          <div className="px-3 py-2">
            <p className="text-sm text-muted-foreground">No members found</p>
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {householdMembers.map((member) => (
              <DropdownMenuItem key={member.id} className="flex items-center space-x-3 p-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={member.profile?.avatar_url} 
                    alt={member.profile?.full_name || member.profile?.email}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {(member.profile?.full_name || member.profile?.email)?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.profile?.full_name || member.profile?.email}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {member.role}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
