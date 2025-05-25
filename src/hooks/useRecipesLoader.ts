
import { useEffect } from "react";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";

export const useRecipesLoader = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { fetchRecipes, isLoading } = useRecipes();

  useEffect(() => {
    if (user && currentHousehold) {
      console.log("Auto-loading recipes for household:", currentHousehold.id);
      fetchRecipes(currentHousehold.id);
    } else if (user && !currentHousehold) {
      console.log("Auto-loading recipes for user without household");
      fetchRecipes(null);
    }
  }, [user?.id, currentHousehold?.id, fetchRecipes]);

  return { isLoading };
};
