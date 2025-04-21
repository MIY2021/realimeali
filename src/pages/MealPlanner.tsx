import { useState } from "react";
import { CustomMealPlanCalendar } from "@/components/meal-planner/CustomMealPlanCalendar";
import { AddMealPlanDialog } from "@/components/meal-planner/AddMealPlanDialog";
import { MealPlan, MealType, RecipeCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, ListChecks, Share, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { mockMealPlans } from "@/data/mealPlans";
import { mockRecipes } from "@/data/recipes";

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
    const newMealPlans: MealPlan[] = [];

    const mealTypeToCategories: Record<MealType, RecipeCategory[]> = {
      dinner: ["Bulk", "Pasta", "Fish", "BBQ", "Super Tasty"],
      lunch: ["Easy", "Cheap", "Vegetarian", "Tapas"],
      breakfast: ["Easy", "Healthy", "Vegetarian"],
    };

    Object.entries(mealTypeToCategories).forEach(([mealType, categories]) => {
      const typeAsKey = mealType as MealType;

      // Only include allowed RecipeCategory values. No "Quick"
      const eligibleRecipes = mockRecipes.filter((recipe) =>
        recipe.categories.some((category) =>
          categories.includes(category as RecipeCategory)
        )
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

  // Share meal plan using Web Share API if available
  const handleShareMealPlan = () => {
    // Gather meal plan details:
    const planByDay: Record<string, { type: string, recipe: string }[]> = {};

    mealPlans.forEach(plan => {
      const recipe = mockRecipes.find(r => r.id === plan.recipeId);
      const date = new Date(plan.date).toLocaleDateString();
      if (!planByDay[date]) planByDay[date] = [];
      planByDay[date].push({
        type: plan.mealType,
        recipe: recipe ? recipe.title : "Unknown meal"
      });
    });

    const sortedDates = Object.keys(planByDay).sort();
    let shareText = "Here's our shared weekly meal plan!\n\n";
    sortedDates.forEach(date => {
      shareText += `${date}:\n`;
      planByDay[date]
        .sort((a, b) => a.type.localeCompare(b.type))
        .forEach(slot => {
          shareText += `- ${slot.type}: ${slot.recipe}\n`;
        });
      shareText += '\n';
    });

    // Try to use the native phone share dialog
    if (navigator.share) {
      navigator.share({
        title: "Weekly Meal Plan",
        text: shareText,
      });
    } else {
      // fallback: copy to clipboard and use toast
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Shared to clipboard",
        description: "Meal plan text copied (share not supported on this device)",
      });
    }
  };

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2 mb-4">
          <Calendar className="h-6 w-6" />
          Meal Planner
        </h1>
        <div className="flex flex-wrap gap-2 justify-start">
          <Button
            onClick={handleRandomMealSelection}
            size="sm"
            className="bg-sage hover:bg-sage/90 px-3 py-2 flex items-center whitespace-nowrap"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Randomise
          </Button>
          <Button
            onClick={handleShareMealPlan}
            size="sm"
            variant="outline"
            className="px-3 py-2 flex items-center whitespace-nowrap"
          >
            <Share className="mr-2 h-4 w-4" />
            Share Meal Plan
          </Button>
          <Button asChild variant="outline" size="sm" className="flex items-center px-3 py-2 whitespace-nowrap">
            <Link to="/shopping-list" className="flex items-center">
              <ListChecks className="mr-2 h-4 w-4" />
              Shopping List
            </Link>
          </Button>
        </div>
      </div>
      <CustomMealPlanCalendar
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
