
import { useState, useEffect, useMemo } from "react";
import { mockMealPlans } from "@/data/mealPlans";
import { mockRecipes } from "@/data/recipes";
import { Recipe } from "@/types";
import { ListChecks, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Ingredient {
  name: string;
  checked: boolean;
  recipeIds: string[];
}

export default function ShoppingList() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const { toast } = useToast();

  // Only include recipes in the meal plan
  const mealPlanRecipes = useMemo(() => {
    const recipeIds = mockMealPlans.map(plan => plan.recipeId);
    return mockRecipes.filter(recipe => recipeIds.includes(recipe.id));
  }, []);

  // Unique ingredient calculation, for accurate count
  useEffect(() => {
    const ingredientMap = new Map<string, Ingredient>();

    mealPlanRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredientText => {
        const key = ingredientText.toLowerCase().trim();

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          if (!existing.recipeIds.includes(recipe.id)) {
            existing.recipeIds.push(recipe.id);
          }
        } else {
          ingredientMap.set(key, {
            name: ingredientText,
            checked: false,
            recipeIds: [recipe.id]
          });
        }
      });
    });

    setIngredients(Array.from(ingredientMap.values()));
  }, [mealPlanRecipes]);

  const handleToggleIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index].checked = !newIngredients[index].checked;
    setIngredients(newIngredients);

    if (newIngredients[index].checked) {
      toast({
        title: "Item checked",
        description: `${newIngredients[index].name} marked as purchased`,
      });
    }
  };

  const handleCheckAll = () => {
    setIngredients(ingredients.map(ingredient => ({
      ...ingredient,
      checked: true
    })));

    toast({
      title: "All items checked",
      description: "All ingredients marked as purchased",
    });
  };

  const handleUncheckAll = () => {
    setIngredients(ingredients.map(ingredient => ({
      ...ingredient,
      checked: false
    })));
  };

  const getRecipeForIngredient = (recipeId: string): Recipe | undefined => {
    return mockRecipes.find(recipe => recipe.id === recipeId);
  };

  const categorizeIngredients = () => {
    const categories = [
      "Produce",
      "Meat & Seafood",
      "Dairy & Eggs",
      "Pantry",
      "Bakery",
      "Frozen",
      "Other"
    ];

    const result: Record<string, Ingredient[]> = {};
    categories.forEach(category => {
      result[category] = [];
    });

    // Simple categorization based on common keywords
    ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();

      if (/lettuce|onion|potato|tomato|carrot|spinach|garlic|pepper|broccoli|cucumber|lemon|lime|herbs|vegetable/i.test(name)) {
        result["Produce"].push(ingredient);
      } else if (/chicken|beef|pork|fish|salmon|shrimp|turkey|meat/i.test(name)) {
        result["Meat & Seafood"].push(ingredient);
      } else if (/milk|cheese|yogurt|cream|butter|egg/i.test(name)) {
        result["Dairy & Eggs"].push(ingredient);
      } else if (/flour|sugar|oil|vinegar|rice|pasta|sauce|spice|salt|pepper|canned|dried/i.test(name)) {
        result["Pantry"].push(ingredient);
      } else if (/bread|bun|bagel|muffin|roll|cake|pastry/i.test(name)) {
        result["Bakery"].push(ingredient);
      } else if (/frozen|ice/i.test(name)) {
        result["Frozen"].push(ingredient);
      } else {
        result["Other"].push(ingredient);
      }
    });

    // Filter out empty categories
    return Object.fromEntries(
      Object.entries(result).filter(([_, items]) => items.length > 0)
    );
  };

  const categorizedIngredients = categorizeIngredients();
  const checkedCount = ingredients.filter(i => i.checked).length;

  return (
    <div className="container py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <ListChecks className="h-6 w-6" />
              Shopping List
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {ingredients.length} items • {checkedCount} purchased
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCheckAll}
              className="text-xs"
            >
              <Check className="h-4 w-4 mr-1" />
              Check All
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleUncheckAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {Object.entries(categorizedIngredients).map(([category, items]) => (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {items.map((ingredient, idx) => {
                  const originalIndex = ingredients.findIndex(i => i.name === ingredient.name);
                  return (
                    <li 
                      key={`${ingredient.name}-${idx}`} 
                      className={`flex items-start gap-2 p-2 rounded ${ingredient.checked ? 'bg-muted/50' : ''}`}
                    >
                      <Checkbox 
                        id={`ingredient-${originalIndex}`}
                        checked={ingredient.checked}
                        onCheckedChange={() => handleToggleIngredient(originalIndex)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`ingredient-${originalIndex}`}
                          className={`text-sm ${ingredient.checked ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {ingredient.name}
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ingredient.recipeIds.slice(0, 3).map(recipeId => {
                            const recipe = getRecipeForIngredient(recipeId);
                            return recipe ? (
                              <Link to={`/recipes/${recipe.id}`} key={recipeId} className="inline-flex items-center rounded-full bg-sage/10 px-2 py-0.5 text-xs text-sage hover:underline">
                                {recipe.title.slice(0, 15)}{recipe.title.length > 15 ? '...' : ''}
                              </Link>
                            ) : null;
                          })}
                          {ingredient.recipeIds.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              +{ingredient.recipeIds.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
