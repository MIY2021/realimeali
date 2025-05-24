
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHousehold } from "@/contexts/HouseholdContext";

interface CreateHouseholdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateHouseholdDialog = ({ open, onOpenChange }: CreateHouseholdDialogProps) => {
  const [householdName, setHouseholdName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { createHousehold } = useHousehold();

  const handleCreate = async () => {
    if (!householdName.trim()) return;

    setIsCreating(true);
    const success = await createHousehold(householdName.trim());
    
    if (success) {
      setHouseholdName("");
      onOpenChange(false);
    }
    
    setIsCreating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Household</DialogTitle>
          <DialogDescription>
            Create a new household to share meal plans with family or friends.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="household-name">Household Name</Label>
            <Input
              id="household-name"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., The Smith Family"
              disabled={isCreating}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!householdName.trim() || isCreating}
            className="bg-sage hover:bg-sage/90"
          >
            {isCreating ? "Creating..." : "Create Household"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
