
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const CreateTestHouseholdCard = () => {
  const { user } = useAuth();
  const { fetchHouseholds } = useHousehold();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createTestHousehold = async () => {
    if (!user) return;

    setIsCreating(true);
    try {
      // Create a test household
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert([{
          name: 'Test Household',
          created_by: user.id
        }])
        .select()
        .single();

      if (householdError) throw householdError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: household.id,
          user_id: user.id,
          role: 'owner'
        }]);

      if (memberError) throw memberError;

      // Create a test invitation
      const { error: inviteError } = await supabase
        .from('household_invitations')
        .insert([{
          household_id: household.id,
          email: 'test@example.com',
          invited_by: user.id,
          invitation_code: 'A040CB'
        }]);

      if (inviteError) throw inviteError;

      await fetchHouseholds();

      toast({
        title: "Test Household Created",
        description: "Test household created with invitation code A040CB",
      });
    } catch (error) {
      console.error("Error creating test household:", error);
      toast({
        title: "Error",
        description: "Failed to create test household.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Test Household</CardTitle>
        <CardDescription>
          Create a test household with invitation code A040CB for testing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={createTestHousehold}
          disabled={isCreating}
          className="w-full bg-terracotta hover:bg-terracotta/90"
        >
          {isCreating ? "Creating..." : "Create Test Household"}
        </Button>
      </CardContent>
    </Card>
  );
};
