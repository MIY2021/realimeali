import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecipeDetail as RecipeDetailComponent } from "@/components/recipes/RecipeDetail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Recipe, MealType } from "@/types";
import { EditRecipeDialog } from "@/components/recipes/EditRecipeDialog";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipeById, isLoading, updateRecipe, deleteRecipe } = useRecipes();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMealPlanDialog, setShowMealPlanDialog] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<1 | 2 | null>(null);
  
  const recipe = id ? getRecipeById(id) : undefined;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const handleEdit = (recipe: Recipe) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to edit recipes.",
        variant: "destructive",
      });
      return;
    }

    if (recipe.createdBy !== user.id) {
      toast({
        title: "Permission Denied",
        description: "You can only edit your own recipes.",
        variant: "destructive",
      });
      return;
    }

    setShowEditDialog(true);
  };

  const handleUpdateRecipe = async (updatedRecipe: Recipe) => {
    if (!recipe) return;
    
    const result = await updateRecipe(recipe.id, updatedRecipe);
    if (result) {
      setShowEditDialog(false);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!recipe || !user) return;

    if (recipe.createdBy !== user.id) {
      toast({
        title: "Permission Denied",
        description: "You can only delete your own recipes.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.");
    if (!confirmed) return;

    const success = await deleteRecipe(recipe.id);
    if (success) {
      navigate("/recipes");
    }
  };

  const handleAddToMealPlan = (recipe: Recipe) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to add recipes to your meal plan.",
        variant: "destructive",
      });
      return;
    }
    setShowMealPlanDialog(true);
  };

  const handleSelectMealType = (mealType: MealType) => {
    if (!selectedWeek || !recipe) {
      toast({
        title: "Select Week",
        description: "Please select which week to add this meal to.",
        variant: "destructive"
      });
      return;
    }

    const storageKey = `persistedMealPlans_v1_week${selectedWeek}`;
    const existingPlans = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const newMealPlan = {
      id: `added-meal-${Date.now()}-${mealType}`,
      date: new Date().toISOString(),
      mealType,
      recipeId: recipe.id,
      createdBy: user?.id || "user-1",
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

    setShowMealPlanDialog(false);
    setSelectedWeek(null);
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 text-center">
        <p>Loading recipe...</p>
      </div>
    );
  }
  
  if (!recipe) {
    return (
      <div className="container py-8 text-center">
        <p>Recipe not found</p>
        <Button onClick={() => navigate("/recipes")} className="mt-4">
          Back to Recipes
        </Button>
      </div>
    );
  }

  const isOwner = user && recipe.createdBy === user.id;
  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks"];
  
  return (
    <div className="container">
      <Button 
        variant="ghost" 
        className="mt-4 mb-2"
        onClick={() => navigate("/recipes")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Recipes
      </Button>
      
      <RecipeDetailComponent 
        recipe={recipe} 
        onAddToMealPlan={() => handleAddToMealPlan(recipe)}
        onEdit={() => handleEdit(recipe)}
        onDelete={isOwner ? handleDeleteRecipe : undefined}
        isOwner={isOwner}
      />

      {recipe && (
        <EditRecipeDialog 
          recipe={recipe} 
          open={showEditDialog} 
          onOpenChange={setShowEditDialog}
          onSave={handleUpdateRecipe}
        />
      )}

      <Dialog open={showMealPlanDialog} onOpenChange={setShowMealPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add to Meal Plan
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <div className="text-lg font-semibold">{recipe?.title}</div>
            <div className="text-sm text-muted-foreground">{recipe?.description}</div>
          </div>
          <div className="flex flex-col gap-2 mb-2">
            <label className="font-semibold text-sm mb-1">Select Week</label>
            <div className="flex gap-2">
              {[1, 2].map((wk) => (
                <Button
                  key={wk}
                  variant={selectedWeek === wk ? "default" : "outline"}
                  className={selectedWeek === wk ? "bg-terracotta text-white" : ""}
                  onClick={() => setSelectedWeek(wk as 1 | 2)}
                >
                  Week {wk}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {mealTypes.map(type => (
              <Button key={type} onClick={() => handleSelectMealType(type)}>
                Add to {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
            <Button variant="outline" onClick={() => setShowMealPlanDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
