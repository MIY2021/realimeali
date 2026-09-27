import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { getCurrentWeekKey, getNextWeek } from "@/utils/weekUtils";

export type SwipeDecision = "yes" | "no";

export interface RecipeSwipeMatch {
  recipeId: string;
  userIds: string[];
}

export function useRecipeSwipe(recipes: Recipe[]) {
  const { user } = useAuth();
  const { currentHousehold, householdMembers } = useHousehold();
  const [swipes, setSwipes] = useState<Record<string, SwipeDecision>>({});
  const [matches, setMatches] = useState<RecipeSwipeMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbAvailable, setDbAvailable] = useState(true);

  const weekKey = useMemo(() => getNextWeek(getCurrentWeekKey()), []);

  // Don't make people swipe the entire recipe library. Build a stable,
  // deterministic random pool for the household/week so reopening the
  // dialog shows the same selection, while each new week gets a new mix.
  const swipePool = useMemo(() => {
    const candidates = recipes.filter(
      recipe => recipe.household_id === currentHousehold?.id
    );

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
      .slice(0, Math.min(20, candidates.length))
      .map(({ recipe }) => recipe);
  }, [recipes, currentHousehold?.id, weekKey]);

  const remainingRecipes = useMemo(
    () => swipePool.filter(recipe => !swipes[recipe.id]),
    [swipePool, swipes]
  );

  const loadSwipes = useCallback(async () => {
    if (!user || !currentHousehold) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("recipe_swipes")
      .select("recipe_id, user_id, decision")
      .eq("household_id", currentHousehold.id)
      .eq("week_key", weekKey);

    if (error) {
      console.error("Failed to load recipe swipes:", error);
      setDbAvailable(false);
      setIsLoading(false);
      return;
    }

    setDbAvailable(true);
    const own: Record<string, SwipeDecision> = {};
    const yesByRecipe = new Map<string, string[]>();

    (data || []).forEach(row => {
      if (row.user_id === user.id) own[row.recipe_id] = row.decision as SwipeDecision;
      if (row.decision === "yes") {
        const ids = yesByRecipe.get(row.recipe_id) || [];
        ids.push(row.user_id);
        yesByRecipe.set(row.recipe_id, ids);
      }
    });

    setSwipes(own);
    setMatches(
      Array.from(yesByRecipe.entries())
        .filter(([, ids]) => new Set(ids).size >= 2)
        .map(([recipeId, userIds]) => ({ recipeId, userIds: [...new Set(userIds)] }))
    );
    setIsLoading(false);
  }, [user, currentHousehold?.id, weekKey]);

  useEffect(() => { void loadSwipes(); }, [loadSwipes]);

  const swipe = useCallback(async (recipe: Recipe, decision: SwipeDecision) => {
    if (!user || !currentHousehold || isSaving) return false;

    setIsSaving(true);
    setSwipes(prev => ({ ...prev, [recipe.id]: decision }));

    const { error } = await supabase
      .from("recipe_swipes")
      .upsert(
        { household_id: currentHousehold.id, user_id: user.id, recipe_id: recipe.id, week_key: weekKey, decision },
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

    setDbAvailable(true);
    setIsSaving(false);
    await loadSwipes();
    return true;
  }, [user, currentHousehold?.id, weekKey, isSaving, loadSwipes]);

  const matchRecipes = useMemo(
    () => matches.map(match => recipes.find(recipe => recipe.id === match.recipeId))
      .filter((recipe): recipe is Recipe => Boolean(recipe)),
    [matches, recipes]
  );

  return {
    weekKey, remainingRecipes, matches, matchRecipes, swipes, swipePool,
    householdMemberCount: householdMembers.length,
    isLoading, isSaving, dbAvailable, swipe, reload: loadSwipes,
    allComplete: recipes.length > 0 && remainingRecipes.length === 0,
  };
}
