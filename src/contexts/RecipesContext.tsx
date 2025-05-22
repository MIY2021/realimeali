
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RecipesContextType {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  fetchRecipes: () => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
}

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export const RecipesProvider = ({ children }: { children: ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For now, let's load the recipes from the mock data
      // This would be replaced with a Supabase query once we have the recipes table set up
      const { data: recipesData } = await import("@/data/recipes");
      // We're using a timeout to simulate a network request
      setTimeout(() => {
        setRecipes(recipesData.mockRecipes);
        setIsLoading(false);
      }, 500);
      
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to fetch recipes. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to fetch recipes. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const getRecipeById = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <RecipesContext.Provider value={{ recipes, isLoading, error, fetchRecipes, getRecipeById }}>
      {children}
    </RecipesContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (context === undefined) {
    throw new Error("useRecipes must be used within a RecipesProvider");
  }
  return context;
};
