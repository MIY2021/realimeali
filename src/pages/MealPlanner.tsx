
import { useState } from "react";
import { MealPlanCalendar } from "@/components/meal-planner/MealPlanCalendar";
import { AddMealPlanDialog } from "@/components/meal-planner/AddMealPlanDialog";
import { mockMealPlans, mockRecipes } from "@/data/mockData";
import { MealPlan, MealType } from "@/types";
import { Button } from "@/components/ui/button";
import { Shuffle, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function MealPlanner() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>(mockMealPlans);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");
  const { toast } = useToast();

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
      .filter((plan) => plan.mealType === mealType)
      .map((plan) => plan.slotIndex || 0);

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

  const handleRandomMealSelection = () => {
    // Clear existing meal plans
    const newMealPlans: MealPlan[] = [];

    // Categories for each meal type
    const mealTypeToCategories = {
      dinner: ["dinner"],
      lunch: ["lunch"],
      breakfast: ["breakfast"],
    };

    // Generate 5 random meals for each meal type
    Object.entries(mealTypeToCategories).forEach(([mealType, categories]) => {
      const typeAsKey = mealType as MealType;
      const eligibleRecipes = mockRecipes.filter((recipe) =>
        recipe.categories.some((category) => categories.includes(category))
      );

      for (let i = 0; i < 5; i++) {
        if (eligibleRecipes.length > 0) {
          const randomIndex = Math.floor(Math.random() * eligibleRecipes.length);
          const recipe = eligibleRecipes[randomIndex];

          newMealPlans.push({
            id: `random-meal-${Date.now()}-${mealType}-${i}`,
            date: new Date().toISOString(),
            mealType: typeAsKey,
            recipeId: recipe.id,
            createdBy: "user-1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            slotIndex: i,
          });
        }
      }
    });

    setMealPlans(newMealPlans);
    toast({
      title: "Meal Plan Generated",
      description: "Random meals have been selected for your plan",
    });
  };

  return (
    <div className="container py-6">
      <div className="mb-6 flex flex-wrap gap-2 justify-start">
        <Button
          onClick={handleRandomMealSelection}
          size="sm"
          className="bg-sage hover:bg-sage/90 px-3 py-2 flex items-center whitespace-nowrap"
        >
          <Shuffle className="mr-2 h-4 w-4" />
          Randomise
        </Button>
        <Button asChild variant="outline" size="sm" className="flex items-center px-3 py-2 whitespace-nowrap">
          <Link to="/shopping-list" className="flex items-center">
            <ListChecks className="mr-2 h-4 w-4" />
            Shopping List
          </Link>
        </Button>
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
