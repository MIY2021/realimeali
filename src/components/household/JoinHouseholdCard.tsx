
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const JoinHouseholdCard = () => {
  const { user } = useAuth();
  const { fetchHouseholds, setCurrentHousehold } = useHousehold();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

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
      const cleanCode = inviteCode.trim().toUpperCase();
      console.log("Attempting to join with code:", cleanCode);
      
      // First, let's try a simpler query to check if the invitation exists
      const { data: invitations, error: inviteError } = await supabase
        .from('household_invitations')
        .select('*')
        .eq('invitation_code', cleanCode)
        .eq('status', 'pending');

      console.log("Invitation query result:", { invitations, inviteError });

      if (inviteError) {
        console.error("Database error:", inviteError);
        toast({
          title: "Database Error",
          description: "Failed to check invitation. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!invitations || invitations.length === 0) {
        console.log("No invitations found for code:", cleanCode);
        toast({
          title: "Invalid Code",
          description: "The invitation code is invalid or has expired.",
          variant: "destructive",
        });
        return;
      }

      // Check if invitation is expired
      const invitation = invitations[0];
      const now = new Date();
      const expiresAt = new Date(invitation.expires_at);
      
      if (expiresAt <= now) {
        console.log("Invitation expired:", { expiresAt, now });
        toast({
          title: "Invitation Expired",
          description: "This invitation has expired. Please request a new one.",
          variant: "destructive",
        });
        return;
      }

      console.log("Found valid invitation:", invitation);

      // Get household details
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', invitation.household_id)
        .single();

      if (householdError || !household) {
        console.error("Household lookup error:", householdError);
        toast({
          title: "Error",
          description: "Failed to find the household. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log("Found household:", household);

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', invitation.household_id)
        .eq('user_id', user.id);

      console.log("Existing member check:", { existingMember, memberCheckError });

      if (memberCheckError) {
        console.error("Member check error:", memberCheckError);
        toast({
          title: "Error",
          description: "Failed to check membership. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (existingMember && existingMember.length > 0) {
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
      setCurrentHousehold(household);

      toast({
        title: "Joined Household",
        description: `Successfully joined ${household.name}!`,
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

  return (
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
  );
};
