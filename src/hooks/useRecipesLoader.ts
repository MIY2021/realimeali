
import { useEffect, useRef } from "react";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";

export const useRecipesLoader = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { fetchRecipes, isLoading } = useRecipes();
  const fetchedRef = useRef<string>("");

  useEffect(() => {
    // Create a unique key for the current user/household combination
    const currentKey = `${user?.id || 'no-user'}_${currentHousehold?.id || 'no-household'}`;
    
    console.log('useRecipesLoader: Effect triggered', {
      currentKey,
      previousKey: fetchedRef.current,
      user: user?.id,
      household: currentHousehold?.id,
      isLoading
    });
    
    // Only fetch if we haven't already fetched for this combination and we're not currently loading
    if (fetchedRef.current !== currentKey && !isLoading) {
      if (user && currentHousehold) {
        console.log("useRecipesLoader: Auto-loading recipes for household:", currentHousehold.id);
        fetchRecipes(currentHousehold.id);
        fetchedRef.current = currentKey;
      } else if (user && !currentHousehold) {
        console.log("useRecipesLoader: Auto-loading recipes for user without household");
        fetchRecipes(null);
        fetchedRef.current = currentKey;
      } else {
        console.log("useRecipesLoader: Not loading - user or household missing");
      }
    } else {
      console.log("useRecipesLoader: Skipping fetch - already fetched or loading");
    }
  }, [user?.id, currentHousehold?.id, isLoading, fetchRecipes]);

  return { isLoading };
};
