
import { Recipe } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface RecipeCardProps {
  recipe: Recipe;
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onAddToMealPlan }: RecipeCardProps) {
  return (
    <Card className="relative group flex flex-col transition-shadow duration-150 hover:shadow-xl">
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="h-40 w-full object-cover rounded-t"
          onError={e => (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"}
        />
      )}
      <div className="p-4 flex-1 flex flex-col">
        <h2 className="font-semibold text-lg line-clamp-2">{recipe.title}</h2>
        <p className="text-xs text-muted-foreground mb-1">{recipe.description}</p>
        <div className="flex flex-wrap gap-1 mt-auto">
          {recipe.categories.map(cat => (
            <span key={cat} className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded">
              {cat}
            </span>
          ))}
        </div>
        {onAddToMealPlan && (
          <Button
            className="mt-2 w-full"
            size="sm"
            variant="outline"
            onClick={() => onAddToMealPlan(recipe)}
          >
            Add to Meal Plan
          </Button>
        )}
      </div>
    </Card>
  );
}
