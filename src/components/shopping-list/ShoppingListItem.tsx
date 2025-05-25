
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Check, Trash2 } from "lucide-react";

interface ShoppingListItemProps {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  isChecked: boolean;
  recipeIds: string[];
  copiedItemId: string | null;
  onCheck: (checked: boolean) => void;
  onCopy: () => void;
  onRemove: () => void;
  getRecipeNames: (recipeIds: string[]) => string;
}

export default function ShoppingListItem({
  id,
  name,
  quantity,
  unit,
  isChecked,
  recipeIds,
  copiedItemId,
  onCheck,
  onCopy,
  onRemove,
  getRecipeNames
}: ShoppingListItemProps) {
  return (
    <div className="flex items-start space-x-3 p-2 rounded hover:bg-accent">
      <Checkbox
        checked={isChecked}
        onCheckedChange={(checked) => onCheck(checked as boolean)}
        className="mt-1"
      />
      <div className="flex-1">
        <div className={`${isChecked ? 'line-through text-muted-foreground' : ''}`}>
          <span className="font-medium">
            {quantity > 1 && `${quantity}x `}
            {name.replace(/^week\d+-/, '')}
          </span>
          {unit && <span className="text-sm text-muted-foreground ml-1">({unit})</span>}
        </div>
        {recipeIds.length > 0 && (
          <div className="text-xs text-green-600 mt-1">
            From: {getRecipeNames(recipeIds)}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCopy}
          className="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          {copiedItemId === id ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
