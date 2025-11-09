import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ShoppingListInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lastGenerated: Date | null;
  createdByUserId?: string;
}

export const ShoppingListInfoDialog = ({
  open,
  onOpenChange,
  lastGenerated,
  createdByUserId
}: ShoppingListInfoDialogProps) => {
  const { profile } = useUserProfile(createdByUserId || null);
  
  if (!lastGenerated) return null;

  const createdByText = profile?.full_name ? ` by ${profile.full_name}` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-surface">
        <DialogHeader>
          <DialogTitle className="text-center">Shopping List Info</DialogTitle>
        </DialogHeader>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Shopping list created on {lastGenerated.toLocaleDateString()} at {lastGenerated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{createdByText}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};