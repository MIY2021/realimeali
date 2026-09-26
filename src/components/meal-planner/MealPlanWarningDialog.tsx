
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MealPlanWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplace: () => void;
  onAdd: () => void;
}

export const MealPlanWarningDialog = ({
  open,
  onOpenChange,
  onReplace,
  onAdd,
}: MealPlanWarningDialogProps) => {
  const handleReplace = () => {
    onReplace();
    onOpenChange(false);
  };

  const handleAdd = () => {
    onAdd();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-navy">
            Generate Meal Plan
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This week already has meals planned. Generating a new meal plan will 
            replace all current meals with new randomly selected recipes from your collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAdd}
            className="bg-primary hover:bg-primary/90"
          >
            Add to Existing Plan
          </AlertDialogAction>
          <AlertDialogAction
            onClick={handleReplace}
            className="bg-terracotta hover:bg-terracotta/90"
          >
            Replace Existing Plan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
