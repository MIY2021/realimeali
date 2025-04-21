
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";

type Props = {
  onCheckAll: () => void;
  onUncheckAll: () => void;
  onRemoveAll: () => void;
};

export default function ShoppingListActions({ onCheckAll, onUncheckAll, onRemoveAll }: Props) {
  return (
    <div className="flex gap-2 mt-4">
      <Button size="sm" variant="outline" onClick={onCheckAll} className="text-xs">
        <Check className="h-4 w-4 mr-1" />
        Check All
      </Button>
      <Button size="sm" variant="outline" onClick={onUncheckAll} className="text-xs">
        Clear All
      </Button>
      <Button size="sm" variant="destructive" onClick={onRemoveAll} className="text-xs">
        <Trash2 className="h-4 w-4 mr-1" />
        Remove All
      </Button>
    </div>
  );
}
