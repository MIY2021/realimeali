
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User, Trash2, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

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
  onRemoveMember: (memberId: string, memberUserId: string) => Promise<boolean>;
  isLoading?: boolean;
}

export const HouseholdMembersCard = ({ members, isOwner, onRemoveMember, isLoading }: HouseholdMembersCardProps) => {
  const { user } = useAuth();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [refreshingProfiles, setRefreshingProfiles] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  const handleImageError = (memberId: string, avatar_url?: string) => {
    console.error(`Avatar image failed to load for member ${memberId}:`, {
      memberId,
      avatar_url,
      timestamp: new Date().toISOString()
    });
    
    setImageErrors(prev => new Set(prev).add(memberId));
  };

  const handleImageLoad = (memberId: string, avatar_url?: string) => {
    console.log(`Avatar image loaded successfully for member ${memberId}:`, {
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

  const refreshProfileData = async () => {
    setRefreshingProfiles(true);
    try {
      // Force a refresh of the household context data
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing profile data:', error);
    } finally {
      setRefreshingProfiles(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string, memberName: string) => {
    console.log("HouseholdMembersCard: Attempting to remove member", { memberId, memberUserId, memberName });
    
    setRemovingMember(memberId);
    try {
      const success = await onRemoveMember(memberId, memberUserId);
      console.log("Remove member result:", success);
      
      if (!success) {
        console.error('Failed to remove member - onRemoveMember returned false');
      }
    } catch (error) {
      console.error('Error in handleRemoveMember:', error);
    } finally {
      setRemovingMember(null);
    }
  };

  // Log member data for debugging
  console.log('HouseholdMembersCard - Member data:', {
    totalMembers: members.length,
    members: members.map(m => ({
      id: m.id,
      user_id: m.user_id,
      role: m.role,
      profile: {
        full_name: m.profile?.full_name,
        email: m.profile?.email,
        avatar_url: m.profile?.avatar_url,
        hasAvatarUrl: !!m.profile?.avatar_url
      }
    })),
    imageErrors: Array.from(imageErrors),
    timestamp: new Date().toISOString()
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Household Members</CardTitle>
            <CardDescription>
              View and manage household members.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshProfileData}
            disabled={refreshingProfiles}
            className="text-terracotta hover:text-terracotta"
          >
            <RotateCcw className={`h-4 w-4 mr-2 ${refreshingProfiles ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
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
                    <div className="relative">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage 
                          src={member.profile?.avatar_url} 
                          alt={member.profile?.full_name || 'User'}
                          onError={() => handleImageError(member.id, member.profile?.avatar_url)}
                          onLoad={() => handleImageLoad(member.id, member.profile?.avatar_url)}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-terracotta/20 text-terracotta">
                          {member.profile?.full_name 
                            ? member.profile.full_name.charAt(0).toUpperCase()
                            : <User className="h-4 w-4" />
                          }
                        </AvatarFallback>
                      </Avatar>
                      {imageErrors.has(member.id) && member.profile?.avatar_url && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" 
                             title="Avatar failed to load" />
                      )}
                    </div>
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={removingMember === member.id}
                            className="text-red-500 hover:text-red-700"
                          >
                            {removingMember === member.id ? (
                              <RotateCcw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove <strong>{member.profile?.full_name || 'this member'}</strong> from the household? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(member.id, member.user_id, member.profile?.full_name || 'Unknown User')}
                              className="bg-red-500 hover:bg-red-600"
                              disabled={removingMember === member.id}
                            >
                              {removingMember === member.id ? "Removing..." : "Remove Member"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
