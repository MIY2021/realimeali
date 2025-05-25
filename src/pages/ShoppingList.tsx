import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks, Share, Trash2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
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
  const [weekShoppingItems, setWeekShoppingItems] = useState<{
    1: ShoppingItem[];
    2: ShoppingItem[];
  }>({
    1: [],
    2: []
  });

  const { getMealPlansForWeek } = useMealPlan();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  
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

  // Generate shopping list for each week
  useEffect(() => {
    const generateWeekLists = async () => {
      if (!user || !currentHousehold || recipesLoading) return;

      console.log("Generating shopping lists with recipes:", recipes.length);

      const week1Plans = getMealPlansForWeek(1);
      const week2Plans = getMealPlansForWeek(2);

      // Convert meal plans to shopping items for each week
      const week1Items: ShoppingItem[] = [];
      const week2Items: ShoppingItem[] = [];

      [week1Plans, week2Plans].forEach((plans, weekIndex) => {
        const targetArray = weekIndex === 0 ? week1Items : week2Items;
        
        plans.forEach(plan => {
          const recipe = recipes.find(r => r.id === plan.recipeId);
          if (recipe) {
            recipe.ingredients.forEach(ingredient => {
              const existingItem = targetArray.find(item => 
                item.name.toLowerCase() === ingredient.toLowerCase()
              );
              
              if (existingItem) {
                existingItem.quantity += 1;
                existingItem.recipeIds.push(recipe.id);
              } else {
                targetArray.push({
                  id: `${recipe.id}-${ingredient}-week${weekIndex + 1}`,
                  name: ingredient,
                  quantity: 1,
                  unit: '',
                  isChecked: false,
                  category: categorizeIngredient(ingredient),
                  isCustom: false,
                  recipeIds: [recipe.id]
                });
              }
            });
          }
        });
      });

      setWeekShoppingItems({
        1: week1Items,
        2: week2Items
      });
    };

    generateWeekLists();
  }, [getMealPlansForWeek, recipes, user, currentHousehold, recipesLoading]);

  const currentWeekItems = weekShoppingItems[selectedWeek];

  // Group items by category
  const itemsByCategory = SHOPPING_CATEGORIES.reduce((acc, category) => {
    acc[category] = currentWeekItems.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const handleCheckItem = (itemId: string, checked: boolean) => {
    setWeekShoppingItems(prev => ({
      ...prev,
      [selectedWeek]: prev[selectedWeek].map(item =>
        item.id === itemId ? { ...item, isChecked: checked } : item
      )
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setWeekShoppingItems(prev => ({
      ...prev,
      [selectedWeek]: prev[selectedWeek].filter(item => item.id !== itemId)
    }));
  };

  const handleCopyItem = (itemName: string) => {
    navigator.clipboard.writeText(itemName);
    toast({
      title: "Copied to clipboard",
      description: `"${itemName}" copied to clipboard!`,
    });
  };

  const getRecipeNames = (recipeIds: string[]): string => {
    const recipeNames = recipeIds
      .map(id => recipes.find(recipe => recipe.id === id)?.title)
      .filter(Boolean)
      .join(", ");
    return recipeNames;
  };

  const handleCheckAll = () => {
    setWeekShoppingItems(prev => ({
      ...prev,
      [selectedWeek]: prev[selectedWeek].map(item => ({ ...item, isChecked: true }))
    }));
  };

  const handleUncheckAll = () => {
    setWeekShoppingItems(prev => ({
      ...prev,
      [selectedWeek]: prev[selectedWeek].map(item => ({ ...item, isChecked: false }))
    }));
  };

  const handleRemoveAll = () => {
    if (window.confirm("Are you sure you want to remove all items from this week's shopping list?")) {
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
          shareText += `☐ ${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name}${item.unit ? ` (${item.unit})` : ''}\n`;
        });
        
        checkedItems.forEach(item => {
          shareText += `☑ ${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name}${item.unit ? ` (${item.unit})` : ''}\n`;
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

      {recipesLoading ? (
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
                              {item.quantity > 1 && `${item.quantity}x `}{item.name}
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
                            onClick={() => handleCopyItem(item.name)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Copy className="h-4 w-4" />
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
