
import { CalendarDays, RotateCcw } from "lucide-react";
import { HouseholdMembersDisplay } from "@/components/household/HouseholdMembersDisplay";
import { Button } from "@/components/ui/button";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useState } from "react";

interface MealPlannerHeaderProps {
  user: any;
  currentHousehold: any;
}

export const MealPlannerHeader = ({ user, currentHousehold }: MealPlannerHeaderProps) => {
  const { householdMembers, isLoadingMembers } = useHousehold();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force a page refresh to reload all household data
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  console.log('MealPlannerHeader - Current state:', {
    hasUser: !!user,
    hasHousehold: !!currentHousehold,
    householdId: currentHousehold?.id,
    householdName: currentHousehold?.name,
    membersCount: householdMembers.length,
    isLoadingMembers,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="flex items-center justify-between mb-2">
      <div>
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <CalendarDays className="h-6 w-6" />
          Meal Planner
        </h1>
        <p className="text-sm text-muted-foreground">
          {user ? "Plan and organize your weekly meals with your household" : "Login to create meal plans"}
        </p>
      </div>
      {user && currentHousehold && (
        <div className="flex items-center gap-2">
          <HouseholdMembersDisplay />
          {(householdMembers.length === 0 && !isLoadingMembers) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-terracotta hover:text-terracotta"
            >
              <RotateCcw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
