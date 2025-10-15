import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

interface MealPlannerHeaderProps {
  user: any;
  currentHousehold: any;
  onInfoClick?: () => void;
}

export const MealPlannerHeader = ({ user, currentHousehold, onInfoClick }: MealPlannerHeaderProps) => {
  const getWelcomeText = () => {
    if (!user) {
      return "Login to create meal plans";
    }
    if (!currentHousehold) {
      return "Plan the week with ease — all your meals, all in one place for your household.";
    }
    return "Plan the week with ease — all your meals, all in one place for your household.";
  };

  return (
    <PageHeader
      icon={
        <CalendarDays 
          className="h-6 w-6 sm:h-7 sm:w-7" 
          style={{ color: '#F5B82E', stroke: '#F5B82E' }}
          aria-hidden="true"
        />
      }
      title="Meal Planner"
      description={getWelcomeText()}
    />
  );
};
