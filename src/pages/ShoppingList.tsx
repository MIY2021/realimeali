
import { useState } from "react";
import { ShoppingListHeader } from "@/components/shopping-list/ShoppingListHeader";
import { ShoppingListWeekSelector } from "@/components/shopping-list/ShoppingListWeekSelector";
import { ShoppingListCategory } from "@/components/shopping-list/ShoppingListCategory";
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

  return (
    <div className="container max-w-2xl py-8">
      <ShoppingListHeader
        user={user}
        currentHousehold={currentHousehold}
        onGenerate={generateFromMealPlans}
        onClearAll={clearAll}
        isLoading={isLoading}
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
            week={weekNumber} 
            onWeekChange={setWeekNumber} 
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
                  onToggleItem={(itemId) => toggleItemChecked(itemId, category)}
                  onAddItem={(name) => addCustomItem(name, category)}
                  onRemoveItem={(itemId) => removeItem(itemId, category)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
