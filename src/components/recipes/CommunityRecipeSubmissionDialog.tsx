
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";

interface CommunityRecipeSubmissionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    title: string;
    description: string;
    source_url: string;
    image_url?: string;
    prep_time: number;
    cook_time: number;
    servings: number;
  };
}

const categories = [
  "Breakfast", "Lunch", "Dinner", "Appetizer", "Dessert", "Snack", 
  "Beverage", "Soup", "Salad", "Side Dish", "Main Course"
];

const cuisines = [
  "American", "Italian", "Chinese", "Mexican", "Indian", "French", 
  "Thai", "Greek", "Japanese", "Mediterranean", "British", "Korean", 
  "Vietnamese", "Spanish", "Other"
];

const difficultyLevels = ["Easy", "Medium", "Hard"];

export function CommunityRecipeSubmissionDialog({ 
  isOpen, 
  onOpenChange, 
  initialData 
}: CommunityRecipeSubmissionDialogProps) {
  const { submitCommunityRecipe } = useCommunityRecipes();
  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description,
    category: "",
    cuisine: "",
    difficulty_level: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Extract domain for image credit
      const url = new URL(initialData.source_url);
      const imageCredit = initialData.image_url ? `Image from ${url.hostname}` : undefined;

      const success = await submitCommunityRecipe({
        title: formData.title,
        description: formData.description,
        source_url: initialData.source_url,
        image_url: initialData.image_url,
        image_credit: imageCredit,
        prep_time: initialData.prep_time,
        cook_time: initialData.cook_time,
        servings: initialData.servings,
        category: formData.category || undefined,
        cuisine: formData.cuisine || undefined,
        difficulty_level: formData.difficulty_level || undefined,
      });

      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Recipe with RealiMeali Community</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Recipe Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this recipe..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cuisine">Cuisine</Label>
              <Select value={formData.cuisine} onValueChange={(value) => setFormData({ ...formData, cuisine: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {cuisines.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={formData.difficulty_level} onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficultyLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">Recipe will be submitted for review</p>
            <p className="text-muted-foreground">
              Your recipe will appear in the community once approved by our moderation team.
              Only the recipe metadata and link will be shared - the full recipe stays on the original site.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit to Community"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
