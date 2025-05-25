import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useToast } from "@/hooks/use-toast";

interface ShoppingListItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category: string;
  isChecked: boolean;
  isCustom: boolean;
  recipeIds: string[];
}

interface ShoppingListCategory {
  [key: string]: ShoppingListItem[];
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

export const useShoppingList = (weekNumber: 1 | 2) => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { getMealPlansForWeek } = useMealPlan();
  const { recipes } = useRecipes();
  const { toast } = useToast();
  
  const [shoppingList, setShoppingList] = useState<ShoppingListCategory>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const categorizeIngredient = useCallback((ingredient: string): string => {
    const lower = ingredient.toLowerCase();
    
    // Fresh & Chilled Food
    if (lower.includes('lettuce') || lower.includes('spinach') || lower.includes('kale') || 
        lower.includes('rocket') || lower.includes('watercress') || lower.includes('cabbage') || 
        lower.includes('broccoli') || lower.includes('cauliflower') || lower.includes('carrot') || 
        lower.includes('onion') || lower.includes('potato') || lower.includes('tomato') || 
        lower.includes('cucumber') || lower.includes('pepper') || lower.includes('courgette') || 
        lower.includes('aubergine') || lower.includes('mushroom') || lower.includes('garlic') || 
        lower.includes('ginger') || lower.includes('lemon') || lower.includes('lime') || 
        lower.includes('orange') || lower.includes('apple') || lower.includes('banana') || 
        lower.includes('grapes') || lower.includes('strawberry') || lower.includes('avocado') || 
        lower.includes('herbs') || lower.includes('parsley') || lower.includes('coriander') || 
        lower.includes('basil') || lower.includes('thyme') || lower.includes('rosemary') || 
        lower.includes('fresh') || lower.includes('salad') || lower.includes('vegetable') || 
        lower.includes('fruit') || lower.includes('meat') || lower.includes('chicken') || 
        lower.includes('beef') || lower.includes('pork') || lower.includes('lamb') || 
        lower.includes('fish') || lower.includes('salmon') || lower.includes('cod') || 
        lower.includes('prawns') || lower.includes('bacon') || lower.includes('ham') || 
        lower.includes('sausage') || lower.includes('mince') || lower.includes('steak') || 
        lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || 
        lower.includes('cream') || lower.includes('butter') || lower.includes('egg') || 
        lower.includes('tofu')) {
      return "Fresh & Chilled Food";
    }
    
    // Food Cupboard
    if (lower.includes('flour') || lower.includes('sugar') || lower.includes('salt') || 
        lower.includes('pepper') || lower.includes('oil') || lower.includes('vinegar') || 
        lower.includes('rice') || lower.includes('pasta') || lower.includes('noodles') || 
        lower.includes('quinoa') || lower.includes('couscous') || lower.includes('bulgur') || 
        lower.includes('lentils') || lower.includes('beans') || lower.includes('chickpeas') || 
        lower.includes('tinned') || lower.includes('canned') || lower.includes('jar') || 
        lower.includes('sauce') || lower.includes('paste') || lower.includes('stock') || 
        lower.includes('cube') || lower.includes('spice') || lower.includes('spices') || 
        lower.includes('cumin') || lower.includes('paprika') || lower.includes('turmeric') || 
        lower.includes('cinnamon') || lower.includes('vanilla') || lower.includes('honey') || 
        lower.includes('syrup') || lower.includes('nuts') || lower.includes('seeds') || 
        lower.includes('dried') || lower.includes('cereal') || lower.includes('oats') || 
        lower.includes('biscuits') || lower.includes('crackers') || lower.includes('tea') || 
        lower.includes('coffee') || lower.includes('condiment') || lower.includes('ketchup') || 
        lower.includes('mustard') || lower.includes('mayo') || lower.includes('mayonnaise') || 
        lower.includes('dressing') || lower.includes('coconut') || lower.includes('tahini') || 
        lower.includes('peanut') || lower.includes('almond') || lower.includes('olive') || 
        lower.includes('sunflower') || lower.includes('rapeseed') || lower.includes('balsamic') || 
        lower.includes('soy') || lower.includes('worcestershire') || lower.includes('tabasco') || 
        lower.includes('harissa')) {
      return "Food Cupboard";
    }
    
    // Bakery
    if (lower.includes('bread') || lower.includes('bun') || lower.includes('roll') || 
        lower.includes('bagel') || lower.includes('muffin') || lower.includes('croissant') || 
        lower.includes('pastry') || lower.includes('cake') || lower.includes('loaf') || 
        lower.includes('baguette') || lower.includes('pitta') || lower.includes('naan') || 
        lower.includes('tortilla') || lower.includes('wrap') || lower.includes('crumpet') || 
        lower.includes('scone')) {
      return "Bakery";
    }
    
    // Frozen Food
    if (lower.includes('frozen') || lower.includes('ice') || lower.includes('sorbet') || 
        lower.includes('gelato') || lower.includes('peas') || lower.includes('chips') || 
        lower.includes('pizza') || lower.includes('ready meal')) {
      return "Frozen Food";
    }
    
    // Dietary, Lifestyle & World Foods
    if (lower.includes('gluten') || lower.includes('dairy') || lower.includes('vegan') || 
        lower.includes('organic') || lower.includes('free') || lower.includes('range') || 
        lower.includes('almond milk') || lower.includes('soy milk') || lower.includes('oat milk') || 
        lower.includes('kimchi') || lower.includes('miso') || lower.includes('teriyaki') || 
        lower.includes('curry') || lower.includes('garam') || lower.includes('chinese') || 
        lower.includes('thai') || lower.includes('indian') || lower.includes('mexican') || 
        lower.includes('mediterranean') || lower.includes('kosher') || lower.includes('halal')) {
      return "Dietary, Lifestyle & World Foods";
    }
    
    // Soft Drinks, Tea & Coffee
    if (lower.includes('juice') || lower.includes('squash') || lower.includes('cordial') || 
        lower.includes('water') || lower.includes('sparkling') || lower.includes('cola') || 
        lower.includes('lemonade') || lower.includes('energy') || lower.includes('smoothie') || 
        lower.includes('kombucha') || lower.includes('green tea') || lower.includes('black tea') || 
        lower.includes('herbal') || lower.includes('coffee beans') || lower.includes('instant coffee') || 
        lower.includes('decaf')) {
      return "Soft Drinks, Tea & Coffee";
    }
    
    // Beer, Wine & Spirits
    if (lower.includes('beer') || lower.includes('wine') || lower.includes('whisky') || 
        lower.includes('vodka') || lower.includes('gin') || lower.includes('rum') || 
        lower.includes('brandy') || lower.includes('champagne') || lower.includes('prosecco') || 
        lower.includes('cider') || lower.includes('ale') || lower.includes('lager') || 
        lower.includes('spirits') || lower.includes('alcohol')) {
      return "Beer, Wine & Spirits";
    }
    
    // Health, Beauty & Personal Care
    if (lower.includes('shampoo') || lower.includes('conditioner') || lower.includes('soap') || 
        lower.includes('toothpaste') || lower.includes('deodorant') || lower.includes('moisturiser') || 
        lower.includes('sunscreen') || lower.includes('vitamins') || lower.includes('supplements') || 
        lower.includes('paracetamol') || lower.includes('ibuprofen') || lower.includes('plaster') || 
        lower.includes('antiseptic')) {
      return "Health, Beauty & Personal Care";
    }
    
    // Baby, Parent & Kids
    if (lower.includes('nappy') || lower.includes('baby') || lower.includes('formula') || 
        lower.includes('dummy') || lower.includes('wipes') || lower.includes('kids') || 
        lower.includes('children') || lower.includes('junior')) {
      return "Baby, Parent & Kids";
    }
    
    // Home Care & Cleaning
    if (lower.includes('washing') || lower.includes('fabric') || lower.includes('bleach') || 
        lower.includes('disinfectant') || lower.includes('toilet paper') || lower.includes('kitchen roll') || 
        lower.includes('bin bags') || lower.includes('dishwasher') || lower.includes('tablets') || 
        lower.includes('cleaning') || lower.includes('polish') || lower.includes('hoover') || 
        lower.includes('vacuum')) {
      return "Home Care & Cleaning";
    }
    
    // Pets, Home & Garden
    if (lower.includes('dog') || lower.includes('cat') || lower.includes('pet') || 
        lower.includes('bird') || lower.includes('fish food') || lower.includes('plant') || 
        lower.includes('compost') || lower.includes('seeds') || lower.includes('bulbs') || 
        lower.includes('garden') || lower.includes('animal')) {
      return "Pets, Home & Garden";
    }
    
    // Occasions & Entertaining
    if (lower.includes('candles') || lower.includes('balloons') || lower.includes('party') || 
        lower.includes('celebration') || lower.includes('gift') || lower.includes('card') || 
        lower.includes('wrapping') || lower.includes('decorations') || lower.includes('entertaining')) {
      return "Occasions & Entertaining";
    }
    
    // Clothing & Accessories
    if (lower.includes('socks') || lower.includes('underwear') || lower.includes('shirt') || 
        lower.includes('dress') || lower.includes('jumper') || lower.includes('jacket') || 
        lower.includes('shoes') || lower.includes('hat') || lower.includes('gloves') || 
        lower.includes('scarf') || lower.includes('belt') || lower.includes('bag') || 
        lower.includes('watch') || lower.includes('jewellery')) {
      return "Clothing & Accessories";
    }
    
    // Default fallback to Food Cupboard for food items
    return "Food Cupboard";
  }, []);

  const loadExistingShoppingList = useCallback(async () => {
    if (!user || !currentHousehold) return;

    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .select('*')
        .eq('household_id', currentHousehold.id);

      if (error) throw error;

      const categorizedItems: ShoppingListCategory = {};
      SHOPPING_CATEGORIES.forEach(cat => {
        categorizedItems[cat] = [];
      });

      (data || []).forEach((item: any) => {
        const category = item.category || "Food Cupboard";
        if (!categorizedItems[category]) {
          categorizedItems[category] = [];
        }
        
        categorizedItems[category].push({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: category,
          isChecked: item.is_checked,
          isCustom: item.is_custom,
          recipeIds: item.recipe_ids || []
        });
      });

      return categorizedItems;
    } catch (error) {
      console.error("Error loading shopping list:", error);
      return {};
    }
  }, [user, currentHousehold]);

  const generateShoppingListFromMealPlans = useCallback(async () => {
    if (!user || !currentHousehold || !recipes.length) return {};

    const mealPlans = getMealPlansForWeek(weekNumber);
    if (!mealPlans.length) return {};

    const ingredientMap = new Map<string, {
      quantity: number;
      unit: string;
      category: string;
      recipeIds: string[];
    }>();

    mealPlans.forEach(mealPlan => {
      if (mealPlan.isLeftover) return;
      
      const recipe = recipes.find(r => r.id === mealPlan.recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach(ingredient => {
        const normalizedName = ingredient.toLowerCase().trim();
        const category = categorizeIngredient(ingredient);
        
        if (ingredientMap.has(normalizedName)) {
          const existing = ingredientMap.get(normalizedName)!;
          existing.recipeIds.push(recipe.id);
        } else {
          ingredientMap.set(normalizedName, {
            quantity: 1,
            unit: '',
            category,
            recipeIds: [recipe.id]
          });
        }
      });
    });

    const categorizedItems: ShoppingListCategory = {};
    SHOPPING_CATEGORIES.forEach(cat => {
      categorizedItems[cat] = [];
    });

    for (const [name, details] of ingredientMap) {
      categorizedItems[details.category].push({
        id: `generated-${name}`,
        name,
        quantity: details.quantity,
        unit: details.unit,
        category: details.category,
        isChecked: false,
        isCustom: false,
        recipeIds: details.recipeIds
      });
    }

    return categorizedItems;
  }, [user, currentHousehold, recipes, getMealPlansForWeek, weekNumber, categorizeIngredient]);

  const initializeShoppingList = useCallback(async () => {
    if (!user || !currentHousehold || hasInitialized) return;

    setIsLoading(true);
    try {
      // Always try to generate from meal plans for auto-generation
      const generatedItems = await generateShoppingListFromMealPlans();
      
      // Check if we have any meal plan items
      const hasMealPlanItems = Object.values(generatedItems || {}).some(items => items.length > 0);
      
      if (hasMealPlanItems) {
        // If we have meal plan items, use them
        setShoppingList(generatedItems);
      } else {
        // If no meal plan items, load existing items
        const existingItems = await loadExistingShoppingList();
        setShoppingList(existingItems || {});
      }
      
      setHasInitialized(true);
    } catch (error) {
      console.error("Error initializing shopping list:", error);
      toast({
        title: "Error",
        description: "Failed to load shopping list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, hasInitialized, generateShoppingListFromMealPlans, loadExistingShoppingList, toast]);

  const generateFromMealPlans = useCallback(async () => {
    if (!user || !currentHousehold) return;

    setIsLoading(true);
    try {
      const generatedItems = await generateShoppingListFromMealPlans();
      setShoppingList(generatedItems);
      
      toast({
        title: "Shopping list generated",
        description: `Generated from week ${weekNumber} meal plans`,
      });
    } catch (error) {
      console.error("Error generating shopping list:", error);
      toast({
        title: "Error",
        description: "Failed to generate shopping list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, generateShoppingListFromMealPlans, weekNumber, toast]);

  const toggleItemChecked = useCallback(async (itemId: string, category: string) => {
    if (!user || !currentHousehold) return;

    const items = shoppingList[category] || [];
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newCheckedState = !item.isChecked;

    // Update local state immediately
    setShoppingList(prev => ({
      ...prev,
      [category]: prev[category]?.map(i => 
        i.id === itemId ? { ...i, isChecked: newCheckedState } : i
      ) || []
    }));

    // Update database if it's a saved item
    if (!item.id.startsWith('generated-')) {
      try {
        const { error } = await supabase
          .from('household_shopping_lists')
          .update({ is_checked: newCheckedState })
          .eq('id', itemId)
          .eq('household_id', currentHousehold.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating item:", error);
        // Revert on error
        setShoppingList(prev => ({
          ...prev,
          [category]: prev[category]?.map(i => 
            i.id === itemId ? { ...i, isChecked: !newCheckedState } : i
          ) || []
        }));
      }
    }
  }, [user, currentHousehold, shoppingList]);

  const addCustomItem = useCallback(async (name: string, category: string) => {
    if (!user || !currentHousehold || !name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .insert({
          household_id: currentHousehold.id,
          created_by: user.id,
          name: name.trim(),
          category,
          is_custom: true,
          is_checked: false
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: ShoppingListItem = {
        id: data.id,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        category: data.category,
        isChecked: data.is_checked,
        isCustom: data.is_custom,
        recipeIds: data.recipe_ids || []
      };

      setShoppingList(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), newItem]
      }));

      toast({
        title: "Item added",
        description: `${name} added to ${category}`,
      });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  }, [user, currentHousehold, toast]);

  const removeItem = useCallback(async (itemId: string, category: string) => {
    if (!user || !currentHousehold) return;

    // Update local state immediately
    setShoppingList(prev => ({
      ...prev,
      [category]: prev[category]?.filter(i => i.id !== itemId) || []
    }));

    // Remove from database if it's a saved item
    if (!itemId.startsWith('generated-')) {
      try {
        const { error } = await supabase
          .from('household_shopping_lists')
          .delete()
          .eq('id', itemId)
          .eq('household_id', currentHousehold.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error removing item:", error);
        toast({
          title: "Error",
          description: "Failed to remove item",
          variant: "destructive",
        });
      }
    }
  }, [user, currentHousehold, toast]);

  const clearAll = useCallback(async () => {
    if (!user || !currentHousehold) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('household_shopping_lists')
        .delete()
        .eq('household_id', currentHousehold.id);

      if (error) throw error;

      // Reset to empty categories
      const emptyCategories: ShoppingListCategory = {};
      SHOPPING_CATEGORIES.forEach(cat => {
        emptyCategories[cat] = [];
      });
      
      setShoppingList(emptyCategories);
      setHasInitialized(false);

      toast({
        title: "Shopping list cleared",
        description: "All items have been removed",
      });
    } catch (error) {
      console.error("Error clearing shopping list:", error);
      toast({
        title: "Error",
        description: "Failed to clear shopping list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, toast]);

  // Initialize shopping list once when component mounts
  useEffect(() => {
    initializeShoppingList();
  }, [initializeShoppingList]);

  return {
    shoppingList,
    isLoading,
    generateFromMealPlans,
    toggleItemChecked,
    addCustomItem,
    removeItem,
    clearAll,
  };
};
