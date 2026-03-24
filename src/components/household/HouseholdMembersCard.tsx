
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedAvatar } from "@/components/ui/enhanced-avatar";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Trash2, RotateCcw, Edit, Shuffle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PRESET_FOOD_AVATARS } from "@/constants/presetFoodAvatars";

interface HouseholdMember {
  id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  profile?: {
    full_name: string;
    email: string;
    avatar_url?: string;
    avatar_type?: string;
    avatar_data?: string;
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
  const { toast } = useToast();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [refreshingProfiles, setRefreshingProfiles] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [selectedFruit, setSelectedFruit] = useState("");

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

  const handleEditProfile = (member: HouseholdMember) => {
    if (member.user_id !== user?.id) return; // Only allow editing own profile
    
    setEditingProfile(member.user_id);
    setSelectedFruit(member.profile?.avatar_data || '🍎');
  };

  const handleRandomizeFruit = () => {
    const randomIndex = Math.floor(Math.random() * PRESET_FOOD_AVATARS.length);
    setSelectedFruit(PRESET_FOOD_AVATARS[randomIndex]);
  };

  const handleSaveProfileChanges = async () => {
    if (!editingProfile || !user || editingProfile !== user.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_type: 'fruit',
          avatar_data: selectedFruit,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProfile);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your avatar has been updated successfully.",
      });

      setEditingProfile(null);
      // Refresh the page to show updated avatar
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
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
                      <EnhancedAvatar
                        src={member.profile?.avatar_url}
                        alt={member.profile?.full_name || 'User'}
                        fallbackText={member.profile?.full_name}
                        avatarType={member.profile?.avatar_type as any}
                        avatarData={member.profile?.avatar_data}
                        size="md"
                        className="h-10 w-10"
                      />
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
                    
                    {/* Edit Profile Button (only for own profile) */}
                    {member.user_id === user?.id && (
                      <Dialog open={editingProfile === member.user_id} onOpenChange={(open) => {
                        if (!open) setEditingProfile(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProfile(member)}
                            className="text-terracotta hover:text-terracotta"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Your Avatar</DialogTitle>
                            <DialogDescription>
                              Choose a new fruit avatar for your profile.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <EnhancedAvatar
                                avatarType="fruit"
                                avatarData={selectedFruit}
                                size="lg"
                                className="h-16 w-16"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRandomizeFruit}
                                className="flex items-center gap-2"
                              >
                                <Shuffle className="h-4 w-4" />
                                Random
                              </Button>
                            </div>

                            <div className="grid grid-cols-5 gap-2">
                              {PRESET_FOOD_AVATARS.map((fruit) => (
                                <button
                                  key={fruit}
                                  type="button"
                                  onClick={() => setSelectedFruit(fruit)}
                                  className={`h-12 w-12 rounded-lg border-2 flex items-center justify-center text-xl transition-colors ${
                                    selectedFruit === fruit
                                      ? 'border-terracotta bg-terracotta/10'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  {fruit}
                                </button>
                              ))}
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingProfile(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSaveProfileChanges} className="bg-terracotta hover:bg-terracotta/90">
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {/* Remove Member Button (only for owners, not themselves) */}
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
