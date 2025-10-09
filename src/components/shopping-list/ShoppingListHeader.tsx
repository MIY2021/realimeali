
import { Button } from "@/components/ui/button";
import { Share, Plus, ShoppingCart, Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useHousehold } from "@/contexts/HouseholdContext";

interface ShoppingListHeaderProps {
  onShare: () => void;
  weekNumber: 1 | 2;
  onAddItem: (name: string) => Promise<void>;
  onInfoClick?: () => void;
}

export default function ShoppingListHeader({ 
  onShare, 
  weekNumber,
  onAddItem,
  onInfoClick
}: ShoppingListHeaderProps) {
  const isMobile = useIsMobile();
  const { currentHousehold } = useHousehold();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    try {
      console.log('Adding shopping item:', newItemName.trim());
      await onAddItem(newItemName.trim());
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
      return "Your household's go-to list for turning meal plans into delicious reality.";
    }
    return "Your household's go-to list for turning meal plans into delicious reality.";
  };

  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-6 w-6" style={{ color: 'hsl(var(--shopping-navy))' }} />
        <h1 className="text-3xl font-bold flex-1" style={{ color: 'hsl(var(--shopping-navy))' }}>
          Shopping List
        </h1>
        {onInfoClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onInfoClick}
            className="h-8 w-8 p-0 rounded-full"
          >
            <Info className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-sm" style={{ color: 'hsl(var(--shopping-grey))' }}>
        {getWelcomeText()}
      </p>
    </div>
  );
}
