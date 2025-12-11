
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMealPlanApproval } from "@/contexts/MealPlanApprovalContext";
import { getCurrentWeekKey } from "@/utils/weekUtils";

interface ApprovalRequestDialogProps {
  open: boolean;
  onClose: () => void;
  weekKey: string; // ISO week key
}

export function ApprovalRequestDialog({
  open,
  onClose,
  weekKey,
}: ApprovalRequestDialogProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createApprovalRequest } = useMealPlanApproval();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Convert week_key to week_number for database compatibility
      // Current week = 1, next week = 2 (temporary mapping during migration)
      const currentWeekKey = getCurrentWeekKey();
      const weekNumber = weekKey === currentWeekKey ? 1 : 2;
      
      await createApprovalRequest(weekNumber, message || undefined);
      setMessage("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Meal Plan Approval</DialogTitle>
          <DialogDescription>
            Send an approval request for this week's meal plan to all household members.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Optional Message
            </label>
            <Textarea
              id="message"
              placeholder="Add a message for household members..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="bg-terracotta hover:bg-terracotta/90"
          >
            {isLoading ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
