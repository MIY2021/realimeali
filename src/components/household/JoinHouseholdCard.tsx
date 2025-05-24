
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";

export const JoinHouseholdCard = () => {
  const { user } = useAuth();
  const { requestToJoinHousehold } = useHousehold();
  const { toast } = useToast();
  const [householdCode, setHouseholdCode] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestJoin = async () => {
    if (!user) {
      const errorMsg = "Please log in to join a household.";
      setError(errorMsg);
      toast({
        title: "Authentication Required", 
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    if (!householdCode.trim()) {
      const errorMsg = "Please enter a household code.";
      setError(errorMsg);
      toast({
        title: "Code Required",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setIsRequesting(true);
    setError(null);
    
    try {
      console.log("Attempting to join household with code:", householdCode.trim());
      const success = await requestToJoinHousehold(householdCode.trim());
      
      if (success) {
        setHouseholdCode("");
        setError(null);
        console.log("Successfully sent join request");
      } else {
        const errorMsg = "Failed to send join request. Please check the household code and try again.";
        setError(errorMsg);
        console.log("Join request failed");
      }
    } catch (err) {
      console.error("Error in handleRequestJoin:", err);
      const errorMsg = "An unexpected error occurred. Please try again later.";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
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
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="householdCode">Household Code</Label>
          <Input
            id="householdCode"
            value={householdCode}
            onChange={(e) => {
              setHouseholdCode(e.target.value);
              if (error) setError(null); // Clear error when user starts typing
            }}
            placeholder="Enter household code"
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
