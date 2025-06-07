
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { useIsMobile } from "@/hooks/use-mobile";

interface CommunityRecipeSubmissionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    title: string;
    description: string;
    source_url: string; // This should be the original external URL
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
  const isMobile = useIsMobile();
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
      // Extract domain for image credit - use the original source URL
      let imageCredit: string | undefined;
      try {
        const url = new URL(initialData.source_url);
        imageCredit = initialData.image_url ? `Image from ${url.hostname}` : undefined;
      } catch (error) {
        console.warn('Could not parse source URL for image credit:', initialData.source_url);
        imageCredit = initialData.image_url ? 'Image from source website' : undefined;
      }

      const success = await submitCommunityRecipe({
        title: formData.title,
        description: formData.description,
        source_url: initialData.source_url, // Use the original external URL
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
      <DialogContent className={`${isMobile ? 'sm:max-w-[95vw] h-[90vh] overflow-y-auto' : 'sm:max-w-[500px]'}`}>
        <DialogHeader className={`${isMobile ? 'pb-2' : ''}`}>
          <DialogTitle className={`${isMobile ? 'text-lg' : ''}`}>Share Recipe with RealiMeali Community</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '3' : '4'}`}>
          <div>
            <Label htmlFor="title" className={`${isMobile ? 'text-sm' : ''}`}>Recipe Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className={`${isMobile ? 'text-sm' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="description" className={`${isMobile ? 'text-sm' : ''}`}>
              Description
              <span className="text-sm text-muted-foreground ml-2">(For moderation reference)</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this recipe (helps our moderators understand the recipe)..."
              rows={isMobile ? 2 : 3}
              className={`${isMobile ? 'text-sm' : ''}`}
            />
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1`}>
              This helps our team understand your recipe for approval
            </p>
          </div>

          {/* Show the source URL to the user for transparency */}
          <div>
            <Label className={`${isMobile ? 'text-sm' : ''}`}>Original Source</Label>
            <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border break-all">
              {initialData.source_url}
            </div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1`}>
              This is the original website where the recipe was found
            </p>
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
            <div>
              <Label htmlFor="category" className={`${isMobile ? 'text-sm' : ''}`}>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className={`${isMobile ? 'text-sm' : ''}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className={`${isMobile ? 'text-sm' : ''}`}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cuisine" className={`${isMobile ? 'text-sm' : ''}`}>Cuisine</Label>
              <Select value={formData.cuisine} onValueChange={(value) => setFormData({ ...formData, cuisine: value })}>
                <SelectTrigger className={`${isMobile ? 'text-sm' : ''}`}>
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {cuisines.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine} className={`${isMobile ? 'text-sm' : ''}`}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="difficulty" className={`${isMobile ? 'text-sm' : ''}`}>Difficulty Level</Label>
            <Select value={formData.difficulty_level} onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}>
              <SelectTrigger className={`${isMobile ? 'text-sm' : ''}`}>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficultyLevels.map((level) => (
                  <SelectItem key={level} value={level} className={`${isMobile ? 'text-sm' : ''}`}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={`bg-blue-50 p-${isMobile ? '3' : '4'} rounded-lg ${isMobile ? 'text-xs' : 'text-sm'} space-y-2`}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <p className="font-medium">AI-Enhanced Content</p>
            </div>
            <p className="text-muted-foreground">
              Our team will review your submission and generate original, copyright-safe descriptions and images for public display. 
              Only the recipe title, metadata, and source link will be shared publicly.
            </p>
          </div>

          <div className={`bg-gray-50 p-3 rounded-lg ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <p className="font-medium mb-1">Recipe will be submitted for review</p>
            <p className="text-muted-foreground">
              Your recipe will appear in the community once approved by our moderation team.
              The full recipe stays on the original site - we only share the link and our AI-generated summary.
            </p>
          </div>

          <div className={`flex ${isMobile ? 'flex-col' : 'gap-2'} pt-4`}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className={`${isMobile ? 'mb-2' : ''}`}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className={`${isMobile ? '' : 'flex-1'}`}
            >
              {isSubmitting ? "Submitting..." : "Submit to Community"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
