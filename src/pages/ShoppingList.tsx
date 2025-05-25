
import { useState } from "react";
import ShoppingListHeader from "@/components/shopping-list/ShoppingListHeader";
import ShoppingListWeekSelector from "@/components/shopping-list/ShoppingListWeekSelector";
import ShoppingListCategory from "@/components/shopping-list/ShoppingListCategory";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { SHOPPING_CATEGORIES } from "@/types/shoppingList";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ShoppingList() {
  useDocumentTitle("Shopping List | RealiMeali");
  
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes } = useRecipes();
  const isMobile = useIsMobile();
  const [weekNumber, setWeekNumber] = useState<1 | 2>(1);
  
  const {
    shoppingList,
    isLoading,
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
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-4' : 'py-8'} ${!isMobile ? 'max-w-4xl' : ''}`}>
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

          {isLoading ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Loading shopping list...</p>
            </div>
          ) : (
            <div className={`space-y-${isMobile ? '4' : '6'}`}>
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
