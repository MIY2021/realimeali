
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Plus } from "lucide-react";

export const CreateHouseholdCard = () => {
  const [householdName, setHouseholdName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { createHousehold } = useHousehold();

  const handleCreate = async () => {
    if (!householdName.trim()) return;

    setIsCreating(true);
    const success = await createHousehold(householdName.trim());
    
    if (success) {
      setHouseholdName("");
    }
    
    setIsCreating(false);
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
        <div className="space-y-2">
          <Label htmlFor="household-name">Household Name</Label>
          <Input
            id="household-name"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
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
