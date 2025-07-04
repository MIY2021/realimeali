import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MealType } from "@/types";
import { useImageGeneration } from "@/hooks/useImageGeneration";

interface CustomMealDialogProps {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  onAddCustomMeal: (mealName: string, servings: number, imageUrl?: string) => void;
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

const PLACEHOLDER_IMAGE = "/placeholder.svg";

export function CustomMealDialog({
  open,
  onClose,
  mealType,
  onAddCustomMeal,
}: CustomMealDialogProps) {
  const [mealName, setMealName] = useState("");
  const [servings, setServings] = useState([2]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState("");

  const { handleGenerateImage } = useImageGeneration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    // Start image generation in the background
    if (mealName.trim()) {
      handleGenerateImage(
        mealName,
        setGeneratedImageUrl,
        setGeneratedImageUrl,
        setIsGeneratingImage,
        setGenerationProgress
      );
    }

    // Add the meal immediately with placeholder image
    onAddCustomMeal(mealName.trim(), servings[0], generatedImageUrl || PLACEHOLDER_IMAGE);
    
    // Reset form
    setMealName("");
    setServings([2]);
    setGeneratedImageUrl(null);
    setGenerationProgress("");
    onClose();
  };

  const handleClose = () => {
    setMealName("");
    setServings([2]);
    setGeneratedImageUrl(null);
    setGenerationProgress("");
    setIsGeneratingImage(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom {MEAL_TYPE_LABELS[mealType]}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="meal-name">Meal Name</Label>
            <Input
              id="meal-name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="e.g., Tesco Chicken Tikka Masala"
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

          {isGeneratingImage && generationProgress && (
            <div className="text-sm text-muted-foreground text-center p-2 bg-muted rounded-md">
              {generationProgress}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!mealName.trim()}>
              Add Custom Meal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}