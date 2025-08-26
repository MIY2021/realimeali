
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeedbackItem {
  id: string;
  user_id: string | null;
  email: string | null;
  subject: string;
  message: string;
  type: string;
  status: string;
  priority?: string;
  admin_notes?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface FeedbackModerationNavigationProps {
  currentIndex: number;
  totalCount: number;
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  onNavigate: (index: number) => void;
  allFeedback: FeedbackItem[];
}

export function FeedbackModerationNavigation({
  currentIndex,
  totalCount,
  currentFilter,
  onFilterChange,
  onNavigate,
  allFeedback,
}: FeedbackModerationNavigationProps) {
  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalCount - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleFirst = () => {
    onNavigate(0);
  };

  const handleLast = () => {
    onNavigate(totalCount - 1);
  };

  const normalizeStatus = (status: string) => {
    switch (status) {
      case 'new': return 'pending';
      case 'completed': return 'complete';
      case 'closed': return 'complete';
      default: return status;
    }
  };

  const getFilterCounts = () => {
    return {
      pending: allFeedback.filter(f => {
        const status = normalizeStatus(f.status);
        return status === 'pending';
      }).length,
      in_progress: allFeedback.filter(f => {
        const status = normalizeStatus(f.status);
        return status === 'in_progress';
      }).length,
      complete: allFeedback.filter(f => {
        const status = normalizeStatus(f.status);
        return status === 'complete';
      }).length,
    };
  };

  const counts = getFilterCounts();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border-b">
      {/* Filter Selection */}
      <div className="flex items-center gap-4">
        <Select value={currentFilter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">
              <div className="flex items-center justify-between w-full">
                <span>Pending</span>
                <Badge variant="secondary" className="ml-2">
                  {counts.pending}
                </Badge>
              </div>
            </SelectItem>
            <SelectItem value="in_progress">
              <div className="flex items-center justify-between w-full">
                <span>In Progress</span>
                <Badge variant="secondary" className="ml-2">
                  {counts.in_progress}
                </Badge>
              </div>
            </SelectItem>
            <SelectItem value="complete">
              <div className="flex items-center justify-between w-full">
                <span>Complete</span>
                <Badge variant="secondary" className="ml-2">
                  {counts.complete}
                </Badge>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {totalCount > 0 && (
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} of {totalCount} feedback items
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFirst}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            <ChevronLeft className="h-4 w-4 -ml-2" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === totalCount - 1}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLast}
            disabled={currentIndex === totalCount - 1}
          >
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
