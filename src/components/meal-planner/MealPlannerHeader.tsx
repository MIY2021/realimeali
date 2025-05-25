
import { CalendarDays } from "lucide-react";
import { HouseholdMembersDisplay } from "@/components/household/HouseholdMembersDisplay";

interface MealPlannerHeaderProps {
  user: any;
  currentHousehold: any;
}

export const MealPlannerHeader = ({ user, currentHousehold }: MealPlannerHeaderProps) => {
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
        <HouseholdMembersDisplay />
      )}
    </div>
  );
};
