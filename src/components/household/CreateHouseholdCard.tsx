
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Plus, AlertCircle } from "lucide-react";

export const CreateHouseholdCard = () => {
  const [householdName, setHouseholdName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createHousehold } = useHousehold();

  const handleCreate = async () => {
    if (!householdName.trim()) {
      setError("Please enter a household name");
      return;
    }

    setIsCreating(true);
    setError(null);
    
    try {
      const success = await createHousehold(householdName.trim());
      
      if (success) {
        setHouseholdName("");
        setError(null);
      } else {
        setError("Failed to create household. Please try again or contact support if the problem persists.");
      }
    } catch (err) {
      console.error("Error creating household:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while creating the household.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating && householdName.trim()) {
      handleCreate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-terracotta" />
          Create New Household
        </CardTitle>
        <CardDescription>
          Start fresh by creating your own household to manage recipes, meal plans, and shopping lists.
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
          <Label htmlFor="household-name">Household Name</Label>
          <Input
            id="household-name"
            value={householdName}
            onChange={(e) => {
              setHouseholdName(e.target.value);
              if (error) setError(null); // Clear error when user starts typing
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter household name (e.g., Smith Family)"
            disabled={isCreating}
          />
        </div>
        <Button 
          onClick={handleCreate} 
          disabled={!householdName.trim() || isCreating}
          className="w-full bg-terracotta hover:bg-terracotta/90"
        >
          {isCreating ? "Creating..." : "Create Household"}
        </Button>
      </CardContent>
    </Card>
  );
};
