
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Copy, Trash2 } from "lucide-react";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HouseholdMember {
  id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  profile?: {
    full_name: string;
    email: string;
  };
}

export default function Household() {
  const { user } = useAuth();
  const { currentHousehold, households, setCurrentHousehold } = useHousehold();
  const { toast } = useToast();
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  useEffect(() => {
    if (currentHousehold) {
      setHouseholdName(currentHousehold.name);
      fetchMembers();
    }
  }, [currentHousehold]);

  const fetchMembers = async () => {
    if (!currentHousehold) return;

    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq('household_id', currentHousehold.id);

      if (error) throw error;

      // Fetch user profiles for each member
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(member.user_id);
            return {
              ...member,
              profile: {
                full_name: userData.user?.user_metadata?.full_name || userData.user?.email || 'Unknown User',
                email: userData.user?.email || 'No email'
              }
            };
          } catch (err) {
            console.error('Error fetching user data:', err);
            return {
              ...member,
              profile: {
                full_name: 'Unknown User',
                email: 'No email'
              }
            };
          }
        })
      );

      setMembers(membersWithProfiles);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch household members.",
        variant: "destructive",
      });
    }
  };

  const handleInviteByEmail = async () => {
    if (!currentHousehold || !inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const { data, error } = await supabase
        .from('household_invitations')
        .insert([{
          household_id: currentHousehold.id,
          email: inviteEmail.trim(),
          invited_by: user?.id,
          invitation_code: Math.random().toString(36).substring(2, 8).toUpperCase()
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}. They can join using code: ${data.invitation_code}`,
      });
      
      setInviteEmail("");
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!user || !inviteCode.trim()) return;

    try {
      // Find the invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('household_invitations')
        .select('*')
        .eq('invitation_code', inviteCode.trim().toUpperCase())
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (inviteError || !invitation) {
        toast({
          title: "Invalid Code",
          description: "Invitation code not found or expired.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', invitation.household_id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast({
          title: "Already a Member",
          description: "You are already a member of this household.",
          variant: "destructive",
        });
        return;
      }

      // Add user to household
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: invitation.household_id,
          user_id: user.id,
          role: 'member'
        }]);

      if (memberError) throw memberError;

      // Update invitation status
      await supabase
        .from('household_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      // Get the household details
      const { data: household } = await supabase
        .from('households')
        .select('*')
        .eq('id', invitation.household_id)
        .single();

      if (household) {
        setCurrentHousehold(household);
      }

      toast({
        title: "Joined Household",
        description: "Successfully joined the household!",
      });
      
      setInviteCode("");
    } catch (error) {
      console.error("Error joining household:", error);
      toast({
        title: "Error",
        description: "Failed to join household. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateHouseholdName = async () => {
    if (!currentHousehold || !householdName.trim()) return;

    setIsUpdatingName(true);
    try {
      const { error } = await supabase
        .from('households')
        .update({ name: householdName.trim() })
        .eq('id', currentHousehold.id);

      if (error) throw error;

      setCurrentHousehold({ ...currentHousehold, name: householdName.trim() });
      
      toast({
        title: "Household Updated",
        description: "Household name has been updated.",
      });
    } catch (error) {
      console.error("Error updating household:", error);
      toast({
        title: "Error",
        description: "Failed to update household name.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (!currentHousehold || memberUserId === user?.id) return;

    const confirmed = window.confirm("Are you sure you want to remove this member?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('id', memberId)
        .eq('household_id', currentHousehold.id);

      if (error) throw error;

      setMembers(prev => prev.filter(m => m.id !== memberId));
      
      toast({
        title: "Member Removed",
        description: "Member has been removed from the household.",
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member.",
        variant: "destructive",
      });
    }
  };

  const isOwner = currentHousehold && members.find(m => m.user_id === user?.id)?.role === 'owner';

  if (!user) {
    return (
      <div className="container max-w-lg py-8">
        <p className="text-center text-muted-foreground">Please log in to manage households.</p>
      </div>
    );
  }

  if (!currentHousehold) {
    return (
      <div className="container max-w-lg py-8">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-6 w-6 text-terracotta" />
          <h1 className="text-2xl font-bold text-navy">Household Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Join a Household</CardTitle>
            <CardDescription>
              Enter an invitation code to join an existing household.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invitation Code</Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invitation code"
              />
            </div>
            <Button onClick={handleJoinByCode} className="w-full bg-terracotta hover:bg-terracotta/90">
              Join Household
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg py-8">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-terracotta" />
        <h1 className="text-2xl font-bold text-navy">Household Management</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Household Details</CardTitle>
            <CardDescription>
              Manage your household information and settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="householdName">Household Name</Label>
              <div className="flex gap-2">
                <Input
                  id="householdName"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  disabled={!isOwner}
                />
                {isOwner && (
                  <Button 
                    onClick={handleUpdateHouseholdName}
                    disabled={isUpdatingName || householdName.trim() === currentHousehold.name}
                    size="sm"
                  >
                    {isUpdatingName ? "Saving..." : "Save"}
                  </Button>
                )}
              </div>
              {!isOwner && (
                <p className="text-sm text-muted-foreground">
                  Only the household owner can change the name.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

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
                    <div className="h-8 w-8 rounded-full bg-terracotta/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-terracotta" />
                    </div>
                    <div>
                      <p className="font-medium">{member.profile?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
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
                        onClick={() => handleRemoveMember(member.id, member.user_id)}
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

        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Invite Members</CardTitle>
              <CardDescription>
                Invite new members to join your household using their Google account email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email Address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <Button 
                onClick={handleInviteByEmail}
                disabled={isInviting || !inviteEmail.trim()}
                className="w-full bg-terracotta hover:bg-terracotta/90"
              >
                {isInviting ? "Sending..." : "Send Invitation"}
              </Button>
              <p className="text-sm text-muted-foreground">
                The person will receive an invitation code that they can use to join your household.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
