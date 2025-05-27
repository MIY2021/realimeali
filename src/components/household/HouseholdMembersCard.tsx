
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HouseholdMember {
  id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  profile?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface HouseholdMembersCardProps {
  members: HouseholdMember[];
  isOwner: boolean;
  onRemoveMember: (memberId: string, memberUserId: string) => void;
  isLoading?: boolean;
}

export const HouseholdMembersCard = ({ members, isOwner, onRemoveMember, isLoading }: HouseholdMembersCardProps) => {
  const { user } = useAuth();

  console.log("HouseholdMembersCard - members:", members);
  console.log("HouseholdMembersCard - members length:", members?.length);
  console.log("HouseholdMembersCard - isLoading:", isLoading);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Household Members</CardTitle>
        <CardDescription>
          View and manage household members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading members...
          </div>
        ) : (
          <div className="space-y-3">
            {(!members || members.length === 0) ? (
              <div className="text-center py-4 text-muted-foreground">
                No household members found
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded gap-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage 
                        src={member.profile?.avatar_url} 
                        alt={member.profile?.full_name || 'User'} 
                      />
                      <AvatarFallback className="bg-terracotta/20 text-terracotta">
                        {member.profile?.full_name 
                          ? member.profile.full_name.charAt(0).toUpperCase()
                          : <User className="h-4 w-4" />
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {member.profile?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.profile?.email || 'No email available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                    {isOwner && member.user_id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMember(member.id, member.user_id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
