
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShoppingListItem from "./ShoppingListItem";
import { useIsMobile } from "@/hooks/use-mobile";

interface ShoppingItem {
  id: string;
  name: string;
  quantity?: number; // Made optional to match ShoppingListItem
  unit?: string;
  isChecked: boolean;
  category: string;
  isCustom: boolean;
  recipeIds: string[];
}

interface ShoppingListCategoryProps {
  category: string;
  items: ShoppingItem[];
  copiedItemId: string | null;
  onCheckItem: (itemId: string, checked: boolean) => void;
  onCopyItem: (itemName: string, itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  getRecipeNames: (recipeIds: string[]) => string;
}

export default function ShoppingListCategory({
  category,
  items,
  copiedItemId,
  onCheckItem,
  onCopyItem,
  onRemoveItem,
  getRecipeNames
}: ShoppingListCategoryProps) {
  const isMobile = useIsMobile();

  if (items.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader className={`${isMobile ? 'pb-2 px-3 pt-3' : 'pb-3'}`}>
        <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-terracotta`}>
          {category}
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-${isMobile ? '1.5' : '2'} ${isMobile ? 'pt-0 px-3 pb-3' : 'pt-0'}`}>
        {items.map((item) => (
          <ShoppingListItem
            key={item.id}
            id={item.id}
            name={item.name}
            quantity={item.quantity || 1} // Provide default value
            unit={item.unit}
            isChecked={item.isChecked}
            recipeIds={item.recipeIds}
            copiedItemId={copiedItemId}
            onCheck={(checked) => onCheckItem(item.id, checked)}
            onCopy={() => onCopyItem(item.name, item.id)}
            onRemove={() => onRemoveItem(item.id)}
            getRecipeNames={getRecipeNames}
          />
        ))}
      </CardContent>
    </Card>
  );
}
