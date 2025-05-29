
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicRecipeShare } from "@/types";
import { UtensilsCrossed, Clock, Users, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function PublicRecipeView() {
  const { shareId } = useParams<{ shareId: string }>();
  const [recipe, setRecipe] = useState<PublicRecipeShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPublicRecipe = async () => {
      if (!shareId) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('public_recipe_shares')
          .select('*')
          .eq('public_share_id', shareId)
          .single();

        if (error) throw error;

        if (!data) {
          setError("Recipe not found or link has expired");
          setLoading(false);
          return;
        }

        setRecipe(data);
      } catch (error) {
        console.error('Error fetching public recipe:', error);
        setError("Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicRecipe();
  }, [shareId]);

  const copyToClipboard = async () => {
    if (!recipe) return;
    
    const recipeText = `${recipe.title}\n\nIngredients:\n${recipe.ingredients.join('\n')}\n\nInstructions:\n${recipe.instructions.join('\n')}`;
    
    try {
      await navigator.clipboard.writeText(recipeText);
      setCopied(true);
      toast({
        title: "Recipe copied!",
        description: "The recipe has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy recipe to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading recipe...</div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
          <p className="text-muted-foreground">{error || "This recipe share link is invalid or has expired."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6 text-sage" />
              {recipe.title}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Recipe"}
            </Button>
          </div>
          
          <p className="text-muted-foreground">{recipe.description}</p>
          
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary">
              <Clock className="h-4 w-4 mr-2" />
              Prep: {recipe.prep_time}m
            </Badge>
            <Badge variant="secondary">
              <Clock className="h-4 w-4 mr-2" />
              Cook: {recipe.cook_time}m
            </Badge>
            <Badge variant="secondary">
              <Users className="h-4 w-4 mr-2" />
              Serves: {recipe.servings}
            </Badge>
          </div>
          
          <div className="text-sm text-muted-foreground mt-4">
            Shared by {recipe.shared_by_name} from {recipe.shared_by_household_name}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
              <ul className="list-disc list-inside space-y-1">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-sm">{ingredient}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Instructions</h3>
              <ol className="list-decimal list-inside space-y-2">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm">{instruction}</li>
                ))}
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
