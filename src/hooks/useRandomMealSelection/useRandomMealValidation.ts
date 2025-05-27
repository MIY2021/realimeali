
import { useToast } from "@/hooks/use-toast";

export const useRandomMealValidation = () => {
  const { toast } = useToast();

  const validateUserAndHousehold = (user: any, currentHousehold: any) => {
    console.log("Validating user and household:", { user: user?.id, household: currentHousehold?.id });
    
    if (!user) {
      console.log("No user found");
      toast({
        title: "Login Required",
        description: "You need to log in to generate meal plans.",
        variant: "destructive",
      });
      return false;
    }

    if (!currentHousehold) {
      console.log("No household found");
      toast({
        title: "No Household Selected", 
        description: "Please select or create a household to generate meal plans.",
        variant: "destructive",
      });
      return false;
    }

    console.log("User and household validation passed");
    return true;
  };

  const validateRecipes = (recipes: any[]) => {
    console.log("Validating recipes:", { count: recipes.length });
    
    if (!recipes || recipes.length === 0) {
      console.log("No recipes available");
      toast({
        title: "No Recipes Available",
        description: "Please add some recipes before generating a meal plan.",
        variant: "destructive",
      });
      return false;
    }

    console.log("Recipe validation passed");
    return true;
  };

  return {
    validateUserAndHousehold,
    validateRecipes,
  };
};
