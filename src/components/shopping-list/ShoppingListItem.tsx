
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Check, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <div className={`flex items-start space-x-${isMobile ? '2' : '3'} ${isMobile ? 'p-1.5' : 'p-2'} rounded hover:bg-accent`}>
      <Checkbox
        checked={isChecked}
        onCheckedChange={(checked) => onCheck(checked as boolean)}
        className={`${isMobile ? 'mt-0.5' : 'mt-1'} ${isMobile ? 'h-4 w-4' : ''}`}
      />
      <div className="flex-1 min-w-0">
        <div className={`${isChecked ? 'line-through text-muted-foreground' : ''}`}>
          <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
            {quantity > 1 && `${quantity}x `}
            {name.replace(/^week\d+-/, '')}
          </span>
          {unit && <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground ml-1`}>({unit})</span>}
        </div>
        {recipeIds.length > 0 && (
          <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-green-600 mt-1 truncate`}>
            From: {getRecipeNames(recipeIds)}
          </div>
        )}
      </div>
      <div className={`flex gap-${isMobile ? '0.5' : '1'} flex-shrink-0`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCopy}
          className={`${isMobile ? 'h-8 w-8' : 'h-8 w-8'} text-muted-foreground hover:text-primary`}
        >
          {copiedItemId === id ? (
            <Check className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-600`} />
          ) : (
            <Copy className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className={`${isMobile ? 'h-8 w-8' : 'h-8 w-8'} text-muted-foreground hover:text-destructive`}
        >
          <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </Button>
      </div>
    </div>
  );
}
