
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";

interface ModerationNavigationProps {
  currentIndex: number;
  totalCount: number;
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  onNavigate: (index: number) => void;
  recipes: CommunityRecipe[];
}

export function ModerationNavigation({
  currentIndex,
  totalCount,
  currentFilter,
  onFilterChange,
  onNavigate,
  recipes,
}: ModerationNavigationProps) {
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

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'All';
    }
  };

  const getFilterCounts = () => {
    return {
      pending: recipes.filter(r => r.moderation_status === 'pending' || !r.moderation_status).length,
      approved: recipes.filter(r => r.moderation_status === 'approved').length,
      rejected: recipes.filter(r => r.moderation_status === 'rejected').length,
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
              <div className="flex items-center gap-2">
                <span>Pending Review</span>
                <Badge variant="secondary" className="ml-auto">
                  {counts.pending}
                </Badge>
              </div>
            </SelectItem>
            <SelectItem value="approved">
              <div className="flex items-center gap-2">
                <span>Approved</span>
                <Badge variant="secondary" className="ml-auto">
                  {counts.approved}
                </Badge>
              </div>
            </SelectItem>
            <SelectItem value="rejected">
              <div className="flex items-center gap-2">
                <span>Rejected</span>
                <Badge variant="secondary" className="ml-auto">
                  {counts.rejected}
                </Badge>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {totalCount > 0 && (
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} of {totalCount} {getFilterLabel(currentFilter).toLowerCase()}
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
