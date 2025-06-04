
import { Button } from "@/components/ui/button";
import { Share, Plus, ShoppingBag } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useHouseholdShopping } from "@/contexts/HouseholdShoppingContext";
import { useHousehold } from "@/contexts/HouseholdContext";

interface ShoppingListHeaderProps {
  onShare: () => void;
  weekNumber: 1 | 2;
}

export default function ShoppingListHeader({ 
  onShare, 
  weekNumber
}: ShoppingListHeaderProps) {
  const isMobile = useIsMobile();
  const { currentHousehold } = useHousehold();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const { addShoppingItem } = useHouseholdShopping();

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    try {
      console.log('Adding shopping item:', newItemName.trim());
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
      console.log('Successfully added shopping item');
    } catch (error) {
      console.error('Error adding shopping item:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const getWelcomeText = () => {
    if (!currentHousehold) {
      return "Welcome to your personal shopping list! All shopping lists are organised by household.";
    }
    return `Welcome to your shopping list for ${currentHousehold.name}! All shopping lists are organised by household.`;
  };

  return (
    <div className={`mb-6 ${isMobile ? 'space-y-4' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`font-bold text-navy flex items-center gap-2 ${isMobile ? 'text-2xl' : 'text-2xl sm:text-3xl'}`}>
            <ShoppingBag className={`text-sage ${isMobile ? 'h-6 w-6' : 'h-6 w-6 sm:h-8 sm:w-8'}`} />
            Shopping List
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {getWelcomeText()}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Add custom items or generate a list from your meal plans
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "default"}
                className="flex items-center gap-2"
              >
                <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                {isMobile ? null : 'Add Item'}
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
                  onKeyPress={handleKeyPress}
                  autoFocus
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
