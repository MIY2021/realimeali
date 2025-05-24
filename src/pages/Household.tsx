
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Users, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HouseholdSelector } from "@/components/household/HouseholdSelector";
import { CreateHouseholdDialog } from "@/components/household/CreateHouseholdDialog";

export default function Household() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { currentHousehold, inviteToHousehold, joinHousehold, householdMembers } = useHousehold();
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    const invitationCode = await inviteToHousehold(inviteEmail.trim());
    
    if (invitationCode) {
      setInviteEmail("");
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
    }
    
    setIsJoining(false);
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-terracotta" />
          <h1 className="text-2xl font-bold text-navy">Manage Household</h1>
        </div>
        <HouseholdSelector />
      </div>

      {!currentHousehold ? (
        <Card>
          <CardHeader>
            <CardTitle>No Household Selected</CardTitle>
            <CardDescription>
              Create a new household or join an existing one to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="w-full bg-terracotta hover:bg-terracotta/90"
            >
              <User className="h-4 w-4 mr-2" />
              Create New Household
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Members ({householdMembers.length})
            </TabsTrigger>
            <TabsTrigger value="invite" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Invite
            </TabsTrigger>
            <TabsTrigger value="join" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Join
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Household Members</CardTitle>
                <CardDescription>
                  Current members of {currentHousehold.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {householdMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading members...</p>
                ) : (
                  <div className="space-y-3">
                    {householdMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-sage/20 flex items-center justify-center">
                            <Users className="h-4 w-4 text-sage" />
                          </div>
                          <span className="font-medium">{member.user_id}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          member.role === 'owner' ? 'bg-terracotta/20 text-terracotta' : 'bg-sage/20 text-sage'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invite" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invite New Member</CardTitle>
                <CardDescription>
                  Send an invitation to someone to join your household. They'll need a Google account to sign in.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Google Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter their Google email address"
                    disabled={isInviting}
                  />
                </div>
                <Button 
                  onClick={handleInvite} 
                  disabled={!inviteEmail.trim() || isInviting}
                  className="w-full bg-sage hover:bg-sage/90"
                >
                  <User className="h-4 w-4 mr-2" />
                  {isInviting ? "Sending Invitation..." : "Send Invitation"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  An invitation code will be generated and copied to your clipboard to share with them.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Join Another Household</CardTitle>
                <CardDescription>
                  Enter an invitation code to join someone else's household.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Users className="h-4 w-4 mr-2" />
                  {isJoining ? "Joining..." : "Join Household"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <CreateHouseholdDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
