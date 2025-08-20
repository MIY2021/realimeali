import { useUserProfile } from "@/hooks/useUserProfile";

interface MealPlanCreationInfoProps {
  lastGenerated: Date | null;
  createdByUserId?: string;
  totalMeals: number;
}

export const MealPlanCreationInfo = ({
  lastGenerated,
  createdByUserId,
  totalMeals
}: MealPlanCreationInfoProps) => {
  const { profile } = useUserProfile(createdByUserId || null);
  
  if (!lastGenerated) return null;

  const createdByText = profile?.full_name ? ` by ${profile.full_name}` : '';

  return (
    <div className="py-2">
      <p className="text-xs text-muted-foreground">
        Meal plan created on {lastGenerated.toLocaleDateString()} at {lastGenerated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{createdByText}
      </p>
    </div>
  );
};