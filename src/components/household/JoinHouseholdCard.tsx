
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
  const [householdCode, setHouseholdCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinByCode = async () => {
    console.log("=== JOIN HOUSEHOLD DEBUG START ===");
    console.log("User:", user);
    console.log("Household code:", householdCode);
    
    if (!user) {
      console.log("ERROR: No user found");
      toast({
        title: "Authentication Required", 
        description: "Please log in to join a household.",
        variant: "destructive",
      });
      return;
    }

    if (!householdCode.trim()) {
      console.log("ERROR: No household code provided");
      toast({
        title: "Code Required",
        description: "Please enter a household code.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      const cleanCode = householdCode.trim().toUpperCase();
      console.log("Attempting to join with household code:", cleanCode);
      
      // Get all households and filter by code in JavaScript
      const { data: households, error: householdError } = await supabase
        .from('households')
        .select('*');

      console.log("All households query result:", { households, householdError });

      if (householdError) {
        console.error("Household lookup error:", householdError);
        toast({
          title: "Error",
          description: "Failed to find household. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Find household where the first 6 characters of the ID match the code
      const matchingHousehold = households?.find(h => 
        h.id.slice(0, 6).toUpperCase() === cleanCode
      );

      console.log("Matching household:", matchingHousehold);

      if (!matchingHousehold) {
        console.log("No household found for code:", cleanCode);
        toast({
          title: "Invalid Code",
          description: "The household code is invalid. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', matchingHousehold.id)
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
          household_id: matchingHousehold.id,
          user_id: user.id,
          role: 'member'
        }]);

      if (memberError) {
        console.error("Member insert error:", memberError);
        throw memberError;
      }

      console.log("User successfully added to household");

      console.log("Refreshing households...");
      // Refresh households and set current
      await fetchHouseholds();
      setCurrentHousehold(matchingHousehold);

      toast({
        title: "Joined Household",
        description: `Successfully joined ${matchingHousehold.name}!`,
      });
      
      setHouseholdCode("");
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
          Enter a household code to join an existing household.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="householdCode">Household Code</Label>
          <Input
            id="householdCode"
            value={householdCode}
            onChange={(e) => {
              console.log("Household code changed:", e.target.value);
              setHouseholdCode(e.target.value);
            }}
            placeholder="Enter household code (e.g., A040CB)"
            maxLength={6}
            disabled={isJoining}
          />
        </div>
        <Button 
          onClick={() => {
            console.log("Join button clicked");
            handleJoinByCode();
          }} 
          disabled={!householdCode.trim() || isJoining}
          className="w-full bg-terracotta hover:bg-terracotta/90"
        >
          {isJoining ? "Joining..." : "Join Household"}
        </Button>
      </CardContent>
    </Card>
  );
};
