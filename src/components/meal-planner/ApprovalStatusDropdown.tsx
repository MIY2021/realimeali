
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Check, X, Clock } from "lucide-react";
import { useMealPlanApproval, ApprovalRequest } from "@/contexts/MealPlanApprovalContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { format } from "date-fns";

interface ApprovalStatusDropdownProps {
  request: ApprovalRequest;
  buttonText: string;
  variant?: "default" | "outline" | "secondary";
}

export const ApprovalStatusDropdown = ({
  request,
  buttonText,
  variant = "outline",
}: ApprovalStatusDropdownProps) => {
  const [open, setOpen] = useState(false);
  const { getRequestApprovals } = useMealPlanApproval();
  const { householdMembers } = useHousehold();

  const approvals = getRequestApprovals(request.id);

  const getApprovalForMember = (userId: string) => {
    return approvals.find(approval => approval.user_id === userId);
  };

  const getStatusIcon = (userId: string) => {
    const approval = getApprovalForMember(userId);
    if (!approval) {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }
    return approval.approved ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusText = (userId: string) => {
    const approval = getApprovalForMember(userId);
    if (!approval) {
      return "Pending";
    }
    return approval.approved ? "Approved" : "Rejected";
  };

  const getStatusBadgeVariant = (userId: string) => {
    const approval = getApprovalForMember(userId);
    if (!approval) {
      return "secondary";
    }
    return approval.approved ? "default" : "destructive";
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className="flex items-center gap-2">
          {buttonText}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white">
        <DropdownMenuLabel className="text-base font-semibold">
          Week {request.week_number} Approval Status
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {householdMembers.map((member) => {
          const approval = getApprovalForMember(member.user_id);
          return (
            <DropdownMenuItem key={member.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(member.user_id)}
                <div>
                  <p className="font-medium">
                    {member.profile?.full_name || member.profile?.email || 'Unknown User'}
                  </p>
                  {approval && approval.responded_at && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(approval.responded_at), "MMM dd, h:mm a")}
                    </p>
                  )}
                  {approval && approval.comments && (
                    <p className="text-xs text-muted-foreground italic mt-1">
                      "{approval.comments}"
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={getStatusBadgeVariant(member.user_id)}>
                {getStatusText(member.user_id)}
              </Badge>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
