
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListChecks, FileSpreadsheet, User, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { ApprovalRequestDialog } from "@/components/meal-planner/ApprovalRequestDialog";
import { ApprovalStatusDropdown } from "@/components/meal-planner/ApprovalStatusDropdown";
import { useMealPlanApproval } from "@/contexts/MealPlanApprovalContext";

interface MealPlannerActionsProps {
  onRandomize: () => void;
  isLoading: boolean;
  currentWeek: 1 | 2;
}

export const MealPlannerActions = ({ 
  onRandomize, 
  isLoading,
  currentWeek 
}: MealPlannerActionsProps) => {
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const { approvalRequests } = useMealPlanApproval();

  // Find the current week's approval request
  const currentWeekRequest = approvalRequests.find(
    request => request.week_number === currentWeek && request.status !== 'expired'
  );

  const getApprovalButtonContent = () => {
    if (!currentWeekRequest) {
      return {
        text: "Request Approval",
        icon: <User className="mr-2 h-4 w-4" />,
        onClick: () => setApprovalDialogOpen(true),
        showDropdown: false,
      };
    }

    if (currentWeekRequest.status === 'approved') {
      return {
        text: "Approved",
        icon: <Check className="mr-2 h-4 w-4" />,
        onClick: null,
        showDropdown: true,
      };
    }

    return {
      text: "Pending Approval",
      icon: <User className="mr-2 h-4 w-4" />,
      onClick: null,
      showDropdown: true,
    };
  };

  const approvalButton = getApprovalButtonContent();

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-4">
        <Button
          onClick={onRandomize}
          size="sm"
          className="bg-sage hover:bg-sage/90 flex items-center whitespace-nowrap flex-1"
          disabled={isLoading}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Generate Meal Plan
        </Button>
        
        {approvalButton.showDropdown && currentWeekRequest ? (
          <ApprovalStatusDropdown
            request={currentWeekRequest}
            buttonText={approvalButton.text}
            variant={currentWeekRequest.status === 'approved' ? "default" : "outline"}
          />
        ) : (
          <Button
            onClick={approvalButton.onClick || undefined}
            size="sm"
            className="bg-terracotta hover:bg-terracotta/90 flex items-center whitespace-nowrap"
            disabled={isLoading}
          >
            {approvalButton.icon}
            {approvalButton.text}
          </Button>
        )}
      </div>
      
      <div className="flex gap-2 items-center mb-4">
        <Button asChild variant="outline" size="sm" className="flex items-center flex-1">
          <Link to="/shopping-list" className="flex items-center">
            <ListChecks className="mr-2 h-4 w-4" />
            Shopping List
          </Link>
        </Button>
      </div>

      <ApprovalRequestDialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        weekNumber={currentWeek}
      />
    </>
  );
};
