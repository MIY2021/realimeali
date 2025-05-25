
import { Button } from "@/components/ui/button";
import { ListChecks, Share } from "lucide-react";

interface ShoppingListHeaderProps {
  onShare: () => void;
}

export default function ShoppingListHeader({ onShare }: ShoppingListHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <ListChecks className="h-6 w-6" />
            Shopping List
          </h1>
          <p className="text-sm text-muted-foreground">
            Generated from your weekly meal plans
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button onClick={onShare} variant="outline" size="sm" className="flex-1">
          <Share className="h-4 w-4 mr-2" />
          Share List
        </Button>
      </div>
    </>
  );
}
