import { useState } from "react";
import { MealType, MealPlan, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";
import { EnhancedMealCard } from "@/components/meal-planner/EnhancedMealCard";
import { MealSectionSkeleton } from "@/components/meal-planner/MealSectionSkeleton";
import { MealGenerationLoading } from "@/components/meal-planner/MealGenerationLoading";
import { useIsMobile } from "@/hooks/use-mobile";

// dnd-kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Section-level drag handle props (for reordering meal type sections)
type SectionDragHandleProps = Record<string, unknown> | null | undefined;

interface MealListSectionProps {
  mealType: MealType;
  mealPlans: MealPlan[];
  leftoverMap: Map<string, MealPlan>;
  getRecipeById: (id: string) => Recipe | undefined;
  isDataLoading?: boolean;
  isGenerating?: boolean;
  onAddMeal: (mealType: MealType) => void;
  onAddCustomMeal?: (mealType: MealType) => void;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover?: (mealPlan: MealPlan, recipe: Recipe) => void;
  onReorderMeals?: (mealType: MealType, reorderedIds: string[]) => void;
  dragHandleProps?: SectionDragHandleProps; // For section-level dragging
  collapsed?: boolean; // When section is being dragged
  sectionIndex?: number;
}

// Sortable wrapper for meal cards
interface SortableMealCardProps {
  mealPlan: MealPlan;
  recipe: Recipe | undefined;
  parentRecipe: Recipe | undefined;
  leftoverMap: Map<string, MealPlan>;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover?: (mealPlan: MealPlan, recipe: Recipe) => void;
}

function SortableMealCard({
  mealPlan,
  recipe,
  parentRecipe,
  leftoverMap,
  onRemoveMeal,
  onCreateLeftover,
}: SortableMealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mealPlan.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-shadow duration-200 ${
        isDragging ? 'shadow-2xl ring-2 ring-blue-300 rounded-lg' : ''
      }`}
    >
      <EnhancedMealCard
        mealPlan={mealPlan}
        recipe={recipe}
        onRemove={onRemoveMeal}
        onCreateLeftover={onCreateLeftover}
        parentRecipe={parentRecipe}
        dragHandleProps={{ ...attributes, ...listeners }}
        leftoverMap={leftoverMap}
      />
    </div>
  );
}

export default function MealListSection({
  mealType,
  mealPlans,
  leftoverMap,
  getRecipeById,
  isDataLoading = false,
  isGenerating = false,
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
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for both mouse and touch with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay before drag starts on touch
        tolerance: 5, // 5px movement tolerance during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Haptic feedback on mobile
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id || !onReorderMeals) {
      return;
    }

    // Find positions in the current array
    const oldIndex = mealPlans.findIndex(plan => plan.id === active.id);
    const newIndex = mealPlans.findIndex(plan => plan.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Create the new order and extract IDs
    const reorderedPlans = arrayMove(mealPlans, oldIndex, newIndex);
    const reorderedIds = reorderedPlans.map(plan => plan.id);

    // Call the reorder handler with the new order of IDs
    onReorderMeals(mealType, reorderedIds);
  };

  const handleAddMeal = () => {
    console.log("🍽️ Direct add meal for:", mealType);
    onAddMeal(mealType);
  };

  // Get the active meal plan for the drag overlay
  const activeMealPlan = activeId ? mealPlans.find(plan => plan.id === activeId) : null;
  const activeRecipe = activeMealPlan ? getRecipeById(activeMealPlan.recipe_id) : undefined;

  return (
    <div className={`mb-${isMobile ? '2' : '3'} ${collapsed ? 'opacity-70 scale-98' : ''}`}>
      <div className={`flex items-center justify-between mb-3 ${isMobile ? 'px-1' : ''} ${
        collapsed ? 'bg-blue-50 rounded-lg px-3 py-2 border border-blue-200' : ''
      }`}>
        <div className="flex items-center gap-3">
          {/* Section-level drag handle (for reordering meal type sections) */}
          {dragHandleProps && (
            <div 
              {...(dragHandleProps as React.HTMLAttributes<HTMLDivElement>)} 
              className="touch-none cursor-grab active:cursor-grabbing"
            >
              <GripVertical className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${
                collapsed ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'
              } transition-all duration-200 hover:scale-110 active:scale-95`} />
            </div>
          )}
          <h3 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-semibold capitalize ${
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
            isGenerating ? (
              <MealGenerationLoading mealType={mealType} />
            ) : (
              <div className={`border border-dashed border-gray-300 rounded-md ${isMobile ? 'p-3' : 'p-4'} text-center text-muted-foreground`}>
                <span className={`${isMobile ? 'text-sm' : ''}`}>No {mealType} planned yet</span>
              </div>
            )
          ) : (
            <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={mealPlans.map(plan => plan.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className={`space-y-${isMobile ? '1.5' : '2'}`}>
                {mealPlans.map((plan) => {
                  const recipe = getRecipeById(plan.recipe_id);
                  const parentRecipe = plan.is_leftover && plan.parent_meal_plan_id
                    ? getRecipeById(plan.recipe_id)
                    : undefined;

                  return (
                    <SortableMealCard
                      key={plan.id}
                      mealPlan={plan}
                      recipe={recipe}
                      parentRecipe={parentRecipe}
                      leftoverMap={leftoverMap}
                      onRemoveMeal={onRemoveMeal}
                      onCreateLeftover={onCreateLeftover}
                    />
                  );
                })}
              </div>
            </SortableContext>

            {/* Drag overlay for smooth visual feedback */}
            <DragOverlay>
              {activeMealPlan ? (
                <div className="shadow-2xl ring-2 ring-blue-400 rounded-lg rotate-2 scale-105">
                  <EnhancedMealCard
                    mealPlan={activeMealPlan}
                    recipe={activeRecipe}
                    onRemove={() => {}}
                    onCreateLeftover={() => {}}
                    leftoverMap={leftoverMap}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          )}
        </div>
      )}
    </div>
  );
}
