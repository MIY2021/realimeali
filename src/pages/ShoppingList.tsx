
import { Card, CardContent } from "@/components/ui/card";
import { ListChecks } from "lucide-react";
import { useRecipesLoader } from "@/hooks/useRecipesLoader";
import ShoppingListActions from "@/components/ShoppingListActions";
import ShoppingListHeader from "@/components/shopping-list/ShoppingListHeader";
import ShoppingListWeekSelector from "@/components/shopping-list/ShoppingListWeekSelector";
import ShoppingListCategory from "@/components/shopping-list/ShoppingListCategory";
import { useShoppingList } from "@/hooks/useShoppingList";

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
  const {
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
  } = useShoppingList();

  // Load recipes automatically
  useRecipesLoader();

  const currentWeekItems = weekShoppingItems[selectedWeek];

  // Group items by category
  const itemsByCategory = SHOPPING_CATEGORIES.reduce((acc, category) => {
    acc[category] = currentWeekItems.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, typeof currentWeekItems>);

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
      <ShoppingListHeader onShare={handleShare} />

      <ShoppingListWeekSelector 
        selectedWeek={selectedWeek}
        onWeekSelect={setSelectedWeek}
      />

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
            {SHOPPING_CATEGORIES.map(category => (
              <ShoppingListCategory
                key={category}
                category={category}
                items={itemsByCategory[category]}
                copiedItemId={copiedItemId}
                onCheckItem={handleCheckItem}
                onCopyItem={handleCopyItem}
                onRemoveItem={handleRemoveItem}
                getRecipeNames={getRecipeNames}
              />
            ))}
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
