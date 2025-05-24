
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InviteMembersCardProps {
  household: {
    id: string;
    name: string;
  };
  householdCode: string;
}

export const InviteMembersCard = ({ household, householdCode }: InviteMembersCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const handleInviteByEmail = async () => {
    if (!household || !inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      // Generate a unique invitation code
      const invitationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data, error } = await supabase
        .from('household_invitations')
        .insert([{
          household_id: household.id,
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

  return (
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
  );
};
