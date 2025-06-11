
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { MealType } from "@/types";
import MealListSection from "@/components/MealListSection";

interface MealPlannerDragAndDropProps {
  mealTypes: MealType[];
  isDraggingCategory: boolean;
  draggedCategoryId: string | null;
  onDragStart: (result: any) => void;
  onDragEnd: (result: DropResult) => void;
  getMealPlansForType: (mealType: MealType) => any[];
  getRecipeById: (id: string) => any;
  onRemoveMeal: (planId: string) => void;
  onAddMeal: (mealType: MealType) => void;
  onCreateLeftover: (mealPlan: any, recipe: any) => void;
  onReorderMeals: (mealType: MealType, sourceIndex: number, destinationIndex: number) => Promise<void>;
}

export const MealPlannerDragAndDrop = ({
  mealTypes,
  isDraggingCategory,
  draggedCategoryId,
  onDragStart,
  onDragEnd,
  getMealPlansForType,
  getRecipeById,
  onRemoveMeal,
  onAddMeal,
  onCreateLeftover,
  onReorderMeals,
}: MealPlannerDragAndDropProps) => {
  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Droppable droppableId="meal-types">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-6 transition-all duration-200 ${
              snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-lg p-4' : ''
            }`}
          >
            {mealTypes.map((mealType, index) => (
              <Draggable key={mealType} draggableId={mealType} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`
                      transition-all duration-200 ease-in-out
                      ${snapshot.isDragging ? 
                        'shadow-2xl scale-105 rotate-1 z-50 bg-white rounded-lg border-2 border-blue-300' : 
                        isDraggingCategory && draggedCategoryId !== mealType ? 
                          'opacity-60 scale-95' : 
                          'opacity-100 scale-100'
                      }
                      ${snapshot.isDragging ? 'transform-gpu' : ''}
                    `}
                    style={{
                      ...provided.draggableProps.style,
                      ...(snapshot.isDragging && {
                        transform: `${provided.draggableProps.style?.transform} translateY(-8px)`,
                      }),
                    }}
                  >
                    <MealListSection
                      mealType={mealType}
                      mealPlans={getMealPlansForType(mealType)}
                      getRecipeById={getRecipeById}
                      onRemoveMeal={onRemoveMeal}
                      onAddMeal={() => onAddMeal(mealType)}
                      onCreateLeftover={onCreateLeftover}
                      onReorderMeals={onReorderMeals}
                      dragHandleProps={provided.dragHandleProps}
                      collapsed={isDraggingCategory && draggedCategoryId !== mealType}
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
  );
};
