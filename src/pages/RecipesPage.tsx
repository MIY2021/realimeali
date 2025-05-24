
import { useState } from "react";
import { RecipeList } from "@/components/recipes/RecipeList";
import { Button } from "@/components/ui/button";
import { Plus, Book, Wand } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MealType, Recipe } from "@/types";
import { CreateRecipeDialog } from "@/components/recipes/CreateRecipeDialog";
import { AIRecipeParserDialog } from "@/components/recipes/AIRecipeParserDialog";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";

export default function RecipesPage() {
  const { recipes, isLoading, createRecipe } = useRecipes();
  const { user } = useAuth();
  const { toast } = useToast();

  // Dialog states
  const [showNewRecipeDialog, setShowNewRecipeDialog] = useState(false);
  const [showAIParserDialog, setShowAIParserDialog] = useState(false);

  const handleAddNewRecipe = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to create recipes.",
        variant: "destructive",
      });
      return;
    }
    setShowNewRecipeDialog(true);
  };

  const handleAIParser = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to use the AI recipe parser.",
        variant: "destructive",
      });
      return;
    }
    setShowAIParserDialog(true);
  };

  const handleSaveNewRecipe = async (newRecipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const newRecipe = await createRecipe(newRecipeData);
    if (newRecipe) {
      setShowNewRecipeDialog(false);
    }
  };

  const handleSaveAIParsedRecipe = async (newRecipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const newRecipe = await createRecipe(newRecipeData);
    if (newRecipe) {
      setShowAIParserDialog(false);
    }
  };

  // --- Add-to-meal plan handler ---
  const handleAddToMealPlan = (recipe: Recipe, mealType: MealType, selectedWeek: 1 | 2) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to add recipes to your meal plan.",
        variant: "destructive",
      });
      return;
    }
    
    // Store the meal plan selection in localStorage
    const storageKey = `persistedMealPlans_v1_week${selectedWeek}`;
    const existingPlans = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const newMealPlan = {
      id: `added-meal-${Date.now()}-${mealType}`,
      date: new Date().toISOString(),
      mealType,
      recipeId: recipe.id,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slotIndex: existingPlans.filter((mp: any) => mp.mealType === mealType).length,
    };

    const updatedPlans = [...existingPlans, newMealPlan];
    localStorage.setItem(storageKey, JSON.stringify(updatedPlans));
    
    toast({
      title: "Recipe Added",
      description: `Added ${recipe.title} to your ${mealType} meal plan (Week ${selectedWeek})!`,
    });
  };

  return (
    <div className="container max-w-3xl py-6">
      <div className="flex items-center justify-between mb-8 gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Book className="h-6 w-6" />
            My Recipes
          </h1>
          <p className="text-muted-foreground mt-1">
            {user ? "Manage your personal recipe collection" : "Login to view and create your recipes"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            className="bg-sage hover:bg-sage/90 text-white border-sage" 
            onClick={handleAIParser}
          >
            <Wand className="h-4 w-4 mr-2" />
            Parse Recipe with AI
          </Button>
          <Button 
            className="bg-terracotta hover:bg-terracotta/90" 
            onClick={handleAddNewRecipe}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Recipe
          </Button>
        </div>
      </div>

      {!user ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view and manage your recipes.</p>
        </div>
      ) : isLoading ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">Loading your recipes...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">You haven't created any recipes yet.</p>
          <div className="flex justify-center gap-2">
            <Button onClick={handleAIParser} variant="outline" className="bg-sage hover:bg-sage/90 text-white border-sage">
              <Wand className="h-4 w-4 mr-2" />
              Parse Recipe with AI
            </Button>
            <Button onClick={handleAddNewRecipe} className="bg-terracotta hover:bg-terracotta/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Recipe
            </Button>
          </div>
        </div>
      ) : (
        <RecipeList
          recipes={recipes}
          onAddToMealPlan={handleAddToMealPlan}
        />
      )}

      {/* Create Recipe Dialog */}
      <CreateRecipeDialog
        open={showNewRecipeDialog}
        onOpenChange={setShowNewRecipeDialog}
        onSave={handleSaveNewRecipe}
      />

      {/* AI Recipe Parser Dialog */}
      <AIRecipeParserDialog
        open={showAIParserDialog}
        onOpenChange={setShowAIParserDialog}
        onSave={handleSaveAIParsedRecipe}
      />
    </div>
  );
}
