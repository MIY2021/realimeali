
import { useState, useCallback, useMemo } from "react";
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
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Memoize the shopping items to prevent excessive re-calculations
  const weekShoppingItems = useMemo(() => {
    if (!user || !currentHousehold) {
      return { 1: [], 2: [] };
    }
    
    const week1Items = householdShoppingItems
      .filter(item => item.name.startsWith('week1-'))
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

    const week2Items = householdShoppingItems
      .filter(item => item.name.startsWith('week2-'))
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

    return {
      1: week1Items,
      2: week2Items
    };
  }, [householdShoppingItems, user, currentHousehold]);

  const handleCheckItem = useCallback(async (itemId: string, checked: boolean) => {
    try {
      await updateShoppingItem(itemId, { is_checked: checked });
    } catch (error) {
      console.error('Error updating shopping item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  }, [updateShoppingItem, toast]);

  const handleRemoveItem = useCallback(async (itemId: string) => {
    try {
      await deleteShoppingItem(itemId);
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  }, [deleteShoppingItem, toast]);

  const handleCopyItem = useCallback((itemName: string, itemId: string) => {
    const cleanName = itemName.replace(/^week\d+-/, '');
    navigator.clipboard.writeText(cleanName);
    
    setCopiedItemId(itemId);
    setTimeout(() => setCopiedItemId(null), 2000);
    
    toast({
      title: "Copied to clipboard",
      description: `"${cleanName}" copied to clipboard!`,
    });
  }, [toast]);

  const getRecipeNames = useCallback((recipeIds: string[]): string => {
    const recipeNames = recipeIds
      .map(id => recipes.find(recipe => recipe.id === id)?.title)
      .filter(Boolean)
      .join(", ");
    return recipeNames;
  }, [recipes]);

  const handleCheckAll = useCallback(async () => {
    const currentWeekItems = weekShoppingItems[selectedWeek];
    
    try {
      await Promise.all(
        currentWeekItems.map(item => 
          updateShoppingItem(item.id, { is_checked: true })
        )
      );
      toast({
        title: "All items checked",
        description: `Checked all items for week ${selectedWeek}`,
      });
    } catch (error) {
      console.error('Error checking all items:', error);
      toast({
        title: "Error",
        description: "Failed to check all items",
        variant: "destructive",
      });
    }
  }, [weekShoppingItems, selectedWeek, updateShoppingItem, toast]);

  const handleUncheckAll = useCallback(async () => {
    const currentWeekItems = weekShoppingItems[selectedWeek];
    
    try {
      await Promise.all(
        currentWeekItems.map(item => 
          updateShoppingItem(item.id, { is_checked: false })
        )
      );
      toast({
        title: "All items unchecked",
        description: `Unchecked all items for week ${selectedWeek}`,
      });
    } catch (error) {
      console.error('Error unchecking all items:', error);
      toast({
        title: "Error",
        description: "Failed to uncheck all items",
        variant: "destructive",
      });
    }
  }, [weekShoppingItems, selectedWeek, updateShoppingItem, toast]);

  const handleRemoveAll = useCallback(async () => {
    const currentWeekItems = weekShoppingItems[selectedWeek];
    
    if (currentWeekItems.length === 0) {
      toast({
        title: "No items to remove",
        description: `No items found for week ${selectedWeek}`,
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to remove all ${currentWeekItems.length} items from week ${selectedWeek}'s shopping list?`)) {
      return;
    }
    
    try {
      await Promise.all(
        currentWeekItems.map(item => deleteShoppingItem(item.id))
      );
      toast({
        title: "All items removed",
        description: `Removed all items from week ${selectedWeek}`,
      });
    } catch (error) {
      console.error('Error removing all items:', error);
      toast({
        title: "Error",
        description: "Failed to remove all items",
        variant: "destructive",
      });
    }
  }, [weekShoppingItems, selectedWeek, deleteShoppingItem, toast]);

  const handleShare = useCallback(() => {
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
  }, [weekShoppingItems, selectedWeek, toast]);

  // Manual generation function
  const generateShoppingList = useCallback(async (weekNumber: 1 | 2) => {
    if (!user || !currentHousehold || recipesLoading || recipes.length === 0 || isGenerating) {
      return;
    }

    setIsGenerating(true);

    try {
      const mealPlans = getMealPlansForWeek(weekNumber);
      console.log(`Generating shopping list for week ${weekNumber}, found ${mealPlans.length} meal plans`);
      
      if (mealPlans.length === 0) {
        toast({
          title: "No Meal Plans",
          description: `No meal plans found for week ${weekNumber}. Please add some meals to your meal planner first.`,
        });
        return;
      }

      // Clear existing items for this week
      const weekPrefix = `week${weekNumber}-`;
      const existingItems = householdShoppingItems.filter(item => 
        item.name.startsWith(weekPrefix)
      );

      console.log(`Clearing ${existingItems.length} existing items for week ${weekNumber}`);
      for (const item of existingItems) {
        await deleteShoppingItem(item.id);
      }

      // Generate ingredient map with proper deduplication
      const ingredientMap = new Map<string, { quantity: number; recipeIds: string[]; originalName: string }>();
      
      mealPlans.forEach(plan => {
        const recipe = recipes.find(r => r.id === plan.recipeId);
        console.log(`Processing meal plan for recipe: ${recipe?.title}`);
        
        if (recipe && recipe.ingredients) {
          recipe.ingredients.forEach(ingredient => {
            const normalizedName = normalizeIngredientName(ingredient);
            
            if (normalizedName.length > 0) {
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
    } catch (error) {
      console.error('Error generating shopping list:', error);
      toast({
        title: "Error",
        description: "Failed to generate shopping list",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [user, currentHousehold, recipes, recipesLoading, getMealPlansForWeek, householdShoppingItems, addShoppingItem, deleteShoppingItem, categorizeIngredient, normalizeIngredientName, toast, isGenerating]);

  return {
    user,
    currentHousehold,
    selectedWeek,
    setSelectedWeek,
    copiedItemId,
    weekShoppingItems,
    recipesLoading,
    shoppingLoading,
    isGenerating,
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
