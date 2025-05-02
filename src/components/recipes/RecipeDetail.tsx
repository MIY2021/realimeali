import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft, Pencil, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockRecipes } from "@/data/recipes";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const found = mockRecipes.find((r) => r.id === id);
    setRecipe(found);
    setIsFavorite(found?.isFavorite || false);
  }, [id]);

  if (!recipe) {
    return (
      <div className="container max-w-2xl py-8">
        <p>Loading...</p>
      </div>
    );
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: `Recipe ${isFavorite ? "removed" : "added"} to your favorites.`,
    });
  };

  return (
    <div className="container max-w-2xl py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/recipes" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipes
        </Link>
      </Button>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-2xl font-bold">{recipe.title}</CardTitle>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFavorite}
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? "text-red-500" : ""}`}
              />
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link to={`/recipes/${recipe.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {recipe.image && (
            <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          )}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              {recipe.prepTime + recipe.cookTime} mins
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-1 h-4 w-4" />
              {recipe.servings} servings
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground">{recipe.description}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Ingredients</h3>
            <ul className="list-disc pl-4 space-y-1">
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i} className="text-sm">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Instructions</h3>
            <ol className="list-decimal pl-4 space-y-2">
              {recipe.instructions.map((instruction, i) => (
                <li key={i} className="text-sm">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipeDetail;
