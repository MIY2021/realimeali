
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
    
    // Only fetch if we haven't already fetched for this combination and we're not currently loading
    if (fetchedRef.current !== currentKey && !isLoading) {
      if (user && currentHousehold) {
        console.log("Auto-loading recipes for household:", currentHousehold.id);
        fetchRecipes(currentHousehold.id);
        fetchedRef.current = currentKey;
      } else if (user && !currentHousehold) {
        console.log("Auto-loading recipes for user without household");
        fetchRecipes(null);
        fetchedRef.current = currentKey;
      }
    }
  }, [user?.id, currentHousehold?.id, isLoading]); // Removed fetchRecipes from dependencies

  return { isLoading };
};
