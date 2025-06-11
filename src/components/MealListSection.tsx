
import { MealType, MealPlan, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";
import { EnhancedMealCard } from "@/components/meal-planner/EnhancedMealCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useState, useEffect } from "react";

interface MealListSectionProps {
  mealType: MealType;
  mealPlans: MealPlan[];
  getRecipeById: (id: string) => Recipe | undefined;
  onAddMeal: (mealType: MealType) => void;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover?: (mealPlan: MealPlan, recipe: Recipe) => void;
  onUpdateServings?: (mealPlanId: string, newServings: number) => Promise<void>;
  onReorderMeals?: (mealType: MealType, sourceIndex: number, destinationIndex: number) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  collapsed?: boolean;
  sectionIndex?: number;
}

export default function MealListSection({
  mealType,
  mealPlans,
  getRecipeById,
  onAddMeal,
  onRemoveMeal,
  onCreateLeftover,
  onUpdateServings,
  onReorderMeals,
  dragHandleProps,
  collapsed = false,
  sectionIndex = 0,
}: MealListSectionProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);

  // Trigger section animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, sectionIndex * 100); // Stagger section animations by 100ms
    
    return () => clearTimeout(timer);
  }, [sectionIndex]);

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
    <div className={`mb-${isMobile ? '4' : '6'} transform transition-all duration-700 ease-out ${
      isVisible 
        ? 'translate-y-0 opacity-100 scale-100' 
        : 'translate-y-6 opacity-0 scale-98'
    } ${collapsed ? 'opacity-70 scale-98' : ''}`}
    style={{ 
      transitionDelay: `${sectionIndex * 100}ms`,
      willChange: 'transform, opacity'
    }}>
      <div className={`flex items-center justify-between mb-3 ${isMobile ? 'px-1' : ''} ${
        collapsed ? 'bg-gray-50 rounded-lg px-3 py-2' : ''
      }`}>
        <div className="flex items-center gap-2">
          <div {...dragHandleProps} className="touch-none">
            <GripVertical className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${
              collapsed ? 'text-blue-500' : 'text-gray-400'
            } cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110 active:scale-95`} />
          </div>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold capitalize ${
            collapsed ? 'text-blue-700' : 'text-navy'
          } transition-colors`}>
            {mealType}
          </h3>
          {collapsed && (
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground bg-white px-2 py-1 rounded-full animate-fade-in`}>
              {mealPlans.length} meal{mealPlans.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {!collapsed && (
          <Button
            size={isMobile ? "sm" : "sm"}
            variant="outline"
            onClick={() => onAddMeal(mealType)}
            className={`text-terracotta border-terracotta hover:bg-terracotta/10 transition-all duration-200 hover:scale-105 ${isMobile ? 'h-8 px-2 text-xs' : ''}`}
          >
            <Plus className={`${isMobile ? 'h-3 w-3 mr-0.5' : 'h-4 w-4 mr-1'}`} />
            Add
          </Button>
        )}
      </div>

      {collapsed ? null : (
        <div className="overflow-hidden">
          {mealPlans.length === 0 ? (
            <div className={`border border-dashed border-gray-300 rounded-md ${isMobile ? 'p-3' : 'p-4'} text-center text-muted-foreground transform transition-all duration-500 ease-out ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: `${(sectionIndex * 100) + 200}ms` }}>
              <span className={`${isMobile ? 'text-sm' : ''}`}>No {mealType} planned yet</span>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId={`${mealType}-meals`}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-${isMobile ? '1.5' : '2'} transition-all duration-300 ${
                      snapshot.isDraggingOver ? 'bg-gray-50 rounded-lg p-2 scale-105' : ''
                    }`}
                  >
                    {mealPlans.map((plan, index) => {
                      const recipe = getRecipeById(plan.recipe_id);
                      
                      // For leftover meals, get the parent recipe if the current recipe is not found
                      const parentRecipe = plan.is_leftover && plan.parent_meal_plan_id 
                        ? getRecipeById(plan.recipe_id) 
                        : undefined;

                      return (
                        <Draggable key={plan.id} draggableId={plan.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`transition-all duration-300 ${
                                snapshot.isDragging ? 'z-50 rotate-2 scale-105 shadow-lg' : ''
                              }`}
                              style={{
                                ...provided.draggableProps.style,
                                willChange: 'transform'
                              }}
                            >
                              <EnhancedMealCard
                                mealPlan={plan}
                                recipe={recipe}
                                onRemove={onRemoveMeal}
                                onCreateLeftover={onCreateLeftover}
                                onUpdateServings={onUpdateServings}
                                parentRecipe={parentRecipe}
                                dragHandleProps={provided.dragHandleProps}
                                animationDelay={(sectionIndex * 100) + (index * 50)}
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
