
import { useToast } from "@/hooks/use-toast";

export const useRandomMealValidation = () => {
  const { toast } = useToast();

  const validateUserAndHousehold = (user: any, currentHousehold: any) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to generate meals.",
        variant: "destructive",
      });
      return false;
    }

    if (!currentHousehold) {
      toast({
        title: "No Household Selected",
        description: "Please select or create a household to manage meal plans.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateRecipes = (recipes: any[]) => {
    console.log("Checking recipes availability...");
    console.log("Recipes array length:", recipes.length);
    console.log("Sample recipes:", recipes.slice(0, 3).map(r => ({ title: r.title, categories: r.categories })));

    if (recipes.length === 0) {
      toast({
        title: "No Recipes Available",
        description: "You need to create some recipes first before generating meals.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return {
    validateUserAndHousehold,
    validateRecipes,
  };
};
