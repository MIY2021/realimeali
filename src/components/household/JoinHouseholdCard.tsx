
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";

export const JoinHouseholdCard = () => {
  const { user } = useAuth();
  const { requestToJoinHousehold } = useHousehold();
  const { toast } = useToast();
  const [householdCode, setHouseholdCode] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestJoin = async () => {
    if (!user) {
      toast({
        title: "Authentication Required", 
        description: "Please log in to join a household.",
        variant: "destructive",
      });
      return;
    }

    if (!householdCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter a household code.",
        variant: "destructive",
      });
      return;
    }

    setIsRequesting(true);
    try {
      const success = await requestToJoinHousehold(householdCode.trim());
      if (success) {
        setHouseholdCode("");
      }
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request to Join a Household</CardTitle>
        <CardDescription>
          Enter a household code to send a join request. The household owner will need to approve your request.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="householdCode">Household Code</Label>
          <Input
            id="householdCode"
            value={householdCode}
            onChange={(e) => setHouseholdCode(e.target.value)}
            placeholder="Enter household code (e.g., A040CB)"
            maxLength={6}
            disabled={isRequesting}
          />
        </div>
        <Button 
          onClick={handleRequestJoin} 
          disabled={!householdCode.trim() || isRequesting}
          className="w-full bg-terracotta hover:bg-terracotta/90"
        >
          {isRequesting ? "Sending Request..." : "Send Join Request"}
        </Button>
      </CardContent>
    </Card>
  );
};
