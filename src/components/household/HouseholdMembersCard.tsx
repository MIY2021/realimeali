
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
}

export const HouseholdMembersCard = ({ members, isOwner, onRemoveMember }: HouseholdMembersCardProps) => {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Household Members</CardTitle>
        <CardDescription>
          View and manage household members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
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
                <div>
                  <p className="font-medium">
                    {member.profile?.full_name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.profile?.email || 'No email'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
