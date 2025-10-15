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
      icon={CalendarDays}
      title="Meal Planner"
      description={getWelcomeText()}
    />
  );
};
