
import { ShoppingListItem } from "./ShoppingListItem";
import { ShoppingListItem as ShoppingListItemType } from "@/types/shoppingList";
import { SortOption, GroupedShoppingListItem } from "@/utils/shoppingListSorting";
import { Apple, Beef, Cookie, Droplets, Globe2, Milk, Package, Snowflake, Wheat, Wine } from "lucide-react";

interface ShoppingListItemsProps {
  shoppingList: ShoppingListItemType[] | GroupedShoppingListItem[];
  copiedItemId: string | null;
  onToggleItem: (itemId: string) => void;
  onCopyItem: (itemId: string) => void;
  getRecipeNames: (recipeIds: string[]) => string;
  sortOption: SortOption;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Fruit & Vegetables": Apple,
  "Meat & Fish": Beef,
  "Chilled Food": Milk,
  "Bakery": Wheat,
  "Frozen Food": Snowflake,
  "Food Cupboard": Package,
  "Snacks & Treats": Cookie,
  "World & Dietary": Globe2,
  "Drinks": Droplets,
  "Alcohol": Wine,
  "Other": Package,
};

export default function ShoppingListItems({
  shoppingList,
  copiedItemId,
  onToggleItem,
  onCopyItem,
  getRecipeNames,
  sortOption
}: ShoppingListItemsProps) {
  const isGrouped =
    sortOption !== "none" &&
    shoppingList.length > 0 &&
    "groupKey" in shoppingList[0];

  if (isGrouped) {
    const groupedItems = shoppingList as GroupedShoppingListItem[];

    return (
      <div className="space-y-6 sm:space-y-8" data-shopping-list-container>
        {groupedItems.map((group) => {
          const CategoryIcon = categoryIcons[group.groupLabel] || Package;

          return (
            <section key={group.groupKey} aria-labelledby={"shopping-group-" + group.groupKey}>
              <div className="mb-1 flex items-center justify-between px-1.5">
                <div className="flex min-w-0 items-center gap-2">
                  <CategoryIcon className="h-4 w-4 shrink-0 text-[#F5B82E]" aria-hidden="true" />
                  <h3
                    id={"shopping-group-" + group.groupKey}
                    className="truncate text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    {group.groupLabel}
                  </h3>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground/70">
                  {group.items.length}
                </span>
              </div>

              <div className="divide-y divide-border/60">
                {group.items.map((item) => (
                  <ShoppingListItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    quantity={item.consolidatedQuantity ?? item.quantity}
                    quantityDisplay={item.quantityDisplay}
                    unit={item.consolidatedUnit || item.unit}
                    isChecked={item.isChecked}
                    recipeIds={[...new Set(item.recipeIds)]}
                    copiedItemId={copiedItemId}
                    onCheck={() => onToggleItem(item.id)}
                    onCopy={() => onCopyItem(item.id)}
                    getRecipeNames={getRecipeNames}
                    sortOption={sortOption}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  const ungroupedItems = shoppingList as ShoppingListItemType[];

  return (
    <div className="divide-y divide-border/60" data-shopping-list-container>
      {ungroupedItems.map((item) => (
        <ShoppingListItem
          key={item.id}
          id={item.id}
          name={item.name}
          quantity={item.consolidatedQuantity ?? item.quantity}
          quantityDisplay={item.quantityDisplay}
          unit={item.consolidatedUnit || item.unit}
          isChecked={item.isChecked}
          recipeIds={[...new Set(item.recipeIds)]}
          copiedItemId={copiedItemId}
          onCheck={() => onToggleItem(item.id)}
          onCopy={() => onCopyItem(item.id)}
          getRecipeNames={getRecipeNames}
          sortOption={sortOption}
        />
      ))}
    </div>
  );
}
