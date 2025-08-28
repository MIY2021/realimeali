import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Search } from 'lucide-react';
import { ImportedRecipe } from '@/services/importedRecipeService';

interface AddRecipeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: ImportedRecipe | null;
  onViewRecipe?: (recipeId: string) => void;
  onContinueBrowsing?: () => void;
}

export function AddRecipeConfirmDialog({
  open,
  onOpenChange,
  recipe,
  onViewRecipe,
  onContinueBrowsing
}: AddRecipeConfirmDialogProps) {
  const handleViewRecipe = () => {
    if (recipe && onViewRecipe) {
      onViewRecipe(recipe.id);
    }
    onOpenChange(false);
  };

  const handleContinueBrowsing = () => {
    if (onContinueBrowsing) {
      onContinueBrowsing();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-xl">Recipe Added!</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{recipe?.title}</span> has been successfully added to your household recipes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={handleViewRecipe} className="w-full">
            <ArrowRight className="w-4 h-4 mr-2" />
            View Recipe
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleContinueBrowsing} 
            className="w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            Continue Browsing Recipes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}