
import { useCallback } from "react";

interface UseMealPlanSharingProps {
  user: any;
  currentHousehold: any;
  currentWeek: 1 | 2;
  clearWeek: any;
  setIsLoading: (loading: boolean) => void;
  setClearAllDialog?: (open: boolean) => void;
  toast: any;
}

export const useMealPlanSharing = ({
  user,
  currentHousehold,
  currentWeek,
  clearWeek,
  setIsLoading,
  setClearAllDialog,
  toast,
}: UseMealPlanSharingProps) => {

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Week ${currentWeek} Meal Plan`,
          text: 'Check out my meal plan!',
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Meal plan link copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Share",
          description: "Share functionality not available",
        });
      }
    }
  }, [currentWeek, toast]);

  const handleClearAll = useCallback(() => {
    if (!user || !currentHousehold) return;
    
    // Use the dialog if available, otherwise fallback to confirm
    if (setClearAllDialog) {
      setClearAllDialog(true);
    } else {
      const confirmed = window.confirm(`Are you sure you want to clear all meals for week ${currentWeek}?`);
      if (confirmed) {
        performClearAll();
      }
    }
  }, [user, currentHousehold, currentWeek, setClearAllDialog]);

  const performClearAll = useCallback(async () => {
    if (!user || !currentHousehold) return;

    setIsLoading(true);
    try {
      await clearWeek(currentWeek);
      toast({
        title: "Week Cleared",
        description: `All meals cleared for week ${currentWeek}`,
      });
    } catch (err) {
      console.error("Error clearing week:", err);
      toast({
        title: "Error",
        description: "Failed to clear week",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentHousehold, currentWeek, clearWeek, setIsLoading, toast]);

  return {
    handleShare,
    handleClearAll,
    performClearAll,
  };
};
