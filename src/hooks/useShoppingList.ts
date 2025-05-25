
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
  
  // Use ref instead of state to prevent re-renders
  const generationTracker = useRef<{
    [key: string]: boolean;
  }>({});

  const { getMealPlansForWeek } = useMealPlan();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { 
    shoppingItems: householdShoppingItems, 
    updateShoppingItem, 
    addShoppingItem,
    deleteShoppingItem,
    isLoading: shoppingLoading 
  } = useHouseholdShopping();

  // Helper function to categorize ingredients - memoized to prevent recreating
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

  // Get shopping items for a specific week - memoized to prevent recreating
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

  // Reset generation tracker when household changes
  useEffect(() => {
    if (currentHousehold?.id) {
      generationTracker.current = {};
    }
  }, [currentHousehold?.id]);

  // Generate shopping list - COMPLETELY REWRITTEN to prevent infinite loop
  useEffect(() => {
    if (!user || !currentHousehold || recipesLoading) return;
    
    // Create a unique key for this generation attempt
    const generationKey = `${currentHousehold.id}-${recipes.length}`;
    
    // Skip if already generated for this combination
    if (generationTracker.current[generationKey]) {
      return;
    }

    console.log("Starting shopping list generation for key:", generationKey);

    const generateShoppingList = async () => {
      try {
        const week1Plans = getMealPlansForWeek(1);
        const week2Plans = getMealPlansForWeek(2);
        
        console.log("Week 1 meal plans:", week1Plans.length);
        console.log("Week 2 meal plans:", week2Plans.length);

        // Only generate if there are meal plans
        if (week1Plans.length === 0 && week2Plans.length === 0) {
          generationTracker.current[generationKey] = true;
          return;
        }

        // Process both weeks
        for (const [weekNumber, plans] of [[1, week1Plans], [2, week2Plans]] as const) {
          if (plans.length === 0) continue;

          const weekKey = `week${weekNumber}`;
          console.log(`Processing ${weekKey} with ${plans.length} plans`);
          
          // Get existing shopping items for this week
          const existingWeekItems = householdShoppingItems.filter(item => 
            item.name.startsWith(`${weekKey}-`)
          );
          
          // Generate ingredient map
          const ingredientMap = new Map<string, { quantity: number; recipeIds: string[] }>();
          
          plans.forEach(plan => {
            const recipe = recipes.find(r => r.id === plan.recipeId);
            if (recipe && recipe.ingredients) {
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
            }
          });

          console.log(`Generated ${ingredientMap.size} unique ingredients for ${weekKey}`);

          // Add new items that don't already exist
          for (const [ingredient, data] of ingredientMap.entries()) {
            const itemName = `${weekKey}-${ingredient}`;
            
            // Check if this exact item already exists
            const existingItem = existingWeekItems.find(item => 
              item.name === itemName
            );

            if (!existingItem) {
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
                console.log(`Adding new shopping item: ${itemName}`);
                await addShoppingItem(newItemData);
              } catch (error) {
                console.error('Error adding shopping item:', error);
              }
            }
          }
        }
        
        // Mark as generated to prevent re-running
        generationTracker.current[generationKey] = true;
        console.log("Shopping list generation completed for key:", generationKey);
      } catch (error) {
        console.error('Error generating shopping list:', error);
      }
    };

    generateShoppingList();
  }, [user?.id, currentHousehold?.id, recipes.length, recipesLoading]); // Only stable dependencies

  // Get current week items using the helper function
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
    
    // Update all items in database
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
    
    // Update all items in database
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
      // Remove all items from database
      for (const item of currentWeekItems) {
        try {
          await deleteShoppingItem(item.id);
        } catch (error) {
          console.error('Error deleting shopping item:', error);
        }
      }
      // Reset generation tracker to allow regeneration
      generationTracker.current = {};
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
