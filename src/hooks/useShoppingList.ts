
import { useState, useEffect, useCallback, useRef } from "react";
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
  const [weekShoppingItems, setWeekShoppingItems] = useState<{
    1: ShoppingItem[];
    2: ShoppingItem[];
  }>({
    1: [],
    2: []
  });

  const { getMealPlansForWeek } = useMealPlan();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { 
    shoppingItems: householdShoppingItems, 
    updateShoppingItem, 
    addShoppingItem,
    deleteShoppingItem,
    isLoading: shoppingLoading 
  } = useHouseholdShopping();

  // Track last generation to prevent duplicates
  const lastGenerationRef = useRef<{
    week1Hash: string;
    week2Hash: string;
  }>({
    week1Hash: '',
    week2Hash: ''
  });

  // Debounce generation to prevent rapid fire updates
  const generationTimeoutRef = useRef<NodeJS.Timeout>();

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
    
    // Dietary, Lifestyle & World Foods
    if (/gluten.free|dairy.free|vegan|organic|free.range|coconut.milk|almond.milk|soy.milk|oat.milk|kimchi|miso|teriyaki|curry|garam.masala|chinese|thai|indian|mexican|mediterranean|kosher|halal/i.test(nameLower)) {
      return "Dietary, Lifestyle & World Foods";
    }
    
    // Soft Drinks, Tea & Coffee
    if (/juice|squash|cordial|water|sparkling|cola|lemonade|energy.drink|smoothie|kombucha|green.tea|black.tea|herbal.tea|coffee.beans|instant.coffee|decaf/i.test(nameLower)) {
      return "Soft Drinks, Tea & Coffee";
    }
    
    // Beer, Wine & Spirits
    if (/beer|wine|whisky|vodka|gin|rum|brandy|champagne|prosecco|cider|ale|lager|spirits|alcohol/i.test(nameLower)) {
      return "Beer, Wine & Spirits";
    }
    
    // Health, Beauty & Personal Care
    if (/shampoo|conditioner|soap|toothpaste|deodorant|moisturiser|sunscreen|vitamins|supplements|paracetamol|ibuprofen|plaster|antiseptic/i.test(nameLower)) {
      return "Health, Beauty & Personal Care";
    }
    
    // Baby, Parent & Kids
    if (/nappy|baby.food|formula|dummy|wipes|baby.oil|baby.powder|kids|children|junior/i.test(nameLower)) {
      return "Baby, Parent & Kids";
    }
    
    // Home Care & Cleaning
    if (/washing.powder|fabric.softener|bleach|disinfectant|toilet.paper|kitchen.roll|bin.bags|washing.up.liquid|dishwasher|tablets|cleaning|polish|hoover|vacuum/i.test(nameLower)) {
      return "Home Care & Cleaning";
    }
    
    // Pets, Home & Garden
    if (/dog.food|cat.food|pet.treats|bird.seed|fish.food|plant.food|compost|seeds|bulbs|garden|pet|animal/i.test(nameLower)) {
      return "Pets, Home & Garden";
    }
    
    // Occasions & Entertaining
    if (/candles|balloons|party|celebration|gift|card|wrapping|decorations|entertaining/i.test(nameLower)) {
      return "Occasions & Entertaining";
    }
    
    // Clothing & Accessories
    if (/socks|underwear|shirt|dress|jumper|jacket|shoes|hat|gloves|scarf|belt|bag|watch|jewellery/i.test(nameLower)) {
      return "Clothing & Accessories";
    }
    
    // Default fallback
    return "Food Cupboard";
  }, []);

  // Generate hash of meal plans to detect changes
  const generateMealPlanHash = useCallback((weekNumber: 1 | 2): string => {
    const plans = getMealPlansForWeek(weekNumber);
    return plans.map(p => `${p.recipeId}-${p.slotIndex}`).sort().join('|');
  }, [getMealPlansForWeek]);

  // Generate shopping list for a specific week
  const generateWeekShoppingList = useCallback(async (weekNumber: 1 | 2) => {
    if (!user || !currentHousehold || recipesLoading) return;

    const plans = getMealPlansForWeek(weekNumber);
    const weekKey = `week${weekNumber}`;
    
    console.log(`Generating shopping list for ${weekKey} with ${plans.length} plans`);

    // Validate that recipes are loaded and available
    if (recipes.length === 0) {
      console.log('No recipes loaded yet, skipping generation');
      return;
    }

    // Get existing items for this week from database (without triggering re-renders)
    const existingWeekItems = householdShoppingItems.filter(item => 
      item.name.startsWith(weekKey)
    );

    // Generate ingredient map from meal plans
    const ingredientMap = new Map<string, { quantity: number; recipeIds: string[] }>();
    
    plans.forEach(plan => {
      const recipe = recipes.find(r => r.id === plan.recipeId);
      if (recipe && recipe.ingredients) {
        console.log(`Processing recipe: ${recipe.title} with ${recipe.ingredients.length} ingredients`);
        recipe.ingredients.forEach(ingredient => {
          const key = ingredient.toLowerCase();
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.quantity += 1;
            if (!existing.recipeIds.includes(recipe.id)) {
              existing.recipeIds.push(recipe.id);
            }
          } else {
            ingredientMap.set(key, {
              quantity: 1,
              recipeIds: [recipe.id]
            });
          }
        });
      } else {
        console.warn(`Recipe not found for meal plan: ${plan.recipeId}`);
      }
    });

    console.log(`Generated ${ingredientMap.size} unique ingredients for ${weekKey}`);

    // Convert to shopping items and merge with existing
    const generatedItems: ShoppingItem[] = [];
    
    for (const [ingredient, data] of ingredientMap.entries()) {
      const itemName = `${weekKey}-${ingredient}`;
      
      // Check if this item already exists
      const existingItem = existingWeekItems.find(item => 
        item.name === itemName
      );

      if (existingItem) {
        // Use existing item (preserves checked state)
        generatedItems.push({
          id: existingItem.id,
          name: existingItem.name,
          quantity: existingItem.quantity || data.quantity,
          unit: existingItem.unit || '',
          isChecked: existingItem.is_checked,
          category: existingItem.category,
          isCustom: existingItem.is_custom,
          recipeIds: existingItem.recipe_ids || data.recipeIds
        });
      } else {
        // Create new item and add to database
        const newItemData = {
          name: itemName,
          quantity: data.quantity,
          unit: '',
          category: categorizeIngredient(ingredient),
          is_checked: false,
          is_custom: false,
          recipe_ids: data.recipeIds
        };

        try {
          await addShoppingItem(newItemData);
          generatedItems.push({
            id: `temp-${Date.now()}-${ingredient}`,
            name: itemName,
            quantity: data.quantity,
            unit: '',
            isChecked: false,
            category: categorizeIngredient(ingredient),
            isCustom: false,
            recipeIds: data.recipeIds
          });
        } catch (error) {
          console.error('Error adding shopping item:', error);
        }
      }
    }

    return generatedItems;
  }, [user, currentHousehold, recipesLoading, recipes, addShoppingItem, categorizeIngredient, getMealPlansForWeek]);

  // Generate shopping lists with debouncing and duplicate prevention
  useEffect(() => {
    if (!user || !currentHousehold || recipesLoading || recipes.length === 0) return;

    // Clear any existing timeout
    if (generationTimeoutRef.current) {
      clearTimeout(generationTimeoutRef.current);
    }

    // Debounce generation
    generationTimeoutRef.current = setTimeout(async () => {
      const week1Hash = generateMealPlanHash(1);
      const week2Hash = generateMealPlanHash(2);

      // Only generate if meal plans have actually changed
      if (week1Hash !== lastGenerationRef.current.week1Hash || 
          week2Hash !== lastGenerationRef.current.week2Hash) {
        
        console.log("Meal plans changed, regenerating shopping lists");
        
        const [week1Items, week2Items] = await Promise.all([
          generateWeekShoppingList(1),
          generateWeekShoppingList(2)
        ]);

        setWeekShoppingItems({
          1: week1Items || [],
          2: week2Items || []
        });

        // Update generation tracking
        lastGenerationRef.current = {
          week1Hash,
          week2Hash
        };
      }
    }, 500); // 500ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }
    };
  }, [user, currentHousehold, recipesLoading, recipes.length, generateMealPlanHash, generateWeekShoppingList]);

  // Initialize shopping lists from existing database items
  useEffect(() => {
    if (!user || !currentHousehold) return;

    const week1Items: ShoppingItem[] = [];
    const week2Items: ShoppingItem[] = [];

    householdShoppingItems.forEach(item => {
      const shoppingItem: ShoppingItem = {
        id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || '',
        isChecked: item.is_checked,
        category: item.category,
        isCustom: item.is_custom,
        recipeIds: item.recipe_ids || []
      };

      if (item.name.startsWith('week1-')) {
        week1Items.push(shoppingItem);
      } else if (item.name.startsWith('week2-')) {
        week2Items.push(shoppingItem);
      }
    });

    setWeekShoppingItems({
      1: week1Items,
      2: week2Items
    });
  }, [user, currentHousehold]);

  const handleCheckItem = async (itemId: string, checked: boolean) => {
    // Update local state immediately for responsiveness
    setWeekShoppingItems(prev => ({
      ...prev,
      [selectedWeek]: prev[selectedWeek].map(item =>
        item.id === itemId ? { ...item, isChecked: checked } : item
      )
    }));

    // Update in database
    try {
      await updateShoppingItem(itemId, { is_checked: checked });
    } catch (error) {
      console.error('Error updating shopping item:', error);
      // Revert local state if database update fails
      setWeekShoppingItems(prev => ({
        ...prev,
        [selectedWeek]: prev[selectedWeek].map(item =>
          item.id === itemId ? { ...item, isChecked: !checked } : item
        )
      }));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    // Update local state immediately
    setWeekShoppingItems(prev => ({
      ...prev,
      [selectedWeek]: prev[selectedWeek].filter(item => item.id !== itemId)
    }));

    // Remove from database
    try {
      await deleteShoppingItem(itemId);
    } catch (error) {
      console.error('Error deleting shopping item:', error);
    }
  };

  const handleCopyItem = (itemName: string, itemId: string) => {
    // Extract just the name without week prefix
    const cleanName = itemName.replace(/^week\d+-/, '');
    navigator.clipboard.writeText(cleanName);
    
    // Show visual feedback
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
    const updates = currentWeekItems.map(item => ({ id: item.id, is_checked: true }));
    
    setWeekShoppingItems(prev => ({
      ...prev,
      [selectedWeek]: prev[selectedWeek].map(item => ({ ...item, isChecked: true }))
    }));

    // Update all items in database
    for (const update of updates) {
      try {
        await updateShoppingItem(update.id, { is_checked: update.is_checked });
      } catch (error) {
        console.error('Error updating shopping item:', error);
      }
    }
  };

  const handleUncheckAll = async () => {
    const currentWeekItems = weekShoppingItems[selectedWeek];
    const updates = currentWeekItems.map(item => ({ id: item.id, is_checked: false }));
    
    setWeekShoppingItems(prev => ({
      ...prev,
      [selectedWeek]: prev[selectedWeek].map(item => ({ ...item, isChecked: false }))
    }));

    // Update all items in database
    for (const update of updates) {
      try {
        await updateShoppingItem(update.id, { is_checked: update.is_checked });
      } catch (error) {
        console.error('Error updating shopping item:', error);
      }
    }
  };

  const handleRemoveAll = async () => {
    const currentWeekItems = weekShoppingItems[selectedWeek];
    if (window.confirm("Are you sure you want to remove all items from this week's shopping list?")) {
      // Remove all items from database
      for (const item of currentWeekItems) {
        try {
          await deleteShoppingItem(item.id);
        } catch (error) {
          console.error('Error deleting shopping item:', error);
        }
      }

      setWeekShoppingItems(prev => ({
        ...prev,
        [selectedWeek]: []
      }));
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
    handleShare
  };
}
