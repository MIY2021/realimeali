
import { CalendarDays } from "lucide-react";
import { HouseholdMembersDisplay } from "@/components/household/HouseholdMembersDisplay";
import { useHousehold } from "@/contexts/HouseholdContext";

interface MealPlannerHeaderProps {
  user: any;
  currentHousehold: any;
}

export const MealPlannerHeader = ({ user, currentHousehold }: MealPlannerHeaderProps) => {
  const { householdMembers, isLoadingMembers } = useHousehold();

  console.log('MealPlannerHeader render:', {
    hasUser: !!user,
    hasHousehold: !!currentHousehold,
    householdId: currentHousehold?.id,
    householdName: currentHousehold?.name,
    membersCount: householdMembers?.length || 0,
    isLoadingMembers,
    shouldShowMembers: !!(user && currentHousehold)
  });

  const getWelcomeText = () => {
    if (!currentHousehold) {
      return "Plan the week with ease — all your meals, all in one place for your household.";
    }
    return "Plan the week with ease — all your meals, all in one place for your household.";
  };

  return (
    <div className="flex items-center justify-between mb-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
          <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8" />
          Meal Planner
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {user ? getWelcomeText() : "Login to create meal plans"}
        </p>
      </div>
      {user && currentHousehold && (
        <div className="flex items-center">
          <HouseholdMembersDisplay />
        </div>
      )}
    </div>
  );
};
