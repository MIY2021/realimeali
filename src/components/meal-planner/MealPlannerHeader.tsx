
import { CalendarDays } from "lucide-react";

interface MealPlannerHeaderProps {
  user: any;
  currentHousehold: any;
}

export const MealPlannerHeader = ({ user, currentHousehold }: MealPlannerHeaderProps) => {
  const getWelcomeText = () => {
    if (!currentHousehold) {
      return "Plan the week with ease — all your meals, all in one place for your household.";
    }
    return "Plan the week with ease — all your meals, all in one place for your household.";
  };

  return (
    <div className="space-y-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
        <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 text-sage" />
        Meal Planner
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground">
        {user ? getWelcomeText() : "Login to create meal plans"}
      </p>
    </div>
  );
};
