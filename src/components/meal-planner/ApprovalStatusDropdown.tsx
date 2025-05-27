
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
import { ChevronDown, Check, X, Clock, Bell } from "lucide-react";
import { useMealPlanApproval, ApprovalRequest } from "@/contexts/MealPlanApprovalContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/services/notificationService";
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
  const { toast } = useToast();

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

  const handleSendNotification = async (memberName: string) => {
    try {
      // Request permission if not already granted
      const permission = await notificationService.requestPermission();
      
      if (permission.granted) {
        notificationService.showApprovalRequestNotification(
          memberName, 
          request.week_number
        );
        
        toast({
          title: "Notification Sent",
          description: `Reminder sent to ${memberName} about Week ${request.week_number} approval.`,
        });
      } else {
        toast({
          title: "Notification Permission Required",
          description: "Please enable notifications to send reminders to household members.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification reminder.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className="flex items-center gap-2">
          {buttonText}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 bg-white">
        <DropdownMenuLabel className="text-base font-semibold">
          Week {request.week_number} Approval Status
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {householdMembers.map((member) => {
          const approval = getApprovalForMember(member.user_id);
          const memberName = member.profile?.full_name || member.profile?.email || 'Unknown User';
          
          return (
            <DropdownMenuItem key={member.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(member.user_id)}
                <div className="flex-1">
                  <p className="font-medium">{memberName}</p>
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
              
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(member.user_id)}>
                  {getStatusText(member.user_id)}
                </Badge>
                
                {!approval && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendNotification(memberName);
                    }}
                    title={`Send reminder to ${memberName}`}
                  >
                    <Bell className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
