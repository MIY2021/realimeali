
import { useState, useEffect, useMemo } from "react";
import { mockMealPlans } from "@/data/mealPlans";
import { mockRecipes } from "@/data/recipes";
import { Recipe } from "@/types";
import { ListChecks, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import ShoppingListActions from "@/components/ShoppingListActions";

interface Ingredient {
  name: string;
  checked: boolean;
  recipeIds: string[];
  totalQty?: number;
  unit?: string;
}

function parseIngredientQty(text: string): { qty: number; unit: string; name: string } {
  const match = text.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)?\s+(.*)$/);
  if (match)
    return {
      qty: parseFloat(match[1]),
      unit: match[2] ? match[2].trim() : "",
      name: match[3].toLowerCase(),
    };
  return { qty: 1, unit: "", name: text.toLowerCase() };
}

export default function ShoppingList() {
  const [week, setWeek] = useState<1 | 2>(1);
  
  // Persist checked state in localStorage
  const CHECKED_INGREDIENTS_STORAGE_KEY = "shopping_list_checked_ingredients";
  
  const mealPlanRecipes = useMemo(() => {
    const storage = localStorage.getItem(`persistedMealPlans_v1_week${week}`);
    const selectedPlans = storage ? JSON.parse(storage) : week === 1 ? mockMealPlans : [];
    const recipeIds = selectedPlans.map((plan: any) => plan.recipeId);
    return mockRecipes.filter(recipe => recipeIds.includes(recipe.id));
  }, [week]);

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const { toast } = useToast();
  
  // Load the saved checked state from localStorage
  const loadCheckedState = (ingredientList: Ingredient[]) => {
    const storedCheckedState = localStorage.getItem(`${CHECKED_INGREDIENTS_STORAGE_KEY}_week${week}`);
    if (storedCheckedState) {
      const checkedMap: Record<string, boolean> = JSON.parse(storedCheckedState);
      return ingredientList.map(ing => {
        const key = ing.name + (ing.unit && ing.unit !== "" ? `_${ing.unit}` : "");
        return {
          ...ing,
          checked: checkedMap[key] || false
        };
      });
    }
    return ingredientList;
  };
  
  // Save the checked state to localStorage
  const saveCheckedState = (ingredientList: Ingredient[]) => {
    const checkedMap: Record<string, boolean> = {};
    ingredientList.forEach(ing => {
      const key = ing.name + (ing.unit && ing.unit !== "" ? `_${ing.unit}` : "");
      checkedMap[key] = ing.checked;
    });
    localStorage.setItem(`${CHECKED_INGREDIENTS_STORAGE_KEY}_week${week}`, JSON.stringify(checkedMap));
  };

  useEffect(() => {
    const ingredientMap = new Map<string, Ingredient>();
    mealPlanRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredientText => {
        const { qty, unit, name } = parseIngredientQty(ingredientText);
        const key = name + (unit && unit !== "" ? `_${unit}` : "");

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.totalQty = (existing.totalQty || 0) + qty;
          if (!existing.recipeIds.includes(recipe.id)) {
            existing.recipeIds.push(recipe.id);
          }
        } else {
          ingredientMap.set(key, {
            name: name,
            checked: false,
            recipeIds: [recipe.id],
            totalQty: qty,
            unit,
          });
        }
      });
    });

    const newIngredients = Array.from(ingredientMap.values());
    // Apply saved checked state
    setIngredients(loadCheckedState(newIngredients));
  }, [mealPlanRecipes, week]);
  
  // Save checked state whenever it changes
  useEffect(() => {
    saveCheckedState(ingredients);
  }, [ingredients, week]);

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

  const handleRemoveItem = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);

    toast({
      title: "Item removed",
      description: "Ingredient removed from shopping list",
    });
  };

  const handleRemoveAll = () => {
    setIngredients([]);
    toast({
      title: "List cleared",
      description: "All ingredients removed from shopping list",
    });
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
    return Object.fromEntries(
      Object.entries(result).filter(([_, items]) => items.length > 0)
    );
  };

  const categorizedIngredients = categorizeIngredients();
  const checkedCount = ingredients.filter(i => i.checked).length;

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <ListChecks className="h-6 w-6" />
            Shopping List
          </h1>
          <div className="flex gap-2 mt-2">
            {[1, 2].map((val) => (
              <Button
                key={val}
                size="sm"
                variant={week === val ? "default" : "outline"}
                className={week === val ? "bg-terracotta text-white" : ""}
                onClick={() => setWeek(val as 1 | 2)}
              >
                Week {val}
              </Button>
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {ingredients.length} items • {checkedCount} purchased
          </p>
        </div>
        <ShoppingListActions
          onCheckAll={handleCheckAll}
          onUncheckAll={handleUncheckAll}
          onRemoveAll={handleRemoveAll}
        />
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
                  const originalIndex = ingredients.findIndex(i => i.name === ingredient.name && i.unit === ingredient.unit);
                  return (
                    <li
                      key={`${ingredient.name}-${ingredient.unit || ""}-${idx}`}
                      className={`flex items-start gap-2 p-2 rounded ${ingredient.checked ? 'bg-muted/50' : ''}`}
                    >
                      <Checkbox
                        id={`ingredient-${originalIndex}`}
                        checked={ingredient.checked}
                        onCheckedChange={() => handleToggleIngredient(originalIndex)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`ingredient-${originalIndex}`}
                          className={`text-sm ${ingredient.checked ? 'line-through text-muted-foreground' : ''} break-words`}
                        >
                          {ingredient.totalQty && ingredient.unit
                            ? `${ingredient.totalQty} ${ingredient.unit} ${ingredient.name}`
                            : ingredient.totalQty ? `${ingredient.totalQty} ${ingredient.name}` : ingredient.name}
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ingredient.recipeIds.map(recipeId => {
                            const recipe = getRecipeForIngredient(recipeId);
                            return recipe ? (
                              <Link to={`/recipes/${recipe.id}`} key={recipeId} className="inline-flex items-center rounded-full bg-sage/10 px-2 py-0.5 text-xs text-sage hover:underline break-all">
                                {recipe.title.slice(0, 15)}{recipe.title.length > 15 ? '...' : ''}
                              </Link>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(originalIndex)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        <span className="sr-only">Remove</span>
                      </Button>
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
