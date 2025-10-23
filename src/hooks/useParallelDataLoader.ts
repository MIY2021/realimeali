import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { useRecipes } from '@/contexts/RecipesContext';
import { useMealPlan } from '@/contexts/MealPlanContext';

/**
 * Parallel data loader hook that coordinates fetching of all application data
 * in parallel once the household is loaded, eliminating the sequential waterfall.
 */
export const useParallelDataLoader = () => {
  const { user } = useAuth();
  const { currentHousehold, isLoadingHousehold } = useHousehold();
  const { fetchRecipes } = useRecipes();
  const { fetchMealPlans } = useMealPlan();
  
  const lastLoadedHouseholdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    // Wait for household to load
    if (isLoadingHousehold || !user || !currentHousehold) {
      return;
    }

    // Don't load if we've already loaded for this household
    if (lastLoadedHouseholdRef.current === currentHousehold.id) {
      return;
    }

    // Prevent duplicate parallel loads
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    lastLoadedHouseholdRef.current = currentHousehold.id;

    console.log('🚀 [ParallelLoader] Starting parallel data load for household:', currentHousehold.id);
    console.time('[Performance] Parallel data load');

    // Fetch recipes and meal plans in parallel
    Promise.all([
      fetchRecipes(currentHousehold.id),
      fetchMealPlans()
    ])
      .then(() => {
        console.timeEnd('[Performance] Parallel data load');
        console.log('✅ [ParallelLoader] Parallel data load complete');
      })
      .catch((error) => {
        console.error('❌ [ParallelLoader] Error during parallel data load:', error);
        console.timeEnd('[Performance] Parallel data load');
      })
      .finally(() => {
        isLoadingRef.current = false;
      });
  }, [user, currentHousehold?.id, isLoadingHousehold, fetchRecipes, fetchMealPlans]);
};
