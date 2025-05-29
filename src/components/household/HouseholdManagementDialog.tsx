
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
import { useHousehold } from "@/contexts/HouseholdContext";
import { Household } from "@/types";
import { Users, User, Pencil } from "lucide-react";
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
  const [isRequesting, setIsRequesting] = useState(false);
  const { requestToJoinHousehold, householdMembers } = useHousehold();
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    // Note: This would need to be implemented if email invitations are still desired
    toast({
      title: "Feature Not Available",
      description: "Email invitations are not currently available. Share the household code instead.",
      variant: "destructive",
    });
    setIsInviting(false);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;

    setIsRequesting(true);
    const success = await requestToJoinHousehold(joinCode.trim());
    
    if (success) {
      setJoinCode("");
      onOpenChange(false);
    }
    
    setIsRequesting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Manage {household.name}
          </DialogTitle>
          <DialogDescription>
            View members or request to join another household.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Members ({householdMembers.length})
            </TabsTrigger>
            <TabsTrigger value="join" className="flex items-center gap-1">
              <User className="h-4 w-4" />
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
                      <span className="text-sm">{member.userId}</span>
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

          <TabsContent value="join" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="join-code">Household Code</Label>
              <Input
                id="join-code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter household code"
                disabled={isRequesting}
              />
            </div>
            <Button 
              onClick={handleJoin} 
              disabled={!joinCode.trim() || isRequesting}
              className="w-full bg-terracotta hover:bg-terracotta/90"
            >
              {isRequesting ? "Sending Request..." : "Send Join Request"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
