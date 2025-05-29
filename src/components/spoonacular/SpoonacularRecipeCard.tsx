
import { useState } from "react";
import { SpoonacularRecipe } from "@/types/spoonacular";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { SaveRecipeDialog } from "@/components/spoonacular/SaveRecipeDialog";

interface SpoonacularRecipeCardProps {
  recipe: SpoonacularRecipe;
}

export function SpoonacularRecipeCard({ recipe }: SpoonacularRecipeCardProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>{recipe.title}</CardTitle>
        <CardDescription>
          {recipe.summary.substring(0, 150)}...
        </CardDescription>
      </CardHeader>
      <CardContent className="aspect-video overflow-hidden rounded-md">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="object-cover w-full h-full"
        />
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {recipe.readyInMinutes} min
          <Badge className="ml-2">{recipe.servings} servings</Badge>
        </div>
        <Button size="sm" onClick={() => setSaveDialogOpen(true)}>
          Save Recipe
        </Button>
      </CardFooter>

      <SaveRecipeDialog
        recipe={recipe}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />
    </Card>
  );
}
