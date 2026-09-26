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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-navy">
            Existing Meal Plan
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This week already has meals planned. Choose whether the generated meals
            should replace your current plan or be added alongside it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAdd}>
            Add to Existing Plan
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onReplace}
            className="bg-terracotta hover:bg-terracotta/90"
          >
            Replace Existing Plan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
