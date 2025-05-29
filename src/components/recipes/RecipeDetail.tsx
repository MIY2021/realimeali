import React from "react";
import { Recipe } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, ChefHat, Share, Calendar, Heart } from "lucide-react";

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{recipe.title}</CardTitle>
        <div className="flex items-center space-x-2">
          {recipe.categories.map((category) => (
            <Badge key={category}>{category}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recipe.image && (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="rounded-md w-full object-cover aspect-video"
          />
        )}
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {recipe.prepTime}m Prep
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {recipe.cookTime}m Cook
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            Serves {recipe.servings}
          </div>
        </div>
        <p>{recipe.description}</p>
        <div>
          <h3 className="text-lg font-semibold">Ingredients</h3>
          <ul className="list-disc pl-5">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Instructions</h3>
          <ol className="list-decimal pl-5">
            {recipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
        {recipe.topTip && (
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <ChefHat className="h-5 w-5 mr-1" /> Top Tip
            </h3>
            <p>{recipe.topTip}</p>
          </div>
        )}
        <div className="flex justify-between items-center">
          <Button variant="outline">
            <Heart className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
