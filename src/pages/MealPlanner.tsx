
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
    const availableSlot = getNextAvailableSlot(selectedMealType);
    
    const newMealPlan: MealPlan = {
      id: `meal-${Date.now()}`,
      date: selectedDate.toISOString(),
      mealType: selectedMealType,
      recipeId,
      notes: notes || undefined,
      createdBy: "user-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slotIndex: availableSlot,
    };
    
    setMealPlans([...mealPlans, newMealPlan]);
    handleCloseAddDialog();
  };
  
  const getNextAvailableSlot = (mealType: MealType) => {
    const existingSlots = mealPlans
      .filter(plan => plan.mealType === mealType)
      .map(plan => plan.slotIndex || 0);
    
    for (let i = 0; i < 5; i++) {
      if (!existingSlots.includes(i)) {
        return i;
      }
    }
    return 0;
  };
  
  const handleRemoveMealPlan = (mealPlanId: string) => {
    setMealPlans(mealPlans.filter((plan) => plan.id !== mealPlanId));
  };
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy">Meal Planner</h1>
        <p className="text-muted-foreground mt-1">
          Plan your weekly meals
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
