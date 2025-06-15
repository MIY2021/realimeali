
import { useIsMobile } from "@/hooks/use-mobile";
import { MealPlan, Recipe } from "@/types";
import { ServingsSelector } from "./ServingsSelector";

interface MealCardDetailsProps {
  mealPlan: MealPlan;
  recipe?: Recipe | undefined;
  parentRecipe?: Recipe | undefined;
  onServingsChange: (newServings: number) => void;
}

export const MealCardDetails = ({
  mealPlan,
  recipe,
  parentRecipe,
  onServingsChange,
}: MealCardDetailsProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-w-0 flex-1">
      {/* Servings */}
      <div className={`flex items-center gap-2 mb-1 ${mealPlan.is_completed ? 'opacity-60' : ''}`}>
        <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
          Servings:
        </span>
        <ServingsSelector
          currentServings={mealPlan.planned_servings || recipe?.servings || 1}
          onServingsChange={onServingsChange}
        />
      </div>
      
      {/* Leftover indicator */}
      {mealPlan.is_leftover && (
        <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} ${
          mealPlan.is_completed ? 'opacity-60 line-through' : ''
        }`}>
          Leftover from {parentRecipe?.title || 'original meal'}
        </p>
      )}
    </div>
  );
};
