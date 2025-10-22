import { useState } from "react";
import { MealType, MealPlan, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";
import { EnhancedMealCard } from "@/components/meal-planner/EnhancedMealCard";
import { MealSectionSkeleton } from "@/components/meal-planner/MealSectionSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useEffect } from "react";

interface MealListSectionProps {
  mealType: MealType;
  mealPlans: MealPlan[];
  leftoverMap: Map<string, MealPlan>; // Performance: Pre-computed leftover relationships
  getRecipeById: (id: string) => Recipe | undefined;
  isDataLoading?: boolean;
  onAddMeal: (mealType: MealType) => void;
  onAddCustomMeal?: (mealType: MealType) => void;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover?: (mealPlan: MealPlan, recipe: Recipe) => void;
  onReorderMeals?: (mealType: MealType, sourceIndex: number, destinationIndex: number) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  collapsed?: boolean;
  sectionIndex?: number;
}

export default function MealListSection({
  mealType,
  mealPlans,
  leftoverMap,
  getRecipeById,
  isDataLoading = false,
  onAddMeal,
  onAddCustomMeal,
  onRemoveMeal,
  onCreateLeftover,
  onReorderMeals,
  dragHandleProps,
  collapsed = false,
  sectionIndex = 0,
}: MealListSectionProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  

  // Performance: Instant visibility for shell-first loading
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorderMeals) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Only proceed if the item was actually moved to a different position
    if (sourceIndex !== destinationIndex) {
      onReorderMeals(mealType, sourceIndex, destinationIndex);
    }
  };

  const handleDragStart = () => {
    // Add haptic feedback on mobile
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleAddMeal = () => {
    console.log("🍽️ Direct add meal for:", mealType);
    onAddMeal(mealType);
  };

  const handleAddCustomMeal = () => {
    console.log("🍽️ Direct add custom meal for:", mealType);
    onAddCustomMeal?.(mealType);
  };

  return (
    <div className={`mb-${isMobile ? '2' : '3'} transform transition-all duration-500 ease-out ${
      isVisible 
        ? 'translate-y-0 opacity-100 scale-100' 
        : 'translate-y-6 opacity-0 scale-98'
    } ${collapsed ? 'opacity-70 scale-98' : ''}`}
    style={{ 
      transitionDelay: `${sectionIndex * 50}ms`,
      willChange: 'transform, opacity'
    }}>
      <div className={`flex items-center justify-between mb-3 ${isMobile ? 'px-1' : ''} ${
        collapsed ? 'bg-blue-50 rounded-lg px-3 py-2 border border-blue-200' : ''
      }`}>
        <div className="flex items-center gap-3">
          <div {...dragHandleProps} className="touch-none group">
            <GripVertical className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${
              collapsed ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
            } cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110 active:scale-95`} />
          </div>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold capitalize ${
            collapsed ? 'text-blue-700' : 'text-navy'
          } transition-colors`}>
            {mealType}
          </h3>
          <span className={`text-xs text-muted-foreground/70 px-1.5 py-0.5 rounded-full animate-fade-in ${
            collapsed ? 'text-blue-600 bg-blue-100' : 'bg-gray-50'
          }`}>
            {isDataLoading ? '–' : mealPlans.length}
          </span>
        </div>
        {!collapsed && (
          /* Override min-height/min-width with !important to allow h-6 w-6 (24px) sizing */
          <Button
            variant="ghost"
            onClick={handleAddMeal}
            disabled={isDataLoading}
            aria-busy={isDataLoading}
            className="h-6 w-6 !min-h-0 !min-w-0 rounded-full bg-[#F5B82E]/50 hover:bg-[#F5B82E]/70 p-0 disabled:opacity-50"
          >
            <Plus className="h-4 w-4 text-white" />
          </Button>
        )}
      </div>

      {collapsed ? null : (
        <div className="overflow-hidden">
          {isDataLoading ? (
            <MealSectionSkeleton count={3} />
          ) : mealPlans.length === 0 ? (
            <div className={`border border-dashed border-gray-300 rounded-md ${isMobile ? 'p-3' : 'p-4'} text-center text-muted-foreground transform transition-all duration-500 ease-out ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: `${(sectionIndex * 50) + 100}ms` }}>
              <span className={`${isMobile ? 'text-sm' : ''}`}>No {mealType} planned yet</span>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
              <Droppable droppableId={`${mealType}-meals`} type="MEAL">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-${isMobile ? '1.5' : '2'} transition-all duration-300 ease-out ${
                      snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-lg p-2 scale-[1.01] border-2 border-dashed border-blue-300' : ''
                    }`}
                  >
                    {mealPlans.map((plan, index) => {
                      const recipe = getRecipeById(plan.recipe_id);
                      
                      const parentRecipe = plan.is_leftover && plan.parent_meal_plan_id 
                        ? getRecipeById(plan.recipe_id) 
                        : undefined;

                      return (
                        <Draggable key={plan.id} draggableId={plan.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`transition-all duration-300 ease-out transform-gpu select-none ${
                                snapshot.isDragging ? 
                                  'z-50 rotate-1 scale-[1.02] shadow-2xl ring-2 ring-blue-300 bg-white rounded-lg' : 
                                  'hover:shadow-md'
                              }`}
                              style={{
                                ...provided.draggableProps.style,
                                willChange: 'transform',
                                ...(snapshot.isDragging && {
                                  filter: 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.15))',
                                  transform: `${provided.draggableProps.style?.transform} rotate(1deg)`,
                                }),
                              }}
                            >
                              <EnhancedMealCard
                                mealPlan={plan}
                                recipe={recipe}
                                onRemove={onRemoveMeal}
                                onCreateLeftover={onCreateLeftover}
                                parentRecipe={parentRecipe}
                                dragHandleProps={provided.dragHandleProps}
                                animationDelay={(sectionIndex * 50) + (index * 25)}
                                leftoverMap={leftoverMap}
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
      )}

    </div>
  );
}
