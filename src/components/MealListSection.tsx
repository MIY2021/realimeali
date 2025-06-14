
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
  onReorderMeals,
  dragHandleProps,
  collapsed = false,
  sectionIndex = 0,
}: MealListSectionProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, sectionIndex * 100);
    
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
    <div className={`mb-${isMobile ? '4' : '6'} transform transition-all duration-500 ease-out ${
      isVisible 
        ? 'translate-y-0 opacity-100 scale-100' 
        : 'translate-y-6 opacity-0 scale-98'
    } ${collapsed ? 'opacity-70 scale-98' : ''}`}
    style={{ 
      transitionDelay: `${sectionIndex * 100}ms`,
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
          {collapsed && (
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-600 bg-blue-100 px-2 py-1 rounded-full animate-fade-in`}>
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
              <Droppable droppableId={`${mealType}-meals`} type="MEAL">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-${isMobile ? '1.5' : '2'} transition-all duration-300 ease-out ${
                      snapshot.isDraggingOver ? 'bg-gray-50/50 rounded-lg p-2 scale-[1.01] border-2 border-dashed border-gray-300' : ''
                    }`}
                    style={{ minHeight: '50px' }}
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
                              className={`transition-all duration-200 ease-out ${
                                snapshot.isDragging ? 
                                  'z-50 rotate-1 scale-105 shadow-xl ring-2 ring-blue-300 bg-white rounded-lg' : 
                                  'hover:shadow-sm'
                              }`}
                              style={{
                                ...provided.draggableProps.style,
                                ...(snapshot.isDragging && {
                                  transform: `${provided.draggableProps.style?.transform} rotate(2deg)`,
                                  boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
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
