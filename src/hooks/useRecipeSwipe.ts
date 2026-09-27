import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useToast } from "@/hooks/use-toast";
import {
  formatLocalDateYMD,
  getCurrentWeekKey,
  getNextWeek,
  getWeekStartDate,
  parseISOWeekKey,
} from "@/utils/weekUtils";

export type SwipeDecision = "yes" | "no";

export function useRecipeSwipe(recipes: Recipe[]) {
  const { user } = useAuth();
  const { currentHousehold, householdMembers } = useHousehold();
  const { getMealPlansForWeek, addMealPlan } = useMealPlan();
  const { toast } = useToast();
  const [swipes, setSwipes] = useState<Record<string, SwipeDecision>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbAvailable, setDbAvailable] = useState(true);
  const [weekKey, setWeekKey] = useState(() => getNextWeek(getCurrentWeekKey()));

  const plannedRecipeIds = useMemo(
    () =>
      new Set(
        getMealPlansForWeek(weekKey)
          .filter(plan => plan.meal_type === "dinner" && plan.recipe_id)
          .map(plan => plan.recipe_id as string)
      ),
    [getMealPlansForWeek, weekKey]
  );

  // Cycle through every dinner recipe in the household. The order is stable
  // for the selected household/week, but changes for a new week.
  const swipePool = useMemo(() => {
    const candidates = recipes.filter(recipe => {
      if (recipe.household_id !== currentHousehold?.id) return false;
      return Boolean(
        recipe.meal_types?.includes("dinner") || recipe.meal_type === "dinner"
      );
    });

    const seedSource = `${currentHousehold?.id ?? ""}:${weekKey}`;
    let seed = 0;
    for (let i = 0; i < seedSource.length; i++) {
      seed = (seed * 31 + seedSource.charCodeAt(i)) >>> 0;
    }

    return [...candidates]
      .map(recipe => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return { recipe, sort: seed };
      })
      .sort((a, b) => a.sort - b.sort)
      .map(({ recipe }) => recipe);
  }, [recipes, currentHousehold?.id, weekKey]);

  const remainingRecipes = useMemo(
    () =>
      swipePool.filter(
        recipe => !swipes[recipe.id] && !plannedRecipeIds.has(recipe.id)
      ),
    [swipePool, swipes, plannedRecipeIds]
  );

  const yesCount = useMemo(
    () => Object.values(swipes).filter(decision => decision === "yes").length,
    [swipes]
  );

  const loadSwipes = useCallback(async () => {
    if (!user || !currentHousehold) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("recipe_swipes")
      .select("recipe_id, user_id, decision")
      .eq("household_id", currentHousehold.id)
      .eq("user_id", user.id)
      .eq("week_key", weekKey);

    if (error) {
      console.error("Failed to load recipe swipes:", error);
      setDbAvailable(false);
      setIsLoading(false);
      return;
    }

    setDbAvailable(true);
    const own: Record<string, SwipeDecision> = {};
    (data || []).forEach(row => {
      own[row.recipe_id] = row.decision as SwipeDecision;
    });

    setSwipes(own);
    setIsLoading(false);
  }, [user?.id, currentHousehold?.id, weekKey]);

  useEffect(() => {
    void loadSwipes();
  }, [loadSwipes]);

  const swipe = useCallback(
    async (recipe: Recipe, decision: SwipeDecision) => {
      if (!user || !currentHousehold || isSaving) return false;

      setIsSaving(true);
      setSwipes(prev => ({ ...prev, [recipe.id]: decision }));

      const { error } = await supabase
        .from("recipe_swipes")
        .upsert(
          {
            household_id: currentHousehold.id,
            user_id: user.id,
            recipe_id: recipe.id,
            week_key: weekKey,
            decision,
          },
          { onConflict: "household_id,user_id,recipe_id,week_key" }
        );

      if (error) {
        console.error("Failed to save recipe swipe:", error);
        setSwipes(prev => {
          const next = { ...prev };
          delete next[recipe.id];
          return next;
        });
        setDbAvailable(false);
        setIsSaving(false);
        return false;
      }

      if (decision === "yes") {
        try {
          const { year, week } = parseISOWeekKey(weekKey);
          const weekStart = getWeekStartDate(year, week);
          const date = formatLocalDateYMD(weekStart);
          const existingDinnerPlans = getMealPlansForWeek(weekKey).filter(
            plan => plan.meal_type === "dinner"
          );
          const nextSlotIndex =
            existingDinnerPlans.reduce(
              (max, plan) => Math.max(max, plan.slot_index ?? 0),
              -1
            ) + 1;

          // The Meal Planner is a flexible weekly meal collection, not a
          // day-by-day planner. The database currently requires a date, so
          // the week start is used only as a storage anchor; this feature
          // never chooses or fills individual days.
          await addMealPlan(
            {
              recipe_id: recipe.id,
              meal_type: "dinner",
              date,
              created_by: user.id,
              slot_index: nextSlotIndex,
              is_leftover: false,
              household_id: currentHousehold.id,
              week_key: weekKey,
              original_servings: recipe.servings || 4,
              planned_servings: recipe.servings || 4,
              is_completed: false,
              is_freetyped: false,
            },
            weekKey
          );
        } catch (error) {
          console.error("Failed to add recipe to meal plan:", error);
          await supabase
            .from("recipe_swipes")
            .delete()
            .eq("household_id", currentHousehold.id)
            .eq("user_id", user.id)
            .eq("recipe_id", recipe.id)
            .eq("week_key", weekKey);

          setSwipes(prev => {
            const next = { ...prev };
            delete next[recipe.id];
            return next;
          });
          setIsSaving(false);
          toast({
            title: "Couldn't add meal",
            description: "The recipe wasn't added to your meal plan. Please try again.",
            variant: "destructive",
          });
          return false;
        }
      }

      setDbAvailable(true);
      setIsSaving(false);
      return true;
    },
    [
      user,
      currentHousehold?.id,
      weekKey,
      isSaving,
      getMealPlansForWeek,
      addMealPlan,
      toast,
    ]
  );

  return {
    weekKey,
    setWeekKey,
    remainingRecipes,
    yesCount,
    householdMemberCount: householdMembers.length,
    isLoading,
    isSaving,
    dbAvailable,
    swipe,
    reload: loadSwipes,
    allComplete: swipePool.length > 0 && remainingRecipes.length === 0,
  };
}
