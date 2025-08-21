
import React, { useState } from "react";
import { MealPlannerContainer } from "@/components/meal-planner/MealPlannerContainer";

export default function MealPlanner() {
  const [currentWeek, setCurrentWeek] = useState<1 | 2>(1);
  
  return <MealPlannerContainer currentWeek={currentWeek} />;
}
