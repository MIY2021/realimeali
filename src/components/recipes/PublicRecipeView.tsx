
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PublicRecipeShare } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";

export function PublicRecipeView() {
  const { shareId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { createRecipe } = useRecipes();
  const [recipe, setRecipe] = useState<PublicRecipeShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!shareId) return;

      try {
        const { data, error } = await supabase
          .from('public_recipe_shares')
          .select('*')
          .eq('public_share_id', shareId)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        setRecipe({
          ...data,
          recipe_id: data.id // Add the missing recipe_id property
        });

        // Increment view count
        await supabase.rpc('increment_share_view_count', { share_id: shareId });
      } catch (error) {
        console.error('Error fetching recipe:', error);
        toast({
          title: "Error",
          description: "Recipe not found or has expired",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [shareId, toast]);

  const handleSaveToMyRecipes = async () => {
    if (!recipe || !user || !currentHousehold) {
      toast({
        title: "Error",
        description: "You must be logged in and have a household to save recipes",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const newRecipe = {
        title: recipe.title,
        description: recipe.description || '',
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prep_time || 0,
        cookTime: recipe.cook_time || 0,
        servings: recipe.servings || 1,
        image: recipe.image,
        isFavorite: false,
        householdId: currentHousehold.id,
      };

      await createRecipe(newRecipe, currentHousehold.id);
      
      toast({
        title: "Success",
        description: "Recipe saved to your collection!",
      });
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
        <p className="text-muted-foreground">This recipe link may have expired or been removed.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          
          {user && currentHousehold && (
            <Button 
              onClick={handleSaveToMyRecipes}
              disabled={saving}
              className="bg-terracotta hover:bg-terracotta/90"
            >
              {saving ? "Saving..." : "Save to My Recipes"}
            </Button>
          )}
          
          {recipe.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {recipe.description}
            </p>
          )}
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Prep: {recipe.prep_time || 0} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Cook: {recipe.cook_time || 0} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Serves: {recipe.servings || 1}</span>
            </div>
            <div className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              <span>By: {recipe.shared_by_name || 'Unknown'} ({recipe.shared_by_household_name || 'Unknown Household'})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-terracotta font-bold">•</span>
                    <span className="text-sm">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="bg-terracotta text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center justify-center gap-1">
            <Eye className="h-4 w-4" />
            <span>Views: {recipe.view_count || 0}</span>
          </div>
          <p className="mt-2">
            Shared from RealiMeali - Create your own recipe collection at{" "}
            <a href="/" className="text-terracotta hover:underline">
              RealiMeali.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
