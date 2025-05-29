import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Utensils, ArrowLeft } from "lucide-react";

interface PublicRecipe {
  public_share_id: string;
  original_recipe_id: string;
  shared_by_user_id: string;
  shared_by_name: string;
  shared_by_household_name: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  image?: string;
  expires_at: string;
  created_at: string;
  meal_type?: string;
  original_household_id: string;
  view_count: number;
}

export function PublicRecipeView() {
  const { shareId } = useParams<{ shareId: string }>();
  const [recipe, setRecipe] = useState<PublicRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Mock fetching data
        const mockRecipe: PublicRecipe = {
          public_share_id: "mock-id",
          original_recipe_id: "original-id",
          shared_by_user_id: "user-id",
          shared_by_name: "Mock User",
          shared_by_household_name: "Mock Household",
          title: "Mock Recipe",
          description: "This is a mock recipe for demonstration purposes.",
          ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
          instructions: ["Step 1", "Step 2", "Step 3"],
          prep_time: 10,
          cook_time: 20,
          servings: 4,
          image: "https://via.placeholder.com/400",
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date().toISOString(),
          meal_type: "dinner",
          original_household_id: "household-id",
          view_count: 0,
        };
        setRecipe(mockRecipe);
      } catch (err: any) {
        setError(err.message || "Failed to load recipe.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [shareId]);

  if (isLoading) {
    return <div>Loading recipe...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!recipe) {
    return <div>Recipe not found.</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-8">
      <Button asChild variant="ghost" className="mb-4">
        <a href="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </a>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{recipe.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recipe.image && (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full aspect-video object-cover rounded-md"
            />
          )}

          <div className="flex flex-wrap gap-2">
            {recipe.meal_type && (
              <Badge variant="secondary" className="text-xs">
                {recipe.meal_type.charAt(0).toUpperCase() + recipe.meal_type.slice(1)}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">{recipe.description}</p>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Prep: {recipe.prep_time || 0} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>Cook: {recipe.cook_time || 0} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span>Serves: {recipe.servings || 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span>Total: {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Ingredients</h3>
            <ul className="list-disc pl-5">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Instructions</h3>
            <ol className="list-decimal pl-5">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-sm">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          <p className="text-xs text-muted-foreground">
            Shared by {recipe.shared_by_name} from {recipe.shared_by_household_name}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
