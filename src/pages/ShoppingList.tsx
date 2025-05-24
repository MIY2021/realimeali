
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks, Share, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHouseholdShopping } from "@/contexts/HouseholdShoppingContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import ShoppingListActions from "@/components/ShoppingListActions";
import { HouseholdSelector } from "@/components/household/HouseholdSelector";

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

  const {
    shoppingItems,
    addCustomShoppingItem,
    updateShoppingItem,
    removeShoppingItem,
    generateShoppingListFromMealPlans,
    clearShoppingList,
    isLoading
  } = useHouseholdShopping();

  const { getMealPlansForWeek } = useMealPlan();
  const { recipes } = useRecipes();

  // Generate shopping list for each week
  useEffect(() => {
    const generateWeekLists = async () => {
      if (!user || !currentHousehold) return;

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
                  category: 'Other',
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
  }, [getMealPlansForWeek, recipes, user, currentHousehold]);

  const currentWeekItems = weekShoppingItems[selectedWeek];

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
    const checkedItems = currentWeekItems.filter(item => item.isChecked);
    const uncheckedItems = currentWeekItems.filter(item => !item.isChecked);
    
    let shareText = `Shopping List - Week ${selectedWeek}\n\n`;
    
    if (uncheckedItems.length > 0) {
      shareText += "TO BUY:\n";
      uncheckedItems.forEach(item => {
        shareText += `☐ ${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name}${item.unit ? ` (${item.unit})` : ''}\n`;
      });
      shareText += "\n";
    }
    
    if (checkedItems.length > 0) {
      shareText += "COMPLETED:\n";
      checkedItems.forEach(item => {
        shareText += `☑ ${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name}${item.unit ? ` (${item.unit})` : ''}\n`;
      });
    }

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
          <HouseholdSelector />
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
        <HouseholdSelector />
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

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading shopping list...</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Week {selectedWeek} Shopping List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentWeekItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-2 rounded hover:bg-accent">
                  <Checkbox
                    checked={item.isChecked}
                    onCheckedChange={(checked) => handleCheckItem(item.id, checked as boolean)}
                  />
                  <div className={`flex-1 ${item.isChecked ? 'line-through text-muted-foreground' : ''}`}>
                    <span className="font-medium">
                      {item.quantity > 1 && `${item.quantity}x `}{item.name}
                    </span>
                    {item.unit && <span className="text-sm text-muted-foreground ml-1">({item.unit})</span>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

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
