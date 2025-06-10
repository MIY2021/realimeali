
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface FeedbackStatusManagerProps {
  feedbackId: string;
  currentStatus: string;
  onStatusUpdate: (feedbackId: string, newStatus: string) => Promise<boolean>;
}

export function FeedbackStatusManager({ 
  feedbackId, 
  currentStatus, 
  onStatusUpdate 
}: FeedbackStatusManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'complete', label: 'Complete' },
    { value: 'dismissed', label: 'Dismissed' }
  ];

  const normalizeStatus = (status: string) => {
    switch (status) {
      case 'new': return 'pending';
      case 'completed': return 'complete';
      case 'closed': return 'complete';
      case 'resolved': return 'complete';
      default: return status;
    }
  };

  const normalizedCurrentStatus = normalizeStatus(currentStatus);

  const handleStatusChange = async () => {
    if (selectedStatus === normalizedCurrentStatus) return;

    setIsUpdating(true);
    try {
      console.log('FeedbackStatusManager: Updating status from', normalizedCurrentStatus, 'to', selectedStatus);
      const success = await onStatusUpdate(feedbackId, selectedStatus);
      
      if (success) {
        toast({
          title: "Status Updated",
          description: `Feedback status changed to ${statusOptions.find(s => s.value === selectedStatus)?.label}`,
        });
      } else {
        throw new Error('Status update failed');
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast({
        title: "Error",
        description: "Failed to update feedback status",
        variant: "destructive",
      });
      setSelectedStatus(normalizedCurrentStatus); // Reset on error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedStatus !== normalizedCurrentStatus && (
        <Button 
          onClick={handleStatusChange} 
          disabled={isUpdating}
          size="sm"
        >
          {isUpdating ? "Updating..." : "Save"}
        </Button>
      )}
    </div>
  );
}
