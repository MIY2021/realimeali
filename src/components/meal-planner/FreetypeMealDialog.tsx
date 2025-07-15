import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MealType } from "@/types";

interface FreetypeMealDialogProps {
  mealType: MealType;
  onAddFreetypeMeal: (mealName: string, servings: number) => void;
  onCancel: () => void;
}

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch", 
  dinner: "Dinner",
  snacks: "Snacks",
  sides: "Sides",
  desserts: "Desserts",
  drinks: "Drinks"
};

export function FreetypeMealDialog({
  mealType,
  onAddFreetypeMeal,
  onCancel,
}: FreetypeMealDialogProps) {
  const [mealName, setMealName] = useState("");
  const [servings, setServings] = useState([2]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mealName.trim()) {
      onAddFreetypeMeal(mealName.trim(), servings[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">
          Add Custom {MEAL_TYPE_LABELS[mealType]}
        </h3>
        <p className="text-sm text-muted-foreground">
          Enter a custom meal name (e.g., "Tesco Chicken Tikka Masala", "Pizza delivery", etc.)
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="meal-name">Meal Name</Label>
          <Input
            id="meal-name"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder="Enter meal name..."
            autoFocus
          />
        </div>
        
        <div className="space-y-4">
          <Label>Servings: {servings[0]}</Label>
          <Slider
            value={servings}
            onValueChange={setServings}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!mealName.trim()}>
            Add Meal
          </Button>
        </div>
      </form>
    </div>
  );
}