
import { useState } from "react";
import { RecipeList } from "@/components/recipes/RecipeList";
import { Button } from "@/components/ui/button";
import { Book, Plus, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MealType, Recipe } from "@/types";
import { AIRecipeParserDialog } from "@/components/recipes/AIRecipeParserDialog";
import { CategoryManagementDialog } from "@/components/recipes/CategoryManagementDialog";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";

export default function RecipesPage() {
  const { recipes, isLoading, createRecipe } = useRecipes();
  const { user } = useAuth();
  const { toast } = useToast();

  // Dialog state
  const [showAIParserDialog, setShowAIParserDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const handleAIHelper = () => {
    if (!user) {
      toast({
        title: "Login Required", 
        description: "You need to log in to use the AI recipe helper.",
        variant: "destructive",
      });
      return;
    }
    setShowAIParserDialog(true);
  };

  const handleSaveAIParsedRecipe = async (newRecipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const newRecipe = await createRecipe(newRecipeData);
    if (newRecipe) {
      setShowAIParserDialog(false);
    }
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
          {user && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowCategoryDialog(true)}
              className="flex items-center gap-1"
            >
              <Pencil className="h-4 w-4" />
              Categories
            </Button>
          )}
          <Button 
            style={{ backgroundColor: '#e38165' }}
            className="hover:opacity-90 text-white" 
            onClick={handleAIHelper}
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
          <Button 
            onClick={handleAIHelper} 
            style={{ backgroundColor: '#e38165' }}
            className="hover:opacity-90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Recipe
          </Button>
        </div>
      ) : (
        <RecipeList recipes={recipes} />
      )}

      <AIRecipeParserDialog
        open={showAIParserDialog}
        onOpenChange={setShowAIParserDialog}
        onSave={handleSaveAIParsedRecipe}
      />

      <CategoryManagementDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
      />
    </div>
  );
}
