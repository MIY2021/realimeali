import { useMemo } from 'react';
import { useRecipes } from '@/contexts/RecipesContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useShoppingList } from '@/hooks/useShoppingList';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { supabase } from '@/integrations/supabase/client';

export const useUserStats = () => {
  const { user } = useAuth();
  const { currentHousehold, householdMembers } = useHousehold();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { mealPlans, isLoading: mealPlansLoading } = useMealPlan();
  const { shoppingList, isLoading: shoppingListLoading } = useShoppingList("1");

  const stats = useMemo(() => {
    // Total recipes in household
    const totalRecipes = recipes.length;
    
    // Favorite recipes count
    const favoriteRecipes = recipes.filter(recipe => recipe.is_favorite).length;
    
    // Recipes to cook (recipes not marked as cooked)
    const recipesToCook = recipes.filter(recipe => !recipe.has_cooked).length;
    
    // Shopping list items count
    const shoppingItemsCount = shoppingList?.length || 0;
    
    // Recent recipes (last 5) with creator info
    const recentRecipes = [...recipes]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(recipe => {
        const creator = householdMembers.find(member => member.user_id === recipe.created_by);
        return {
          ...recipe,
          creatorName: creator?.profile?.full_name || 'Unknown user'
        };
      });
    
    // Recent meal plans (last 10) with creator info
    const recentMealPlans = [...mealPlans]
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 10)
      .map(plan => {
        const creator = householdMembers.find(member => member.user_id === plan.created_by);
        return {
          ...plan,
          creatorName: creator?.profile?.full_name || 'Unknown user'
        };
      });

    return {
      totalRecipes,
      favoriteRecipes,
      recipesToCook,
      shoppingItemsCount,
      recentRecipes,
      recentMealPlans
    };
  }, [recipes, mealPlans, shoppingList, currentHousehold?.id, householdMembers]);

  const isLoading = recipesLoading || mealPlansLoading || shoppingListLoading;

  return {
    stats,
    isLoading,
    hasData: !!user && !!currentHousehold
  };
};