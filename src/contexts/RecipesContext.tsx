
import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Recipe } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface RecipesContextType {
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Recipe) => Promise<void>;
  removeRecipe: (id: string) => void;
  getRecipeById: (id: string) => Recipe | undefined;
  getRecipeBySlug: (slug: string) => Recipe | undefined;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  fetchRecipes: (householdId: string | null) => Promise<void>;
  createRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, householdId: string) => Promise<Recipe | null>;
  deleteRecipe: (id: string) => Promise<boolean>;
}

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipesProvider');
  }
  return context;
};

interface RecipesProviderProps {
  children: ReactNode;
}

// Mock recipes for frontend testing
const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Spaghetti Carbonara',
    description: 'A classic Italian pasta dish with eggs, cheese, and pancetta.',
    ingredients: ['400g spaghetti', '200g pancetta', '4 large eggs', '100g Parmesan cheese', 'Black pepper', 'Salt'],
    instructions: ['Boil pasta', 'Cook pancetta', 'Mix eggs and cheese', 'Combine all ingredients'],
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user1',
    householdId: 'household1',
    mealType: 'dinner',
    cuisine: 'italian',
    topTip: 'Make sure to mix the eggs off the heat to prevent scrambling!'
  },
  {
    id: '2',
    title: 'Chicken Tikka Masala',
    description: 'Creamy and flavorful Indian curry with tender chicken pieces.',
    ingredients: ['500g chicken', '400ml coconut milk', '2 tbsp tikka masala paste', '1 onion', 'Garlic', 'Ginger'],
    instructions: ['Marinate chicken', 'Cook onions', 'Add spices', 'Simmer with coconut milk'],
    prepTime: 30,
    cookTime: 25,
    servings: 4,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user1',
    householdId: 'household1',
    mealType: 'dinner',
    cuisine: 'indian'
  }
];

export const RecipesProvider = ({ children }: RecipesProviderProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => [recipe, ...prev]);
  }, []);

  const updateRecipe = useCallback(async (id: string, updatedRecipe: Recipe) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === id ? updatedRecipe : recipe
    ));
    toast({
      title: "Recipe Updated",
      description: "Recipe has been updated successfully.",
    });
  }, [toast]);

  const removeRecipe = useCallback((id: string) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
  }, []);

  const getRecipeById = useCallback((id: string) => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  const createSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  const getRecipeBySlug = useCallback((slug: string) => {
    return recipes.find(recipe => createSlug(recipe.title) === slug);
  }, [recipes, createSlug]);

  const fetchRecipes = useCallback(async (householdId: string | null) => {
    setIsLoading(true);
    // Mock fetch - just use existing recipes
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const createRecipe = useCallback(async (
    recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>, 
    householdId: string
  ) => {
    const newRecipe: Recipe = {
      ...recipeData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
    };
    
    addRecipe(newRecipe);
    toast({
      title: "Recipe Created",
      description: `${newRecipe.title} has been added to your recipes.`,
    });
    
    return newRecipe;
  }, [addRecipe, toast]);

  const deleteRecipe = useCallback(async (id: string) => {
    removeRecipe(id);
    toast({
      title: "Recipe Deleted",
      description: "Recipe has been removed from your collection.",
    });
    return true;
  }, [removeRecipe, toast]);

  const value = useMemo(() => ({
    recipes,
    setRecipes,
    addRecipe,
    updateRecipe,
    removeRecipe,
    getRecipeById,
    getRecipeBySlug,
    isLoading,
    setIsLoading,
    fetchRecipes,
    createRecipe,
    deleteRecipe,
  }), [recipes, addRecipe, updateRecipe, removeRecipe, getRecipeById, getRecipeBySlug, isLoading, fetchRecipes, createRecipe, deleteRecipe]);

  return (
    <RecipesContext.Provider value={value}>
      {children}
    </RecipesContext.Provider>
  );
};
