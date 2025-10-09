
import { CalendarDays, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MealPlannerHeaderProps {
  user: any;
  currentHousehold: any;
  onInfoClick?: () => void;
}

export const MealPlannerHeader = ({ user, currentHousehold, onInfoClick }: MealPlannerHeaderProps) => {
  const getWelcomeText = () => {
    if (!currentHousehold) {
      return "Plan the week with ease — all your meals, all in one place for your household.";
    }
    return "Plan the week with ease — all your meals, all in one place for your household.";
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-sage" />
          Meal Planner
        </h1>
        {onInfoClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onInfoClick}
            className="h-8 w-8 p-0 rounded-full opacity-0 pointer-events-none"
          >
            <Info className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-sm text-grey-light">
        {user ? getWelcomeText() : "Login to create meal plans"}
      </p>
    </div>
  );
};
