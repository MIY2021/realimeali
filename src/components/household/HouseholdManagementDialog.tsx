
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHousehold, Household } from "@/contexts/HouseholdContext";
import { Users, UserPlus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HouseholdManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  household: Household;
}

export const HouseholdManagementDialog = ({ 
  open, 
  onOpenChange, 
  household 
}: HouseholdManagementDialogProps) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { inviteToHousehold, joinHousehold, householdMembers } = useHousehold();
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    const invitationCode = await inviteToHousehold(inviteEmail.trim());
    
    if (invitationCode) {
      setInviteEmail("");
      // Copy to clipboard
      navigator.clipboard.writeText(invitationCode);
      toast({
        title: "Invitation Code Copied",
        description: "The invitation code has been copied to your clipboard.",
      });
    }
    
    setIsInviting(false);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;

    setIsJoining(true);
    const success = await joinHousehold(joinCode.trim());
    
    if (success) {
      setJoinCode("");
      onOpenChange(false);
    }
    
    setIsJoining(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage {household.name}
          </DialogTitle>
          <DialogDescription>
            Invite members or join another household.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Members ({householdMembers.length})
            </TabsTrigger>
            <TabsTrigger value="invite" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Invite
            </TabsTrigger>
            <TabsTrigger value="join" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Join
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Household Members</h4>
              {householdMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Loading members...</p>
              ) : (
                <div className="space-y-2">
                  {householdMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{member.user_id}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        member.role === 'owner' ? 'bg-terracotta/20 text-terracotta' : 'bg-sage/20 text-sage'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="invite" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email to invite"
                disabled={isInviting}
              />
            </div>
            <Button 
              onClick={handleInvite} 
              disabled={!inviteEmail.trim() || isInviting}
              className="w-full bg-sage hover:bg-sage/90"
            >
              {isInviting ? "Sending Invitation..." : "Send Invitation"}
            </Button>
          </TabsContent>

          <TabsContent value="join" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="join-code">Invitation Code</Label>
              <Input
                id="join-code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter invitation code"
                disabled={isJoining}
              />
            </div>
            <Button 
              onClick={handleJoin} 
              disabled={!joinCode.trim() || isJoining}
              className="w-full bg-terracotta hover:bg-terracotta/90"
            >
              {isJoining ? "Joining..." : "Join Household"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
