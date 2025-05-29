
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecipeImage } from "@/components/ui/recipe-image";
import { supabase } from "@/integrations/supabase/client";
import { ChefHat, Clock, Users, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PublicRecipeViewProps {
  recipe?: any;
}

export function PublicRecipeView({ recipe }: PublicRecipeViewProps) {
  const { shareId } = useParams<{ shareId: string }>();
  const [publicRecipe, setPublicRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPublicRecipe = async () => {
      setIsLoading(true);
      try {
        if (!shareId) {
          console.error("No shareId provided");
          return;
        }

        const { data, error } = await supabase
          .from('public_recipe_shares')
          .select('*')
          .eq('public_share_id', shareId)
          .single();

        if (error) {
          console.error("Error fetching public recipe:", error);
          toast({
            title: "Error",
            description: "Failed to load recipe. Please try again.",
            variant: "destructive"
          });
          return;
        }

        setPublicRecipe(data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicRecipe();
  }, [shareId, toast]);

  if (isLoading) {
    return <div className="text-center py-10">Loading recipe...</div>;
  }

  if (!publicRecipe) {
    return <div className="text-center py-10">Recipe not found.</div>;
  }

  return (
    <div className="container py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-muted-foreground" />
            {publicRecipe.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Shared by {publicRecipe.shared_by_name} from {publicRecipe.shared_by_household_name}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {publicRecipe.image && (
            <div className="relative rounded-md overflow-hidden">
              <RecipeImage recipe={publicRecipe} className="w-full h-64 object-cover" iconSize="h-5 w-5" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Clock className="h-4 w-4 mr-1" />
              {publicRecipe.prep_time + publicRecipe.cook_time} min
            </Badge>
            <Badge variant="secondary">
              <Users className="h-4 w-4 mr-1" />
              {publicRecipe.servings} servings
            </Badge>
          </div>

          <p className="text-md">{publicRecipe.description}</p>

          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Ingredients</h4>
            <ul className="list-disc pl-5">
              {publicRecipe.ingredients.map((ingredient: string, index: number) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Instructions</h4>
            <ol className="list-decimal pl-5">
              {publicRecipe.instructions.map((instruction: string, index: number) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" asChild>
              <a href={`https://realimeali.com/recipes/${publicRecipe.original_recipe_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                View Original Recipe
                <Share className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
