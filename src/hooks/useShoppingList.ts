
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useHouseholdShopping } from "@/contexts/HouseholdShoppingContext";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  isChecked: boolean;
  category: string;
  isCustom: boolean;
  recipeIds: string[];
}

export function useShoppingList() {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState<1 | 2>(1);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

  const { getMealPlansForWeek } = useMealPlan();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { 
    shoppingItems: householdShoppingItems, 
    updateShoppingItem, 
    addShoppingItem,
    deleteShoppingItem,
    isLoading: shoppingLoading 
  } = useHouseholdShopping();

  // Helper function to categorize ingredients
  const categorizeIngredient = useCallback((ingredient: string): string => {
    const nameLower = ingredient.toLowerCase();
    
    // Fresh & Chilled Food
    if (/lettuce|spinach|kale|rocket|watercress|cabbage|broccoli|cauliflower|carrot|onion|potato|tomato|cucumber|pepper|courgette|aubergine|mushroom|garlic|ginger|lemon|lime|orange|apple|banana|grapes|strawberry|avocado|herbs|parsley|coriander|basil|thyme|rosemary|fresh|salad|vegetable|fruit|meat|chicken|beef|pork|lamb|fish|salmon|cod|prawns|bacon|ham|sausage|mince|steak|milk|cheese|yogurt|cream|butter|egg|tofu/i.test(nameLower)) {
      return "Fresh & Chilled Food";
    }
    
    // Food Cupboard
    if (/flour|sugar|salt|pepper|oil|vinegar|rice|pasta|noodles|quinoa|couscous|bulgur|lentils|beans|chickpeas|tinned|canned|jar|sauce|paste|stock|cube|spice|spices|cumin|paprika|turmeric|cinnamon|vanilla|honey|syrup|nuts|seeds|dried|cereal|oats|biscuits|crackers|tea|coffee|condiment|ketchup|mustard|mayo|mayonnaise|dressing|coconut|tahini|peanut|almond|olive|sunflower|rapeseed|balsamic|soy|worcestershire|tabasco|harissa/i.test(nameLower)) {
      return "Food Cupboard";
    }
    
    // Bakery
    if (/bread|bun|roll|bagel|muffin|croissant|pastry|cake|loaf|baguette|pitta|naan|tortilla|wrap|crumpet|scone/i.test(nameLower)) {
      return "Bakery";
    }
    
    // Frozen Food
    if (/frozen|ice|sorbet|gelato|peas|chips|pizza|ready meal/i.test(nameLower)) {
      return "Frozen Food";
    }
    
    // Default fallback
    return "Food Cupboard";
  }, []);

  // Helper function to normalize ingredient names for deduplication
  const normalizeIngredientName = useCallback((ingredient: string): string => {
    return ingredient
      .toLowerCase()
      .replace(/^(\d+\.?\d*)\s*(tbsp|tsp|cup|cups|g|kg|ml|l|oz|lb|pounds?|tablespoons?|teaspoons?|cloves?)\s*/, '') // Remove quantities and units
      .replace(/,.*$/, '') // Remove everything after comma
      .replace(/\(.*?\)/g, '') // Remove parenthetical content
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }, []);

  // Get shopping items for a specific week
  const getWeekShoppingItems = useCallback((weekNumber: 1 | 2): ShoppingItem[] => {
    if (!user || !currentHousehold) return [];
    
    const weekPrefix = `week${weekNumber}-`;
    const weekItems = householdShoppingItems
      .filter(item => item.name.startsWith(weekPrefix))
      .map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || '',
        isChecked: item.is_checked,
        category: item.category,
        isCustom: item.is_custom,
        recipeIds: item.recipe_ids || []
      }));
    
    return weekItems;
  }, [householdShoppingItems, user, currentHousehold]);

  // Get current week items
  const weekShoppingItems = {
    1: getWeekShoppingItems(1),
    2: getWeekShoppingItems(2)
  };

  const handleCheckItem = async (itemId: string, checked: boolean) => {
    try {
      await updateShoppingItem(itemId, { is_checked: checked });
    } catch (error) {
      console.error('Error updating shopping item:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await deleteShoppingItem(itemId);
    } catch (error) {
      console.error('Error deleting shopping item:', error);
    }
  };

  const handleCopyItem = (itemName: string, itemId: string) => {
    const cleanName = itemName.replace(/^week\d+-/, '');
    navigator.clipboard.writeText(cleanName);
    
    setCopiedItemId(itemId);
    setTimeout(() => setCopiedItemId(null), 2000);
    
    toast({
      title: "Copied to clipboard",
      description: `"${cleanName}" copied to clipboard!`,
    });
  };

  const getRecipeNames = useCallback((recipeIds: string[]): string => {
    const recipeNames = recipeIds
      .map(id => recipes.find(recipe => recipe.id === id)?.title)
      .filter(Boolean)
      .join(", ");
    return recipeNames;
  }, [recipes]);

  const handleCheckAll = async () => {
    const currentWeekItems = weekShoppingItems[selectedWeek];
    
    for (const item of currentWeekItems) {
      try {
        await updateShoppingItem(item.id, { is_checked: true });
      } catch (error) {
        console.error('Error updating shopping item:', error);
      }
    }
  };

  const handleUncheckAll = async () => {
    const currentWeekItems = weekShoppingItems[selectedWeek];
    
    for (const item of currentWeekItems) {
      try {
        await updateShoppingItem(item.id, { is_checked: false });
      } catch (error) {
        console.error('Error updating shopping item:', error);
      }
    }
  };

  const handleRemoveAll = async () => {
    const currentWeekItems = weekShoppingItems[selectedWeek];
    if (window.confirm("Are you sure you want to remove all items from this week's shopping list?")) {
      for (const item of currentWeekItems) {
        try {
          await deleteShoppingItem(item.id);
        } catch (error) {
          console.error('Error deleting shopping item:', error);
        }
      }
    }
  };

  const handleShare = () => {
    const currentWeekItems = weekShoppingItems[selectedWeek];
    const SHOPPING_CATEGORIES = [
      "Fresh & Chilled Food",
      "Food Cupboard", 
      "Bakery",
      "Frozen Food",
      "Dietary, Lifestyle & World Foods",
      "Soft Drinks, Tea & Coffee",
      "Beer, Wine & Spirits",
      "Health, Beauty & Personal Care",
      "Baby, Parent & Kids",
      "Home Care & Cleaning",
      "Pets, Home & Garden",
      "Occasions & Entertaining",
      "Clothing & Accessories"
    ];

    // Group items by category
    const itemsByCategory = SHOPPING_CATEGORIES.reduce((acc, category) => {
      acc[category] = currentWeekItems.filter(item => item.category === category);
      return acc;
    }, {} as Record<string, ShoppingItem[]>);

    let shareText = `Shopping List - Week ${selectedWeek}\n\n`;
    
    SHOPPING_CATEGORIES.forEach(category => {
      const categoryItems = itemsByCategory[category];
      if (categoryItems.length > 0) {
        shareText += `${category.toUpperCase()}\n`;
        
        const uncheckedItems = categoryItems.filter(item => !item.isChecked);
        const checkedItems = categoryItems.filter(item => item.isChecked);
        
        uncheckedItems.forEach(item => {
          const cleanName = item.name.replace(/^week\d+-/, '');
          shareText += `☐ ${item.quantity > 1 ? `${item.quantity}x ` : ''}${cleanName}${item.unit ? ` (${item.unit})` : ''}\n`;
        });
        
        checkedItems.forEach(item => {
          const cleanName = item.name.replace(/^week\d+-/, '');
          shareText += `☑ ${item.quantity > 1 ? `${item.quantity}x ` : ''}${cleanName}${item.unit ? ` (${item.unit})` : ''}\n`;
        });
        
        shareText += "\n";
      }
    });

    if (navigator.share) {
      navigator.share({ title: `Shopping List - Week ${selectedWeek}`, text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard",
        description: "Shopping list copied to clipboard!",
      });
    }
  };

  // Manual generation function - fixed to handle duplicates properly
  const generateShoppingList = useCallback(async (weekNumber: 1 | 2) => {
    if (!user || !currentHousehold || recipesLoading || recipes.length === 0) {
      return;
    }

    const mealPlans = getMealPlansForWeek(weekNumber);
    if (mealPlans.length === 0) {
      toast({
        title: "No Meal Plans",
        description: `No meal plans found for week ${weekNumber}`,
      });
      return;
    }

    console.log(`Generating shopping list for week ${weekNumber} with ${mealPlans.length} meal plans`);

    // Clear existing items for this week
    const weekPrefix = `week${weekNumber}-`;
    const existingItems = householdShoppingItems.filter(item => 
      item.name.startsWith(weekPrefix)
    );

    for (const item of existingItems) {
      await deleteShoppingItem(item.id);
    }

    // Generate ingredient map with proper deduplication
    const ingredientMap = new Map<string, { quantity: number; recipeIds: string[]; originalName: string }>();
    
    mealPlans.forEach(plan => {
      const recipe = recipes.find(r => r.id === plan.recipeId);
      if (recipe && recipe.ingredients) {
        console.log(`Processing recipe: ${recipe.title} with ${recipe.ingredients.length} ingredients`);
        
        recipe.ingredients.forEach(ingredient => {
          const normalizedName = normalizeIngredientName(ingredient);
          
          if (normalizedName.length > 0) { // Only add non-empty ingredients
            if (ingredientMap.has(normalizedName)) {
              const existing = ingredientMap.get(normalizedName)!;
              existing.quantity += 1;
              if (!existing.recipeIds.includes(recipe.id)) {
                existing.recipeIds.push(recipe.id);
              }
            } else {
              ingredientMap.set(normalizedName, {
                quantity: 1,
                recipeIds: [recipe.id],
                originalName: ingredient
              });
            }
          }
        });
      }
    });

    console.log(`Generated ${ingredientMap.size} unique ingredients`);

    // Add new items
    for (const [normalizedName, data] of ingredientMap.entries()) {
      try {
        await addShoppingItem({
          name: `${weekPrefix}${normalizedName}`,
          quantity: data.quantity,
          unit: '',
          category: categorizeIngredient(normalizedName),
          is_checked: false,
          is_custom: false,
          recipe_ids: data.recipeIds
        });
      } catch (error) {
        console.error('Error adding shopping item:', error);
      }
    }

    toast({
      title: "Shopping List Generated",
      description: `Generated shopping list for week ${weekNumber} with ${ingredientMap.size} items`,
    });
  }, [user, currentHousehold, recipes, recipesLoading, getMealPlansForWeek, householdShoppingItems, addShoppingItem, deleteShoppingItem, categorizeIngredient, normalizeIngredientName, toast]);

  return {
    user,
    currentHousehold,
    selectedWeek,
    setSelectedWeek,
    copiedItemId,
    weekShoppingItems,
    recipesLoading,
    shoppingLoading,
    handleCheckItem,
    handleRemoveItem,
    handleCopyItem,
    getRecipeNames,
    handleCheckAll,
    handleUncheckAll,
    handleRemoveAll,
    handleShare,
    generateShoppingList
  };
}
