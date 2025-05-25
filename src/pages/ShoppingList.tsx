
import { useState } from "react";
import ShoppingListHeader from "@/components/shopping-list/ShoppingListHeader";
import ShoppingListWeekSelector from "@/components/shopping-list/ShoppingListWeekSelector";
import ShoppingListCategory from "@/components/shopping-list/ShoppingListCategory";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const SHOPPING_CATEGORIES = [
  "Produce",
  "Meat & Seafood", 
  "Dairy & Eggs",
  "Pantry & Dry Goods",
  "Frozen",
  "Bakery",
  "Beverages",
  "Other"
];

export default function ShoppingList() {
  useDocumentTitle("Shopping List | RealiMeali");
  
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes } = useRecipes();
  const [weekNumber, setWeekNumber] = useState<1 | 2>(1);
  
  const {
    shoppingList,
    isLoading,
    generateFromMealPlans,
    toggleItemChecked,
    addCustomItem,
    removeItem,
    clearAll,
  } = useShoppingList(weekNumber);

  const getRecipeNames = (recipeIds: string[]): string => {
    const recipeNames = recipeIds
      .map(id => {
        const recipe = recipes.find(r => r.id === id);
        return recipe ? recipe.title : `Recipe ${id.substring(0, 8)}`;
      })
      .filter(Boolean);
    
    return recipeNames.length > 0 ? recipeNames.join(', ') : 'Unknown Recipe';
  };

  const handleShare = () => {
    // Simple share functionality
    const listText = Object.entries(shoppingList)
      .filter(([, items]) => items.length > 0)
      .map(([category, items]) => {
        const itemsList = items.map(item => `• ${item.name}${item.quantity && item.quantity > 1 ? ` (${item.quantity}${item.unit ? ` ${item.unit}` : ''})` : ''}`).join('\n');
        return `${category}:\n${itemsList}`;
      })
      .join('\n\n');

    if (navigator.share) {
      navigator.share({
        title: 'Shopping List',
        text: listText,
      });
    } else {
      navigator.clipboard.writeText(listText);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <ShoppingListHeader
        onShare={handleShare}
      />

      {!user ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view and manage your shopping list.</p>
        </div>
      ) : !currentHousehold ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please create or select a household to manage shopping lists.</p>
        </div>
      ) : (
        <>
          <ShoppingListWeekSelector 
            selectedWeek={weekNumber} 
            onWeekSelect={setWeekNumber} 
          />

          <div className="flex gap-2 mb-6">
            <Button 
              onClick={generateFromMealPlans} 
              variant="outline" 
              size="sm" 
              className="flex-1"
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Generate from Meal Plans
            </Button>
          </div>

          {isLoading ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Loading shopping list...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {SHOPPING_CATEGORIES.map((category) => (
                <ShoppingListCategory
                  key={category}
                  category={category}
                  items={shoppingList[category] || []}
                  copiedItemId={null}
                  onCheckItem={(itemId, checked) => toggleItemChecked(itemId, category)}
                  onCopyItem={(name, itemId) => {
                    navigator.clipboard.writeText(name);
                  }}
                  onRemoveItem={(itemId) => removeItem(itemId, category)}
                  getRecipeNames={getRecipeNames}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
