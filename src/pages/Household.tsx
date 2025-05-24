import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const { currentHousehold, households, setCurrentHousehold, fetchHouseholds } = useHousehold();
  const { toast } = useToast();
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [householdCode, setHouseholdCode] = useState("");

  useEffect(() => {
    if (currentHousehold) {
      setHouseholdName(currentHousehold.name);
      fetchMembers();
      generateHouseholdCode();
    }
  }, [currentHousehold]);

  const generateHouseholdCode = () => {
    if (currentHousehold) {
      // Generate a simple 6-character code based on household ID
      const code = currentHousehold.id.slice(0, 6).toUpperCase();
      setHouseholdCode(code);
    }
  };

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

      // For each member, get their Google profile info from user metadata
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          try {
            // Get user info from auth.users table using RPC or direct query
            const { data: userQuery } = await supabase
              .from('household_members')
              .select('user_id')
              .eq('user_id', member.user_id)
              .single();

            if (userQuery) {
              // Get user metadata from the auth system
              const { data: { user: authUser } } = await supabase.auth.getUser();
              
              if (authUser && authUser.id === member.user_id) {
                return {
                  ...member,
                  profile: {
                    full_name: authUser.user_metadata?.full_name || authUser.email || 'Unknown User',
                    email: authUser.email || 'No email'
                  }
                };
              }
            }

            // Fallback for other users - we can't access their metadata directly
            return {
              ...member,
              profile: {
                full_name: `User ${member.user_id.slice(0, 8)}`,
                email: 'Private'
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
      // Generate a unique invitation code
      const invitationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data, error } = await supabase
        .from('household_invitations')
        .insert([{
          household_id: currentHousehold.id,
          email: inviteEmail.trim(),
          invited_by: user?.id,
          invitation_code: invitationCode
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}. Share this code: ${invitationCode}`,
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
    console.log("=== JOIN HOUSEHOLD DEBUG START ===");
    console.log("User:", user);
    console.log("Invite code:", inviteCode);
    console.log("Is joining:", isJoining);
    
    if (!user) {
      console.log("ERROR: No user found");
      toast({
        title: "Authentication Required", 
        description: "Please log in to join a household.",
        variant: "destructive",
      });
      return;
    }

    if (!inviteCode.trim()) {
      console.log("ERROR: No invite code provided");
      toast({
        title: "Code Required",
        description: "Please enter an invitation code.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      console.log("Attempting to join with code:", inviteCode.trim().toUpperCase());
      
      // Find invitation by code
      const { data: invitation, error: inviteError } = await supabase
        .from('household_invitations')
        .select('*, households(*)')
        .eq('invitation_code', inviteCode.trim().toUpperCase())
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      console.log("Invitation query result:", { invitation, inviteError });

      if (inviteError || !invitation) {
        console.error("Invitation lookup error:", inviteError);
        toast({
          title: "Invalid Code",
          description: "The invitation code is invalid or has expired.",
          variant: "destructive",
        });
        return;
      }

      console.log("Found valid invitation:", invitation);

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', invitation.household_id)
        .eq('user_id', user.id)
        .single();

      console.log("Existing member check:", { existingMember, memberCheckError });

      if (existingMember) {
        console.log("User is already a member");
        toast({
          title: "Already a Member",
          description: "You are already a member of this household.",
          variant: "destructive",
        });
        return;
      }

      console.log("Adding user to household...");
      // Add user to household
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: invitation.household_id,
          user_id: user.id,
          role: 'member'
        }]);

      if (memberError) {
        console.error("Member insert error:", memberError);
        throw memberError;
      }

      console.log("User successfully added to household");

      // Update invitation status
      const { error: updateError } = await supabase
        .from('household_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (updateError) {
        console.error("Invitation update error:", updateError);
      }

      console.log("Refreshing households...");
      // Refresh households and set current
      await fetchHouseholds();
      setCurrentHousehold(invitation.households);

      toast({
        title: "Joined Household",
        description: `Successfully joined ${invitation.households.name}!`,
      });
      
      setInviteCode("");
      console.log("=== JOIN HOUSEHOLD SUCCESS ===");
    } catch (error) {
      console.error("Error joining household:", error);
      toast({
        title: "Error",
        description: "Failed to join household. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
      console.log("=== JOIN HOUSEHOLD DEBUG END ===");
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
                onChange={(e) => {
                  console.log("Invite code changed:", e.target.value);
                  setInviteCode(e.target.value);
                }}
                placeholder="Enter invitation code"
                maxLength={10}
                disabled={isJoining}
              />
            </div>
            <Button 
              onClick={() => {
                console.log("Join button clicked");
                handleJoinByCode();
              }} 
              disabled={!inviteCode.trim() || isJoining}
              className="w-full bg-terracotta hover:bg-terracotta/90"
            >
              {isJoining ? "Joining..." : "Join Household"}
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

            <div className="space-y-2">
              <Label>Household Code</Label>
              <div className="flex gap-2">
                <Input value={householdCode} readOnly />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(householdCode);
                    toast({ title: "Code copied to clipboard!" });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this code with others to invite them to your household.
              </p>
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
                Invite new members to join your household using their email address.
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
                The person will receive your household code ({householdCode}) to join.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
