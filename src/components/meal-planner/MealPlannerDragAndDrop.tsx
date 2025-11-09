
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { MealType, MealPlan } from "@/types";
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
  leftoverMap: Map<string, MealPlan>; // Performance: Pre-computed leftover relationships
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
  leftoverMap,
}: MealPlannerDragAndDropProps) => {
  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Droppable droppableId="meal-types" type="CATEGORY">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-6 transition-all duration-300 ease-out ${
              snapshot.isDraggingOver ? 'bg-blue-50/30 rounded-xl p-4 border-2 border-dashed border-blue-300' : ''
            }`}
          >
            {mealTypes.map((mealType, index) => (
              <Draggable key={mealType} draggableId={`category-${mealType}`} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`
                      transition-all duration-300 ease-out transform-gpu
                      ${snapshot.isDragging ? 
                        'shadow-2xl scale-[1.02] rotate-1 z-50 bg-surface rounded-xl border-2 border-blue-400 ring-4 ring-blue-200' : 
                        isDraggingCategory && draggedCategoryId !== `category-${mealType}` ? 
                          'opacity-50 scale-95 blur-sm' : 
                          'opacity-100 scale-100 hover:shadow-lg'
                      }
                    `}
                    style={{
                      ...provided.draggableProps.style,
                      ...(snapshot.isDragging && {
                        transform: `${provided.draggableProps.style?.transform} translateY(-12px)`,
                        filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))',
                      }),
                    }}
                  >
                    <MealListSection
                      mealType={mealType}
                      mealPlans={getMealPlansForType(mealType)}
                      leftoverMap={leftoverMap}
                      getRecipeById={getRecipeById}
                      onRemoveMeal={onRemoveMeal}
                      onAddMeal={() => onAddMeal(mealType)}
                      onCreateLeftover={onCreateLeftover}
                      onReorderMeals={onReorderMeals}
                      dragHandleProps={provided.dragHandleProps}
                      collapsed={isDraggingCategory && draggedCategoryId !== `category-${mealType}`}
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
