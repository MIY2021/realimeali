import { useState } from "react";

const DEFAULT_LAYOUT = "list";

export function useMealPlannerLayout() {
  const [mealLayout, setMealLayout] = useState<string>(() => {
    // Brave/privacy settings can occasionally deny localStorage access.
    // Meal Planner should still render normally in that case.
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem("mealPlannerLayout") || DEFAULT_LAYOUT;
      }
    } catch (error) {
      console.warn("Unable to read Meal Planner layout preference:", error);
    }
    return DEFAULT_LAYOUT;
  });

  const handleMealLayoutChange = (value: string) => {
    if (!value) return;

    setMealLayout(value);

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("mealPlannerLayout", value);
      }
    } catch (error) {
      console.warn("Unable to save Meal Planner layout preference:", error);
    }
  };

  return {
    mealLayout,
    handleMealLayoutChange,
  };
}
