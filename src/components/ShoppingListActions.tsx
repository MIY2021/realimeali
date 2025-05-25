
import { Button } from "@/components/ui/button";
import { Check, Trash2, X } from "lucide-react";

type Props = {
  onCheckAll: () => void;
  onUncheckAll: () => void;
  onRemoveAll: () => void;
  disabled?: boolean;
};

export default function ShoppingListActions({ onCheckAll, onUncheckAll, onRemoveAll, disabled = false }: Props) {
  return (
    <div className="flex gap-2 mt-4">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onCheckAll} 
        className="text-xs"
        disabled={disabled}
      >
        <Check className="h-4 w-4 mr-1" />
        Check All
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onUncheckAll} 
        className="text-xs"
        disabled={disabled}
      >
        <X className="h-4 w-4 mr-1" />
        Clear All
      </Button>
      <Button 
        size="sm" 
        variant="destructive" 
        onClick={onRemoveAll} 
        className="text-xs"
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Remove All
      </Button>
    </div>
  );
}
