import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Plus, AlertCircle, Check } from "lucide-react";

export const CreateHouseholdCard = () => {
  const [householdName, setHouseholdName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { createHousehold } = useHousehold();

  const validateInput = (name: string): string | null => {
    if (!name.trim()) {
      return "Please enter a household name";
    }
    if (name.trim().length < 2) {
      return "Household name must be at least 2 characters long";
    }
    if (name.trim().length > 50) {
      return "Household name cannot be longer than 50 characters";
    }
    return null;
  };

  const handleCreate = async () => {
    const trimmedName = householdName.trim();
    
    // Client-side validation
    const validationError = validateInput(trimmedName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log("Creating household with name:", trimmedName);
      const newHousehold = await createHousehold(trimmedName);
      
      if (newHousehold) {
        setHouseholdName("");
        setError(null);
        setSuccess(`"${trimmedName}" has been created successfully! You can now start adding recipes and planning meals.`);
        console.log("Household created successfully:", newHousehold);
      }
    } catch (err) {
      console.error("Error creating household:", err);
      
      let errorMessage = "An unexpected error occurred while creating the household.";
      
      if (err instanceof Error) {
        // Handle specific error types
        if (err.message.includes("already exists")) {
          errorMessage = "A household with this name already exists for your account. Please choose a different name.";
        } else if (err.message.includes("permission")) {
          errorMessage = "You don't have permission to create households. Please contact support if this issue persists.";
        } else if (err.message.includes("network") || err.message.includes("connection")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (err.message.includes("logged in") || err.message.includes("authenticated")) {
          errorMessage = "You must be logged in to create a household. Please refresh the page and try again.";
        } else if (err.message.includes("characters")) {
          errorMessage = err.message; // Use the specific validation message
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
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
        
        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
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
              if (success) setSuccess(null); // Clear success when user starts typing
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter household name (e.g., Smith Family)"
            disabled={isCreating}
            maxLength={50}
          />
          <div className="text-xs text-muted-foreground">
            {householdName.length}/50 characters
          </div>
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
