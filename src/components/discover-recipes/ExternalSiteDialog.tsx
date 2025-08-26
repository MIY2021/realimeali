import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, ArrowLeft, Plus, Check } from "lucide-react";
import { EdamamRecipe } from "@/types/edamam";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExternalSiteDialogProps {
  recipe: EdamamRecipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExternalSiteDialog({ recipe, open, onOpenChange }: ExternalSiteDialogProps) {
  const [step, setStep] = useState<'warning' | 'welcome-back' | 'adding' | 'success'>('warning');
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();

  // Reset step when dialog opens
  useEffect(() => {
    if (open && recipe) {
      setStep('warning');
    }
  }, [open, recipe]);

  // Handle window focus to detect return from external site
  useEffect(() => {
    const handleFocus = () => {
      // Only trigger welcome-back if dialog is open and we're on warning step
      if (open && step === 'warning' && recipe) {
        // Small delay to ensure external site had time to load
        setTimeout(() => {
          setStep('welcome-back');
        }, 500);
      }
    };

    if (open) {
      window.addEventListener('focus', handleFocus);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [open, step, recipe]);

  const handleVisitSite = () => {
    if (!recipe) return;
    
    // Open external site
    window.open(recipe.url, '_blank', 'noopener,noreferrer');
  };

  const handleAddToMyRecipes = async () => {
    if (!recipe || !user || !currentHousehold) return;

    setIsAdding(true);
    setStep('adding');

    try {
      // Convert Edamam recipe to our recipe format
      const newRecipe = {
        title: recipe.label,
        description: `Imported from ${recipe.source}`,
        ingredients: recipe.ingredientLines || [],
        instructions: [`Visit ${recipe.source} for full instructions: ${recipe.url}`],
        prep_time: Math.floor(recipe.totalTime / 2) || 15, // Estimate prep time
        cook_time: Math.floor(recipe.totalTime / 2) || 15, // Estimate cook time
        servings: recipe.yield || 4,
        image_url: recipe.image,
        source_url: recipe.url,
        source_name: recipe.source,
        user_id: user.id,
        household_id: currentHousehold.id,
        is_public: false,
        meal_types: [], // User can categorize later
      };

      const { error } = await supabase
        .from('recipes')
        .insert([newRecipe]);

      if (error) {
        throw error;
      }

      setStep('success');
      
      toast({
        title: "Recipe Added!",
        description: `"${recipe.label}" has been added to your recipes.`,
      });

    } catch (error) {
      console.error('Error adding recipe:', error);
      toast({
        title: "Error Adding Recipe",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setStep('welcome-back');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('warning');
  };

  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {step === 'warning' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Leaving RealiMeali
              </DialogTitle>
              <DialogDescription>
                You're about to visit {recipe.source} to view the full recipe for "{recipe.label}".
              </DialogDescription>
            </DialogHeader>
            
            <Alert>
              <AlertDescription>
                This will open a new tab. When you're done viewing the recipe, come back to this tab to optionally save it to your collection.
              </AlertDescription>
            </Alert>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleVisitSite} className="bg-terracotta hover:bg-terracotta/90">
                <Link className="h-4 w-4 mr-2" />
                Visit {recipe.source}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'welcome-back' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Welcome Back!
              </DialogTitle>
              <DialogDescription>
                How was the recipe for "{recipe.label}"? Would you like to add it to your recipe collection?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <img 
                  src={recipe.image} 
                  alt={recipe.label}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{recipe.label}</p>
                  <p className="text-xs text-muted-foreground">from {recipe.source}</p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                No Thanks
              </Button>
              <Button 
                onClick={handleAddToMyRecipes}
                disabled={!user || !currentHousehold}
                className="bg-sage hover:bg-sage/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to My Recipes
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'adding' && (
          <>
            <DialogHeader>
              <DialogTitle>Adding Recipe...</DialogTitle>
              <DialogDescription>
                We're saving "{recipe.label}" to your recipe collection.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Recipe Added Successfully!
              </DialogTitle>
              <DialogDescription>
                "{recipe.label}" has been added to your recipe collection. You can find it in "My Recipes".
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button onClick={handleClose} className="bg-sage hover:bg-sage/90">
                Great!
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}