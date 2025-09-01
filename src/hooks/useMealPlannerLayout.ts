import { useState } from "react";

export function useMealPlannerLayout() {
  const [mealLayout, setMealLayout] = useState<string>(() => {
    return localStorage.getItem('mealPlannerLayout') || 'list';
  });

  const handleMealLayoutChange = (value: string) => {
    if (value) {
      setMealLayout(value);
      localStorage.setItem('mealPlannerLayout', value);
    }
  };

  return {
    mealLayout,
    handleMealLayoutChange,
  };
}