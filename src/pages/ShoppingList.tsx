import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks, Share, Trash2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useHouseholdShopping } from "@/contexts/HouseholdShoppingContext";
import { useRecipesLoader } from "@/hooks/useRecipesLoader";
import ShoppingListActions from "@/components/ShoppingListActions";

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

export default function ShoppingList() {
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
  
  // Load recipes automatically
  useRecipesLoader();

  // Helper function to categorize ingredients
  const categorizeIngredient = (ingredient: string): string => {
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
  };

  // Generate shopping list for each week and save to database
  useEffect(() => {
    const generateAndSaveWeekLists = async () => {
      if (!user || !currentHousehold || recipesLoading) return;

      console.log("Generating shopping lists with recipes:", recipes.length);
      console.log("Current household shopping items:", householdShoppingItems.length);

      const week1Plans = getMealPlansForWeek(1);
      const week2Plans = getMealPlansForWeek(2);
      
      console.log("Week 1 meal plans:", week1Plans);
      console.log("Week 2 meal plans:", week2Plans);

      // Process each week
      const processWeek = async (weekNumber: 1 | 2, plans: any[]) => {
        const weekKey = `week${weekNumber}`;
        console.log(`Processing ${weekKey} with ${plans.length} plans`);
        
        // Get existing shopping items for this week from household context
        const existingWeekItems = householdShoppingItems.filter(item => 
          item.name.startsWith(weekKey) || item.category.includes(weekKey)
        );
        
        console.log(`Existing ${weekKey} items:`, existingWeekItems);

        // Generate new items from meal plans
        const ingredientMap = new Map<string, { quantity: number; recipeIds: string[] }>();
        
        plans.forEach(plan => {
          const recipe = recipes.find(r => r.id === plan.recipeId);
          if (recipe) {
            console.log(`Processing recipe: ${recipe.title} for ${weekKey}`);
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

        // Convert to shopping items and merge with existing
        const generatedItems: ShoppingItem[] = [];
        
        for (const [ingredient, data] of ingredientMap.entries()) {
          // Check if this item already exists in the database
          const existingItem = existingWeekItems.find(item => 
            item.name.toLowerCase().includes(ingredient.toLowerCase())
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
            const itemName = `${weekKey}-${ingredient}`;
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
                id: `temp-${Date.now()}-${ingredient}`, // Temporary ID until we get the real one
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
      };

      const week1Items = await processWeek(1, week1Plans);
      const week2Items = await processWeek(2, week2Plans);

      setWeekShoppingItems({
        1: week1Items,
        2: week2Items
      });
    };

    generateAndSaveWeekLists();
  }, [getMealPlansForWeek, recipes, user, currentHousehold, recipesLoading, householdShoppingItems, addShoppingItem]);

  const currentWeekItems = weekShoppingItems[selectedWeek];

  // Group items by category
  const itemsByCategory = SHOPPING_CATEGORIES.reduce((acc, category) => {
    acc[category] = currentWeekItems.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

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

  const getRecipeNames = (recipeIds: string[]): string => {
    const recipeNames = recipeIds
      .map(id => recipes.find(recipe => recipe.id === id)?.title)
      .filter(Boolean)
      .join(", ");
    return recipeNames;
  };

  const handleCheckAll = async () => {
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

  if (!user) {
    return (
      <div className="container max-w-xl py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-4 flex items-center justify-center gap-2">
            <ListChecks className="h-6 w-6" />
            Shopping List
          </h1>
          <p className="text-muted-foreground">Please log in to view your shopping list.</p>
        </div>
      </div>
    );
  }

  if (!currentHousehold) {
    return (
      <div className="container max-w-xl py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-4 flex items-center justify-center gap-2">
            <ListChecks className="h-6 w-6" />
            Shopping List
          </h1>
          <p className="text-muted-foreground mb-4">Please select or create a household to view shopping lists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <ListChecks className="h-6 w-6" />
            Shopping List
          </h1>
          <p className="text-sm text-muted-foreground">
            Generated from your weekly meal plans
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[1, 2].map((week) => (
          <Button
            key={week}
            size="sm"
            variant={selectedWeek === week ? "default" : "outline"}
            className={selectedWeek === week ? "bg-terracotta text-white" : ""}
            onClick={() => setSelectedWeek(week as 1 | 2)}
          >
            Week {week}
          </Button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <Button onClick={handleShare} variant="outline" size="sm" className="flex-1">
          <Share className="h-4 w-4 mr-2" />
          Share List
        </Button>
      </div>

      {recipesLoading || shoppingLoading ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">Loading recipes and generating shopping list...</p>
        </div>
      ) : currentWeekItems.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No items in your shopping list for Week {selectedWeek}</p>
            <p className="text-sm text-muted-foreground mt-2">Add some meals to your meal planner to generate a shopping list!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {SHOPPING_CATEGORIES.map(category => {
              const categoryItems = itemsByCategory[category];
              if (categoryItems.length === 0) return null;

              return (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium text-terracotta">
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-2 rounded hover:bg-accent">
                        <Checkbox
                          checked={item.isChecked}
                          onCheckedChange={(checked) => handleCheckItem(item.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className={`${item.isChecked ? 'line-through text-muted-foreground' : ''}`}>
                            <span className="font-medium">
                              {item.quantity > 1 && `${item.quantity}x `}
                              {item.name.replace(/^week\d+-/, '')}
                            </span>
                            {item.unit && <span className="text-sm text-muted-foreground ml-1">({item.unit})</span>}
                          </div>
                          {item.recipeIds.length > 0 && (
                            <div className="text-xs text-green-600 mt-1">
                              From: {getRecipeNames(item.recipeIds)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyItem(item.name, item.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            {copiedItemId === item.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <ShoppingListActions
            onCheckAll={handleCheckAll}
            onUncheckAll={handleUncheckAll}
            onRemoveAll={handleRemoveAll}
          />
        </>
      )}
    </div>
  );
}
