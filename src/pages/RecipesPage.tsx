
import { useState, useEffect } from "react";
import { RecipeList } from "@/components/recipes/RecipeList";
import { Button } from "@/components/ui/button";
import { Book, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CategoryManagementDialog } from "@/components/recipes/CategoryManagementDialog";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";

export default function RecipesPage() {
  const { recipes, isLoading, fetchRecipes } = useRecipes();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Dialog state
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  
  // Local loading state to prevent multiple fetches
  const [isFetching, setIsFetching] = useState(false);

  // Fetch recipes when household changes - remove fetchRecipes from dependencies
  useEffect(() => {
    if (user && !isFetching) {
      setIsFetching(true);
      fetchRecipes(currentHousehold?.id || null).finally(() => {
        setIsFetching(false);
      });
    }
  }, [currentHousehold?.id, user?.id]); // Only depend on stable IDs

  const handleCreateRecipe = () => {
    if (!user) {
      toast({
        title: "Login Required", 
        description: "You need to log in to create recipes.",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentHousehold) {
      toast({
        title: "Household Required", 
        description: "Please select a household to add recipes to.",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/recipes/new");
  };

  return (
    <div className="container max-w-3xl py-6">
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Book className="h-6 w-6" />
            Household Recipes
          </h1>
          <p className="text-muted-foreground mt-1">
            {user ? "Manage your household's recipe collection" : "Login to view and create household recipes"}
          </p>
        </div>
      </div>

      {!user ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view and manage recipes.</p>
        </div>
      ) : !currentHousehold ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please select or create a household to view recipes.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleCreateRecipe}
                className="flex items-center gap-1"
                style={{ backgroundColor: '#e38165' }}
              >
                <Plus className="h-4 w-4" />
                Add New Recipe
              </Button>
            </div>
            {user && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowCategoryDialog(true)}
                className="flex items-center gap-1"
              >
                Manage Categories
              </Button>
            )}
          </div>

          {isLoading || isFetching ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Loading household recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground mb-4">Your household hasn't created any recipes yet.</p>
              <Button 
                onClick={handleCreateRecipe} 
                style={{ backgroundColor: '#e38165' }}
                className="hover:opacity-90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Recipe
              </Button>
            </div>
          ) : (
            <RecipeList recipes={recipes} showActions={false} />
          )}
        </>
      )}

      <CategoryManagementDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
      />
    </div>
  );
}
