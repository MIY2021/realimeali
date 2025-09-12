import { useMemo } from 'react';
import { useRecipes } from '@/contexts/RecipesContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useShoppingList } from '@/hooks/useShoppingList';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';

export const useUserStats = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { mealPlans, isLoading: mealPlansLoading } = useMealPlan();
  const { shoppingList, isLoading: shoppingListLoading } = useShoppingList(1);

  const stats = useMemo(() => {
    // Total recipes in household
    const totalRecipes = recipes.length;
    
    // Favorite recipes count
    const favoriteRecipes = recipes.filter(recipe => recipe.is_favorite).length;
    
    // Current week meals (week 1)
    const currentWeekMeals = mealPlans.filter(plan => 
      plan.week_number === 1 && plan.household_id === currentHousehold?.id
    ).length;
    
    // Shopping list items count
    const shoppingItemsCount = shoppingList?.length || 0;
    
    // Recent recipes (last 5)
    const recentRecipes = [...recipes]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    
    // Recent meal plans (last 5)
    const recentMealPlans = [...mealPlans]
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 5);

    return {
      totalRecipes,
      favoriteRecipes,
      currentWeekMeals,
      shoppingItemsCount,
      recentRecipes,
      recentMealPlans
    };
  }, [recipes, mealPlans, shoppingList, currentHousehold?.id]);

  const isLoading = recipesLoading || mealPlansLoading || shoppingListLoading;

  return {
    stats,
    isLoading,
    hasData: !!user && !!currentHousehold
  };
};