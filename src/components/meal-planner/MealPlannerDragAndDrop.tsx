import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MealListSection } from "@/components/MealListSection";
import { MealType } from "@/types";

interface MealPlannerDragAndDropProps {
  currentMealPlans: any[];
  getRecipeById: (id: string) => any;
  onAddMeal: (mealType: any) => void;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover: (mealPlan: any, recipe: any) => void;
  onUpdateServings: (mealPlanId: string, newServings: number) => Promise<void>;
  onReorderMeals: (mealType: any, sourceIndex: number, destinationIndex: number) => void;
}

export function MealPlannerDragAndDrop({
  currentMealPlans,
  getRecipeById,
  onAddMeal,
  onRemoveMeal,
  onCreateLeftover,
  onUpdateServings,
  onReorderMeals,
}: MealPlannerDragAndDropProps) {
  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snacks"];
  const [collapsedSections, setCollapsedSections] = useState<{ [key in MealType]: boolean }>({
    breakfast: false,
    lunch: false,
    dinner: false,
    snacks: false,
  });

  const getMealPlansForType = (mealType: MealType) => {
    return currentMealPlans.filter((plan: { meal_type: MealType }) => plan.meal_type === mealType);
  };

  const handleOnDragEnd = (result: any) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "SECTION") {
      return;
    }
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="meal-sections" type="SECTION">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
            {mealTypes.map((mealType, index) => {
              const mealPlansForType = getMealPlansForType(mealType);
              const isCollapsed = collapsedSections[mealType];

              return (
                <Draggable key={mealType} draggableId={`section-${mealType}`} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps}>
                      <MealListSection
                        mealType={mealType}
                        mealPlans={mealPlansForType}
                        getRecipeById={getRecipeById}
                        onAddMeal={onAddMeal}
                        onRemoveMeal={onRemoveMeal}
                        onCreateLeftover={onCreateLeftover}
                        onUpdateServings={onUpdateServings}
                        onReorderMeals={onReorderMeals}
                        dragHandleProps={provided.dragHandleProps}
                        collapsed={isCollapsed}
                        sectionIndex={index}
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
  );
}
