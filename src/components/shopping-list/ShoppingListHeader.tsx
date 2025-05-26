
import { Button } from "@/components/ui/button";
import { Share, RotateCcw, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useHouseholdShopping } from "@/contexts/HouseholdShoppingContext";

interface ShoppingListHeaderProps {
  onShare: () => void;
  onRegenerate?: () => void;
  weekNumber: 1 | 2;
  isRegenerating?: boolean;
}

export default function ShoppingListHeader({ 
  onShare, 
  onRegenerate, 
  weekNumber, 
  isRegenerating = false 
}: ShoppingListHeaderProps) {
  const isMobile = useIsMobile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const { addShoppingItem } = useHouseholdShopping();

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    await addShoppingItem({
      name: newItemName.trim(),
      week_number: weekNumber,
      is_checked: false,
      is_custom: true,
      recipe_ids: [],
      consolidated_quantity: 1,
      consolidated_unit: '',
      source_ingredients: [newItemName.trim()]
    });

    setNewItemName("");
    setIsAddDialogOpen(false);
  };

  return (
    <div className={`mb-6 ${isMobile ? 'space-y-4' : ''}`}>
      <div className="flex items-center justify-between">
        <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          Shopping List
        </h1>
        <div className="flex gap-2">
          {onRegenerate && (
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2"
            >
              <RotateCcw className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${isRegenerating ? 'animate-spin' : ''}`} />
              {!isMobile && (isRegenerating ? 'Regenerating...' : 'Regenerate')}
            </Button>
          )}
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "default"}
                className="flex items-center gap-2"
              >
                <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                {!isMobile && 'Add Item'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter item name..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem} disabled={!newItemName.trim()}>
                    Add Item
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={onShare}
            className="flex items-center gap-2"
          >
            <Share className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            {!isMobile && 'Share'}
          </Button>
        </div>
      </div>
    </div>
  );
}
