
import { Button } from "@/components/ui/button";
import { Share, Plus, ShoppingBag } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useHousehold } from "@/contexts/HouseholdContext";

interface ShoppingListHeaderProps {
  onShare: () => void;
  weekNumber: 1 | 2;
  onAddItem: (name: string) => Promise<void>;
}

export default function ShoppingListHeader({ 
  onShare, 
  weekNumber,
  onAddItem
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
    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-start">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-sage" />
          Shopping List
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {getWelcomeText()}
        </p>
      </div>
    </div>
  );
}
