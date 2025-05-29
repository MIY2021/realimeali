import React from 'react';
import { Recipe } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ChefHat } from 'lucide-react';

interface PublicRecipeViewProps {
  recipe: Recipe;
}

export function PublicRecipeView({ recipe }: PublicRecipeViewProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{recipe.title}</CardTitle>
        <div className="flex items-center space-x-2 mt-2">
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
            className="w-full rounded-md aspect-video object-cover"
          />
        )}
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>{recipe.prepTime + recipe.cookTime} mins</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
        <p className="text-gray-700">{recipe.description}</p>
        <div>
          <h3 className="text-lg font-semibold">Ingredients:</h3>
          <ul className="list-disc list-inside">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Instructions:</h3>
          <ol className="list-decimal list-inside">
            {recipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
        {recipe.topTip && (
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <ChefHat className="h-5 w-5 mr-1" />
              Chef's Tip:
            </h3>
            <p className="text-gray-700">{recipe.topTip}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
