import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserProfile } from "@/hooks/useUserProfile";

interface MealPlanInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lastGenerated: Date | null;
  createdByUserId?: string;
}

export const MealPlanInfoDialog = ({
  open,
  onOpenChange,
  lastGenerated,
  createdByUserId
}: MealPlanInfoDialogProps) => {
  const { profile } = useUserProfile(createdByUserId || null);
  
  if (!lastGenerated) return null;

  const createdByText = profile?.full_name ? ` by ${profile.full_name}` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white">
        <DialogHeader>
          <DialogTitle className="text-center">Meal Plan Info</DialogTitle>
        </DialogHeader>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Meal plan created on {lastGenerated.toLocaleDateString()} at {lastGenerated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{createdByText}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};