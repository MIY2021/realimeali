
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingListItem } from "./ShoppingListItem";
import { ShoppingListItem as ShoppingListItemType } from "@/types/shoppingList";
import { useIsMobile } from "@/hooks/use-mobile";
import { SortOption, GroupedShoppingListItem } from "@/utils/shoppingListSorting";

interface ShoppingListItemsProps {
  shoppingList: ShoppingListItemType[] | GroupedShoppingListItem[];
  copiedItemId: string | null;
  onToggleItem: (itemId: string) => void;
  onCopyItem: (itemId: string) => void;
  onUpdateItem?: (itemId: string, newName: string) => void;
  getRecipeNames: (recipeIds: string[]) => string;
  sortOption: SortOption;
}

export default function ShoppingListItems({
  shoppingList,
  copiedItemId,
  onToggleItem,
  onCopyItem,
  onUpdateItem,
  getRecipeNames,
  sortOption
}: ShoppingListItemsProps) {
  const isMobile = useIsMobile();

  // Check if items are grouped
  const isGrouped = sortOption !== "none" && Array.isArray(shoppingList) && shoppingList.length > 0 && typeof shoppingList[0] === 'object' && 'groupKey' in shoppingList[0];

  if (isGrouped) {
    const groupedItems = shoppingList as GroupedShoppingListItem[];
    
    return (
      <div 
        className={isMobile ? "space-y-4" : "space-y-6"}
        data-shopping-list-container
      >
        {groupedItems.map((group) => (
          <div key={group.groupKey} className="space-y-2">
            {/* Section Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b-2 border-border/60 pb-2.5 pt-3 mb-2">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                {group.groupLabel}
              </h3>
            </div>
            
            {/* Group Items */}
            <div className={isMobile ? "space-y-2" : "space-y-3"}>
              {group.items.map((item) => (
                <Card key={item.id} className="w-full border border-border bg-card shadow-sm hover:shadow-md transition-shadow" data-shopping-list-item>
                  <CardContent className={isMobile ? "p-3" : "p-4"}>
                    <ShoppingListItem
                      id={item.id}
                      name={item.name}
                      quantity={item.consolidatedQuantity || item.quantity || 1}
                      unit={item.consolidatedUnit || item.unit}
                      isChecked={item.isChecked}
                      recipeIds={[...new Set(item.recipeIds)]}
                      copiedItemId={copiedItemId}
                      onCheck={(checked) => onToggleItem(item.id)}
                      onCopy={() => onCopyItem(item.id)}
                      onUpdate={onUpdateItem}
                      getRecipeNames={getRecipeNames}
                      sortOption={sortOption}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Ungrouped display (sortOption === "none")
  const ungroupedItems = shoppingList as ShoppingListItemType[];

  return (
    <div 
      className={isMobile ? "space-y-2" : "space-y-3"}
      data-shopping-list-container
    >
      {ungroupedItems.map((item) => (
        <Card key={item.id} className="w-full border border-border bg-card shadow-sm hover:shadow-md transition-shadow" data-shopping-list-item>
          <CardContent className={isMobile ? "p-3" : "p-4"}>
            <ShoppingListItem
              id={item.id}
              name={item.name}
              quantity={item.consolidatedQuantity || item.quantity || 1}
              unit={item.consolidatedUnit || item.unit}
              isChecked={item.isChecked}
              recipeIds={[...new Set(item.recipeIds)]}
              copiedItemId={copiedItemId}
              onCheck={(checked) => onToggleItem(item.id)}
              onCopy={() => onCopyItem(item.id)}
              onUpdate={onUpdateItem}
              getRecipeNames={getRecipeNames}
              sortOption={sortOption}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
