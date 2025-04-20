
import { useState } from "react";
import { MealPlanCalendar } from "@/components/meal-planner/MealPlanCalendar";
import { AddMealPlanDialog } from "@/components/meal-planner/AddMealPlanDialog";
import { mockMealPlans, mockRecipes } from "@/data/mockData";
import { MealPlan, MealType } from "@/types";

export default function MealPlanner() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>(mockMealPlans);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");
  
  const handleOpenAddDialog = (date: Date, mealType: MealType) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setIsAddDialogOpen(true);
  };
  
  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };
  
  const handleAddMealPlan = (recipeId: string, notes: string) => {
    // In a real app, this would be an API call
    const newMealPlan: MealPlan = {
      id: `meal-${Date.now()}`,
      date: selectedDate.toISOString(),
      mealType: selectedMealType,
      recipeId,
      notes: notes || undefined,
      createdBy: "user-1", // Current user ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setMealPlans([...mealPlans, newMealPlan]);
    handleCloseAddDialog();
  };
  
  const handleRemoveMealPlan = (mealPlanId: string) => {
    // In a real app, this would be an API call
    setMealPlans(mealPlans.filter((plan) => plan.id !== mealPlanId));
  };
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy">Meal Planner</h1>
        <p className="text-muted-foreground mt-1">
          Plan your meals for the week ahead
        </p>
      </div>
      
      <MealPlanCalendar 
        mealPlans={mealPlans}
        onAddMealPlan={handleOpenAddDialog}
        onRemoveMealPlan={handleRemoveMealPlan}
      />
      
      <AddMealPlanDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        onAddMealPlan={handleAddMealPlan}
        recipes={mockRecipes}
        selectedDate={selectedDate}
        selectedMealType={selectedMealType}
      />
    </div>
  );
}
