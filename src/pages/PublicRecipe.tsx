
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PublicRecipeView } from "@/components/recipes/PublicRecipeView";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { PublicRecipeShare } from "@/types";

export default function PublicRecipe() {
  const { shareId } = useParams<{ shareId: string }>();
  const [recipe, setRecipe] = useState<PublicRecipeShare | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useDocumentTitle(recipe ? `${recipe.title} | Shared Recipe` : "Shared Recipe | RealiMeali");

  useEffect(() => {
    const fetchPublicRecipe = async () => {
      if (!shareId) {
        setError("No share ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`https://bdjzefekuahfofwzxqxd.supabase.co/functions/v1/recipe-meta/share/${shareId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        // Transform the recipe data to match our interface
        const transformedRecipe: PublicRecipeShare = {
          ...data,
          description: Array.isArray(data.description) ? data.description : [data.description || ''],
        };

        setRecipe(transformedRecipe);
      } catch (err) {
        console.error("Error fetching public recipe:", err);
        setError(err instanceof Error ? err.message : "Failed to load recipe");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicRecipe();
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 px-6">
        <div className="text-center">
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-8 px-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container max-w-4xl py-8 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
          <p className="text-muted-foreground">This recipe may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  return <PublicRecipeView recipe={recipe} />;
}
