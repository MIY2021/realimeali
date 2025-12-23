import { Sparkles } from "lucide-react";

interface MealGenerationLoadingProps {
  mealType: string;
}

const pluralizeMealType = (mealType: string): string => {
  // Handle special cases that are already plural
  if (mealType === 'desserts') return 'desserts';
  if (mealType === 'snacks') return 'snacks';
  if (mealType === 'sides') return 'sides';
  if (mealType === 'drinks') return 'drinks';
  
  // Handle special pluralization rules
  if (mealType === 'lunch') return 'lunches';
  if (mealType === 'dinner') return 'dinners';
  if (mealType === 'breakfast') return 'breakfasts';
  
  // Default: add 's'
  return `${mealType}s`;
};

export function MealGenerationLoading({ mealType }: MealGenerationLoadingProps) {
  const pluralMealType = pluralizeMealType(mealType);
  
  return (
    <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-terracotta-500 animate-spin" style={{ animationDuration: '2s' }} />
        <span className="text-sm text-muted-foreground">Generating {pluralMealType}...</span>
      </div>
    </div>
  );
}

