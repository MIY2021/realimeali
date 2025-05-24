
import { Recipe, RecipeCategory } from "@/types";
import { RecipeCard } from "./RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useHouseholdShopping } from "@/contexts/HouseholdShoppingContext";
import { ChevronDown } from "lucide-react";
import { AddToMealPlanDialog } from "./AddToMealPlanDialog";
import { EditRecipeDialog } from "./EditRecipeDialog";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface RecipeListProps {
  recipes: Recipe[];
}

// All available categories - ensures all categories show even if no recipes exist
const ALL_RECIPE_CATEGORIES: RecipeCategory[] = [
  "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", 
  "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ", 
  "Faffy", "Pricey!", "Not Yet Made", "Snacks", "Breakfast"
];

export function RecipeList({ recipes }: RecipeListProps) {
  const { recipeCategories } = useHouseholdShopping();
  const { updateRecipe, deleteRecipe } = useRecipes();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortType, setSortType] = useState<string>("title-asc");
  const [displayCount, setDisplayCount] = useState(10);
  
  // State for meal plan dialog
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [mealPlanDialogOpen, setMealPlanDialogOpen] = useState(false);
  
  // State for edit dialog
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Combine household categories with all standard categories, ensuring all are shown
  const householdCategoryNames = recipeCategories.map(cat => cat.name);
  const allCategories = [...ALL_RECIPE_CATEGORIES, ...householdCategoryNames.filter(name => !ALL_RECIPE_CATEGORIES.includes(name as RecipeCategory))];

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || 
                          recipe.categories.includes(categoryFilter as any);

    return matchesSearch && matchesCategory;
  });

  // Sort recipes
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortType === "title-asc") {
      return a.title.localeCompare(b.title);
    }
    if (sortType === "title-desc") {
      return b.title.localeCompare(a.title);
    }
    if (sortType === "prep-asc") {
      return a.prepTime - b.prepTime;
    }
    if (sortType === "prep-desc") {
      return b.prepTime - a.prepTime;
    }
    return 0;
  });

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  const handleAddToMealPlan = (recipe: Recipe) => {
    console.log("Opening meal plan dialog for recipe:", recipe.title);
    setSelectedRecipe(recipe);
    setMealPlanDialogOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    console.log("Opening edit dialog for recipe:", recipe.title);
    setEditRecipe(recipe);
    setEditDialogOpen(true);
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to delete recipes.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    const success = await deleteRecipe(recipe.id);
    if (success) {
      toast({
        title: "Recipe Deleted",
        description: `"${recipe.title}" has been deleted successfully.`,
      });
    }
  };

  const handleShareRecipe = (recipe: Recipe) => {
    // Simple share functionality - copy URL to clipboard
    const recipeUrl = `${window.location.origin}/recipes/${recipe.id}/${recipe.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-')}`;
    navigator.clipboard.writeText(recipeUrl).then(() => {
      toast({
        title: "Recipe Link Copied",
        description: "The recipe link has been copied to your clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Share Failed",
        description: "Could not copy the recipe link.",
        variant: "destructive",
      });
    });
  };

  const handleSaveEdit = async (updatedRecipe: Recipe) => {
    if (!editRecipe) return;
    
    const result = await updateRecipe(editRecipe.id, updatedRecipe);
    if (result) {
      setEditDialogOpen(false);
      setEditRecipe(null);
    }
  };

  const visibleRecipes = sortedRecipes.slice(0, displayCount);
  const hasMoreRecipes = displayCount < sortedRecipes.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48 relative">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full border rounded p-2 pr-8 appearance-none bg-white"
          >
            <option value="all">All Categories</option>
            {allCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        </div>
      </div>
      
      {sortedRecipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No recipes found. Try adjusting your search.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleRecipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onAddToMealPlan={() => handleAddToMealPlan(recipe)}
                onEdit={() => handleEditRecipe(recipe)}
                onDelete={() => handleDeleteRecipe(recipe)}
                onShare={() => handleShareRecipe(recipe)}
              />
            ))}
          </div>
          
          {hasMoreRecipes && (
            <div className="flex justify-center mt-6">
              <Button onClick={handleLoadMore} variant="outline">
                Load More Recipes
              </Button>
            </div>
          )}
        </>
      )}

      <AddToMealPlanDialog
        recipe={selectedRecipe}
        open={mealPlanDialogOpen}
        onOpenChange={setMealPlanDialogOpen}
      />

      {editRecipe && (
        <EditRecipeDialog
          recipe={editRecipe}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
