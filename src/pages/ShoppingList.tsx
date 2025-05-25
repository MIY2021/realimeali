
import { useState } from "react";
import ShoppingListHeader from "@/components/shopping-list/ShoppingListHeader";
import ShoppingListWeekSelector from "@/components/shopping-list/ShoppingListWeekSelector";
import ShoppingListCategory from "@/components/shopping-list/ShoppingListCategory";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
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

  const handleShare = () => {
    // Simple share functionality
    const listText = Object.entries(shoppingList)
      .filter(([, items]) => items.length > 0)
      .map(([category, items]) => {
        const itemsList = items.map(item => `• ${item.name}${item.quantity > 1 ? ` (${item.quantity}${item.unit ? ` ${item.unit}` : ''})` : ''}`).join('\n');
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
                  getRecipeNames={(recipeIds) => recipeIds.join(', ')}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
