
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

interface MealPlanReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  weekNumber: 1 | 2;
}

export const MealPlanReplaceDialog = ({
  open,
  onOpenChange,
  onConfirm,
  weekNumber,
}: MealPlanReplaceDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-navy">
            Replace Existing Meal Plan?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Week {weekNumber} already has meals planned. Generating a new meal plan will 
            replace all current meals with new randomly selected recipes from your collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-terracotta hover:bg-terracotta/90"
          >
            Replace Meal Plan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
