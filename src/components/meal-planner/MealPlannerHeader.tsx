
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
        <div className="flex items-center">
          <HouseholdMembersDisplay />
        </div>
      )}
    </div>
  );
};
