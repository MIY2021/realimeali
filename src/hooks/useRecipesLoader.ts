
import { useEffect, useRef } from "react";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";

export const useRecipesLoader = () => {
  const { user } = useAuth();
  const { currentHousehold, isLoadingHousehold } = useHousehold();
  const { isLoading } = useRecipes();
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    // Log when the recipes auto-loading happens (for debugging)
    if (!hasLoggedRef.current && user && currentHousehold && !isLoadingHousehold) {
      console.log("useRecipesLoader: Recipes will be auto-loaded by RecipesContext for household:", currentHousehold.id);
      hasLoggedRef.current = true;
    }
  }, [user?.id, currentHousehold?.id, isLoadingHousehold]);

  return { isLoading };
};
