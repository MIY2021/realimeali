
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
import { MealType } from "@/types";

interface FreetypeMealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (mealName: string, mealType: MealType) => void;
  mealType: MealType;
}

export const FreetypeMealDialog = ({
  isOpen,
  onClose,
  onAddMeal,
  mealType,
}: FreetypeMealDialogProps) => {
  const [mealName, setMealName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mealName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onAddMeal(mealName.trim(), mealType);
      setMealName("");
      onClose();
    } catch (error) {
      console.error("Error adding freetyped meal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMealName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Custom Meal</DialogTitle>
            <DialogDescription>
              Add a custom meal for {mealType} (e.g., "Tesco Ready Meal", "Pizza Delivery").
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="meal-name" className="text-right">
                Meal Name
              </Label>
              <Input
                id="meal-name"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="Enter meal name..."
                className="col-span-3"
                maxLength={100}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!mealName.trim() || isLoading}
            >
              {isLoading ? "Adding..." : "Add Meal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
