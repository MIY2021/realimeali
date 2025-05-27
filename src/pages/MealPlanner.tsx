
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { AddMealWithLeftoversDialog } from "@/components/meal-planner/AddMealWithLeftoversDialog";
import { LeftoverServingsDialog } from "@/components/meal-planner/LeftoverServingsDialog";
import MealListSection from "@/components/MealListSection";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipesLoader } from "@/hooks/useRecipesLoader";
import { useMealPlanActions } from "@/hooks/useMealPlanActions";
import { useRandomMealSelection } from "@/hooks/useRandomMealSelection";
import { MealPlannerHeader } from "@/components/meal-planner/MealPlannerHeader";
import { WeekSelector } from "@/components/meal-planner/WeekSelector";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useIsMobile } from "@/hooks/use-mobile";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { MealType } from "@/types";

export default function MealPlanner() {
  useDocumentTitle("Meal Planner | RealiMeali");
  
  const { user } = useAuth();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { isLoading: mealPlansLoading } = useMealPlan();
  const isMobile = useIsMobile();
  
  const [week, setWeek] = useState<1 | 2>(1);
  const [mealTypeOrder, setMealTypeOrder] = useState<MealType[]>(["dinner", "lunch", "breakfast", "snacks"]);
  
  // Load recipes automatically
  useRecipesLoader();
  
  const {
    addMealModal,
    setAddMealModal,
    leftoverModal,
    setLeftoverModal,
    getMealPlansForType,
    handleRemoveMeal,
    handleAddMeal,
    handleCreateLeftover,
    handleReorderMeals,
    onLeftoverConfirm,
    onAddMealFinish,
    handleClearAll,
    handleShareMealPlan,
  } = useMealPlanActions(week);

  // Updated to use simplified signature
  const { handleRandomMealSelection } = useRandomMealSelection(week, mealTypeOrder);

  const isLoading = recipesLoading || mealPlansLoading;
  const getRecipeById = (id: string) => recipes.find(r => r.id === id);

  const handleCategoryReorder = (result: DropResult) => {
    if (!result.destination) return;

    const newOrder = Array.from(mealTypeOrder);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);

    setMealTypeOrder(newOrder);
  };

  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-4' : 'py-8'} ${!isMobile ? 'max-w-2xl' : ''}`}>
      <MealPlannerHeader user={user} currentHousehold={currentHousehold} />
      
      {!user ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please log in to create and manage meal plans.</p>
        </div>
      ) : !currentHousehold ? (
        <div className="py-10 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-navy mb-2">No Household Selected</h2>
            <p className="text-muted-foreground mb-6">
              You need to create or join a household to manage meal plans.
            </p>
            <Button asChild className="bg-terracotta hover:bg-terracotta/90">
              <Link to="/household">
                Manage Household
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Loading meal plans and recipes...</p>
            </div>
          ) : (
            <>
              <MealPlannerActions
                onRandomize={handleRandomMealSelection}
                onShare={handleShareMealPlan}
                onClearAll={handleClearAll}
                isLoading={isLoading}
              />
              
              <WeekSelector week={week} onWeekChange={setWeek} />
              
              {recipes.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground mb-4">You need to create some recipes first before planning meals.</p>
                  <Button asChild className="bg-terracotta hover:bg-terracotta/90">
                    <Link to="/recipes">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Recipe
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  <DragDropContext onDragEnd={handleCategoryReorder}>
                    <Droppable droppableId="meal-categories">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {mealTypeOrder.map((mealType, index) => (
                            <Draggable key={mealType} draggableId={mealType} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                >
                                  <MealListSection
                                    key={mealType}
                                    mealType={mealType}
                                    mealPlans={getMealPlansForType(mealType)}
                                    getRecipeById={getRecipeById}
                                    onAddMeal={handleAddMeal}
                                    onRemoveMeal={handleRemoveMeal}
                                    onCreateLeftover={handleCreateLeftover}
                                    onReorderMeals={handleReorderMeals}
                                    dragHandleProps={provided.dragHandleProps}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  
                  {addMealModal.open && addMealModal.mealType && (
                    <AddMealWithLeftoversDialog
                      open={addMealModal.open}
                      onClose={() => setAddMealModal({ open: false, mealType: null })}
                      mealType={addMealModal.mealType}
                      recipes={recipes}
                      onSelectRecipe={(recipeId) => 
                        onAddMealFinish(addMealModal.mealType!, recipeId)
                      }
                    />
                  )}

                  <LeftoverServingsDialog
                    open={leftoverModal.open}
                    onClose={() => setLeftoverModal({ open: false, mealPlan: null, recipe: null })}
                    mealPlan={leftoverModal.mealPlan}
                    recipe={leftoverModal.recipe}
                    onConfirm={onLeftoverConfirm}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
