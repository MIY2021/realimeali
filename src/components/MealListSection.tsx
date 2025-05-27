
import { MealType, MealPlan, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";
import { EnhancedMealCard } from "@/components/meal-planner/EnhancedMealCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface MealListSectionProps {
  mealType: MealType;
  mealPlans: MealPlan[];
  getRecipeById: (id: string) => Recipe | undefined;
  onAddMeal: (mealType: MealType) => void;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover?: (mealPlan: MealPlan, recipe: Recipe) => void;
  onReorderMeals?: (mealType: MealType, sourceIndex: number, destinationIndex: number) => void;
}

export default function MealListSection({
  mealType,
  mealPlans,
  getRecipeById,
  onAddMeal,
  onRemoveMeal,
  onCreateLeftover,
  onReorderMeals,
}: MealListSectionProps) {
  const isMobile = useIsMobile();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorderMeals) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex !== destinationIndex) {
      onReorderMeals(mealType, sourceIndex, destinationIndex);
    }
  };

  return (
    <div className={`mb-${isMobile ? '4' : '6'}`}>
      <div className={`flex items-center justify-between mb-3 ${isMobile ? 'px-1' : ''}`}>
        <div className="flex items-center gap-2">
          <GripVertical className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400 cursor-grab active:cursor-grabbing`} />
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold capitalize text-navy`}>
            {mealType}
          </h3>
        </div>
        <Button
          size={isMobile ? "sm" : "sm"}
          variant="outline"
          onClick={() => onAddMeal(mealType)}
          className={`text-terracotta border-terracotta hover:bg-terracotta/10 ${isMobile ? 'h-8 px-2 text-xs' : ''}`}
        >
          <Plus className={`${isMobile ? 'h-3 w-3 mr-0.5' : 'h-4 w-4 mr-1'}`} />
          Add
        </Button>
      </div>

      {mealPlans.length === 0 ? (
        <div className={`border border-dashed border-gray-300 rounded-md ${isMobile ? 'p-3' : 'p-4'} text-center text-muted-foreground`}>
          <span className={`${isMobile ? 'text-sm' : ''}`}>No {mealType} planned yet</span>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`${mealType}-meals`}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-${isMobile ? '1.5' : '2'} ${
                  snapshot.isDraggingOver ? 'bg-gray-50 rounded-lg p-2' : ''
                }`}
              >
                {mealPlans.map((plan, index) => {
                  const recipe = getRecipeById(plan.recipeId);
                  
                  // For leftover meals, get the parent recipe if the current recipe is not found
                  const parentRecipe = plan.isLeftover && plan.parentMealPlanId 
                    ? getRecipeById(plan.recipeId) 
                    : undefined;

                  return (
                    <Draggable key={plan.id} draggableId={plan.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${
                            snapshot.isDragging ? 'z-50' : ''
                          }`}
                        >
                          <EnhancedMealCard
                            mealPlan={plan}
                            recipe={recipe}
                            onRemove={onRemoveMeal}
                            onCreateLeftover={onCreateLeftover}
                            parentRecipe={parentRecipe}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
