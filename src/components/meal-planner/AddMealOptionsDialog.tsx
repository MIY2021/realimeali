import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Book, Edit } from "lucide-react";
import { MealType } from "@/types";

interface AddMealOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType: MealType | null;
  onSelectRecipe: () => void;
  onSelectCustom: () => void;
}

export const AddMealOptionsDialog = ({
  open,
  onOpenChange,
  mealType,
  onSelectRecipe,
  onSelectCustom,
}: AddMealOptionsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Add {mealType ? mealType.charAt(0).toUpperCase() + mealType.slice(1) : 'Meal'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={onSelectRecipe}
            variant="outline"
            className="h-16 flex flex-col gap-2 text-terracotta border-terracotta hover:bg-terracotta/10"
          >
            <Book className="h-6 w-6" />
            <span className="font-medium">My Recipes</span>
            <span className="text-xs text-muted-foreground">Choose from your recipe collection</span>
          </Button>
          
          <Button
            onClick={onSelectCustom}
            variant="outline"
            className="h-16 flex flex-col gap-2 text-terracotta border-terracotta hover:bg-terracotta/10"
          >
            <Edit className="h-6 w-6" />
            <span className="font-medium">Custom</span>
            <span className="text-xs text-muted-foreground">Create a custom meal entry</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};