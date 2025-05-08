import { useState, useEffect, useMemo } from "react";
import { mockMealPlans } from "@/data/mealPlans";
import { mockRecipes } from "@/data/recipes";
import { Recipe } from "@/types";
import { ListChecks, Share, Check, Trash2, Plus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import ShoppingListActions from "@/components/ShoppingListActions";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Ingredient {
  name: string;
  checked: boolean;
  recipeIds: string[];
  totalQty?: number;
  unit?: string;
  isCustom?: boolean;
  category?: string; // Add category field to fix the TypeScript error
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
  const CUSTOM_INGREDIENTS_STORAGE_KEY = "shopping_list_custom_ingredients";
  
  const mealPlanRecipes = useMemo(() => {
    const storage = localStorage.getItem(`persistedMealPlans_v1_week${week}`);
    const selectedPlans = storage ? JSON.parse(storage) : week === 1 ? mockMealPlans : [];
    const recipeIds = selectedPlans.map((plan: any) => plan.recipeId);
    return mockRecipes.filter(recipe => recipeIds.includes(recipe.id));
  }, [week]);

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Pantry");
  const { toast } = useToast();
  
  // New state for confirmation dialog
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  
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
  
  // Load custom ingredients from localStorage
  const loadCustomIngredients = () => {
    const storedCustomIngredients = localStorage.getItem(`${CUSTOM_INGREDIENTS_STORAGE_KEY}_week${week}`);
    if (storedCustomIngredients) {
      return JSON.parse(storedCustomIngredients);
    }
    return [];
  };
  
  // Save custom ingredients to localStorage
  const saveCustomIngredients = (customIngredients: Ingredient[]) => {
    localStorage.setItem(`${CUSTOM_INGREDIENTS_STORAGE_KEY}_week${week}`, JSON.stringify(customIngredients));
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
            isCustom: false
          });
        }
      });
    });

    // Add custom ingredients
    const customIngredients = loadCustomIngredients();
    customIngredients.forEach(ingredient => {
      const key = ingredient.name + (ingredient.unit && ingredient.unit !== "" ? `_${ingredient.unit}` : "");
      if (!ingredientMap.has(key)) {
        ingredientMap.set(key, {
          ...ingredient,
          isCustom: true
        });
      }
    });

    const newIngredients = Array.from(ingredientMap.values());
    // Apply saved checked state
    setIngredients(loadCheckedState(newIngredients));
  }, [mealPlanRecipes, week]);
  
  // Save checked state whenever it changes
  useEffect(() => {
    saveCheckedState(ingredients);
    
    // Save custom ingredients separately
    const customIngredients = ingredients.filter(ing => ing.isCustom);
    saveCustomIngredients(customIngredients);
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

  // Updated to use confirmation dialog
  const handleRemoveItem = (index: number) => {
    setItemToDelete(index);
  };
  
  // New function to confirm deletion
  const confirmRemoveItem = () => {
    if (itemToDelete !== null) {
      const newIngredients = [...ingredients];
      newIngredients.splice(itemToDelete, 1);
      setIngredients(newIngredients);
  
      toast({
        title: "Item removed",
        description: "Ingredient removed from shopping list",
      });
      
      // Reset item to delete
      setItemToDelete(null);
    }
  };
  
  // Cancel deletion
  const cancelRemoveItem = () => {
    setItemToDelete(null);
  };

  const handleRemoveAll = () => {
    if (!window.confirm("Are you sure you want to remove all items from your shopping list?")) {
      return;
    }
    const storageKey = `${CHECKED_INGREDIENTS_STORAGE_KEY}_week${week}`;
    localStorage.removeItem(storageKey);
    
    // Only remove recipe-based ingredients, keep custom ones
    const customIngredients = ingredients.filter(ing => ing.isCustom);
    setIngredients(customIngredients);
    
    toast({
      title: "List cleared",
      description: "All recipe ingredients removed from shopping list",
    });
  };
  
  const handleAddCustomItem = () => {
    if (!newItem.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive"
      });
      return;
    }
    
    const qty = newItemQty ? parseFloat(newItemQty) : undefined;
    
    const newIngredient: Ingredient = {
      name: newItem.toLowerCase(),
      checked: false,
      recipeIds: [],
      totalQty: qty,
      unit: newItemUnit,
      isCustom: true
    };
    
    setIngredients(prev => [...prev, newIngredient]);
    
    toast({
      title: "Item added",
      description: `${newItem} added to shopping list`,
    });
    
    // Reset form
    setNewItem("");
    setNewItemQty("");
    setNewItemUnit("");
  };

  const handleShare = async () => {
    let shareText = "Shopping List:\n\n";
    Object.entries(categorizedIngredients).forEach(([category, items]) => {
      shareText += `${category}:\n`;
      items.forEach(item => {
        shareText += `- ${item.totalQty ? `${item.totalQty} ` : ''}${item.unit ? `${item.unit} ` : ''}${item.name}\n`;
      });
      shareText += '\n';
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shopping List',
          text: shareText
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "List copied",
        description: "Shopping list copied to clipboard",
      });
    }
  };

  const getRecipeForIngredient = (recipeId: string): Recipe | undefined => {
    return mockRecipes.find(recipe => recipe.id === recipeId);
  };

  const categories = [
    "Produce",
    "Meat & Seafood",
    "Dairy & Eggs",
    "Pantry",
    "Bakery",
    "Frozen",
    "Other"
  ];

  const categorizeIngredients = () => {
    const result: Record<string, Ingredient[]> = {};
    categories.forEach(category => {
      result[category] = [];
    });
    ingredients.forEach(ingredient => {
      // If it's a custom item, use the selected category
      if (ingredient.isCustom && ingredient.recipeIds.length === 0) {
        const category = ingredient.recipeIds.length > 0 ? categorizeByName(ingredient.name) : ingredient.category || "Other";
        result[category].push(ingredient);
        return;
      }
      
      const category = categorizeByName(ingredient.name);
      result[category].push(ingredient);
    });
    return Object.fromEntries(
      Object.entries(result).filter(([_, items]) => items.length > 0)
    );
  };
  
  const categorizeByName = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (/lettuce|onion|potato|tomato|carrot|spinach|garlic|pepper|broccoli|cucumber|lemon|lime|herbs|vegetable/i.test(nameLower)) {
      return "Produce";
    } else if (/chicken|beef|pork|fish|salmon|shrimp|turkey|meat/i.test(nameLower)) {
      return "Meat & Seafood";
    } else if (/milk|cheese|yogurt|cream|butter|egg/i.test(nameLower)) {
      return "Dairy & Eggs";
    } else if (/flour|sugar|oil|vinegar|rice|pasta|sauce|spice|salt|pepper|canned|dried/i.test(nameLower)) {
      return "Pantry";
    } else if (/bread|bun|bagel|muffin|roll|cake|pastry/i.test(nameLower)) {
      return "Bakery";
    } else if (/frozen|ice/i.test(nameLower)) {
      return "Frozen";
    } else {
      return "Other";
    }
  }

  // Updated: Handle copying just the ingredient name to clipboard
  const handleCopyIngredient = (ingredient: string) => {
    navigator.clipboard.writeText(ingredient);
    toast({
      title: "Copied",
      description: `"${ingredient}" copied to clipboard`,
    });
  };

  const categorizedIngredients = categorizeIngredients();
  const checkedCount = ingredients.filter(i => i.checked).length;

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <ListChecks className="h-6 w-6" />
              Shopping Lists
            </h1>
            <p className="text-sm text-muted-foreground">Manage and organize your shopping lists by week</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="px-2"
            title="Share shopping list"
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          {ingredients.length} items • {checkedCount} purchased
        </p>
        <ShoppingListActions
          onCheckAll={handleCheckAll}
          onUncheckAll={handleUncheckAll}
          onRemoveAll={handleRemoveAll}
        />
        
        {/* Simplified Custom Item Form */}
        <div className="flex items-center gap-2 mt-4">
          <Input 
            placeholder="Item name" 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-grow"
          />
          <Input 
            placeholder="Qty" 
            type="number"
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
            className="w-16"
          />
          <Input 
            placeholder="Unit" 
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            className="w-20"
          />
          <Button 
            onClick={handleAddCustomItem} 
            size="icon"
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {Object.entries(categorizedIngredients).map(([category, items]) => (
          <Card key={category}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">{category}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setSelectedCategory(category);
                  setNewItem("");
                  setNewItemQty("");
                  setNewItemUnit("");
                  document.getElementById("quick-add-item")?.focus();
                }}
                title={`Add to ${category}`}
              >
                <Plus className="h-4 w-4" />
              </Button>
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
                        {!ingredient.isCustom && ingredient.recipeIds.length > 0 && (
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
                        )}
                        {ingredient.isCustom && (
                          <div className="text-xs text-muted-foreground mt-1">Custom item</div>
                        )}
                      </div>
                      <div className="flex gap-1 items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyIngredient(ingredient.name)}
                          className="h-7 w-7 p-0"
                          title="Copy ingredient name"
                        >
                          <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          <span className="sr-only">Copy</span>
                        </Button>
                        <Separator orientation="vertical" className="h-4" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(originalIndex)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your shopping list?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRemoveItem}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveItem}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
