
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingListItem } from "./ShoppingListItem";
import { ShoppingListItem as ShoppingListItemType } from "@/types/shoppingList";
import { useIsMobile } from "@/hooks/use-mobile";

interface ShoppingListItemsProps {
  shoppingList: ShoppingListItemType[];
  copiedItemId: string | null;
  onToggleItem: (itemId: string) => void;
  onCopyItem: (itemId: string) => void;
  getRecipeNames: (recipeIds: string[]) => string;
}

export default function ShoppingListItems({
  shoppingList,
  copiedItemId,
  onToggleItem,
  onCopyItem,
  getRecipeNames
}: ShoppingListItemsProps) {
  const isMobile = useIsMobile();

  return (
    <div 
      className={`space-y-${isMobile ? '2' : '3'}`}
      data-shopping-list-container
    >
      {shoppingList.map((item) => (
        <Card key={item.id} className="w-full border-0 shadow-sm" data-shopping-list-item>
          <CardContent className={`${isMobile ? 'p-2' : 'p-3'}`}>
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
              getRecipeNames={getRecipeNames}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
