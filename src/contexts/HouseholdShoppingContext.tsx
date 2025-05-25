
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";

export interface HouseholdShoppingItem {
  id: string;
  household_id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category: string;
  is_checked: boolean;
  is_custom: boolean;
  recipe_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdRecipeCategory {
  id: string;
  household_id: string;
  name: string;
  created_by: string;
  created_at: string;
}

interface HouseholdShoppingContextType {
  shoppingItems: HouseholdShoppingItem[];
  recipeCategories: HouseholdRecipeCategory[];
  isLoading: boolean;
  fetchShoppingItems: () => Promise<void>;
  fetchRecipeCategories: () => Promise<void>;
  addShoppingItem: (item: Omit<HouseholdShoppingItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'household_id'>) => Promise<void>;
  updateShoppingItem: (id: string, updates: Partial<HouseholdShoppingItem>) => Promise<void>;
  deleteShoppingItem: (id: string) => Promise<void>;
  addRecipeCategory: (name: string) => Promise<void>;
  updateRecipeCategory: (id: string, name: string) => Promise<void>;
  deleteRecipeCategory: (id: string) => Promise<void>;
  seedDefaultCategories: () => Promise<void>;
}

// Default recipe categories that should be available for all households
const DEFAULT_RECIPE_CATEGORIES = [
  "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", 
  "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ", 
  "Faffy", "Pricey!", "Not Yet Made", "Snacks", "Breakfast"
];

const HouseholdShoppingContext = createContext<HouseholdShoppingContextType | undefined>(undefined);

export const HouseholdShoppingProvider = ({ children }: { children: ReactNode }) => {
  const [shoppingItems, setShoppingItems] = useState<HouseholdShoppingItem[]>([]);
  const [recipeCategories, setRecipeCategories] = useState<HouseholdRecipeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const fetchShoppingItems = async () => {
    if (!currentHousehold || !user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .select('*')
        .eq('household_id', currentHousehold.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShoppingItems(data || []);
    } catch (error) {
      console.error('Error fetching shopping items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shopping items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecipeCategories = async () => {
    if (!currentHousehold || !user) return;

    try {
      const { data, error } = await supabase
        .from('household_recipe_categories')
        .select('*')
        .eq('household_id', currentHousehold.id)
        .order('name');

      if (error) throw error;
      setRecipeCategories(data || []);
    } catch (error) {
      console.error('Error fetching recipe categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recipe categories",
        variant: "destructive",
      });
    }
  };

  const seedDefaultCategories = async () => {
    if (!currentHousehold || !user) return;

    try {
      // Check if household already has categories
      const { data: existingCategories, error: checkError } = await supabase
        .from('household_recipe_categories')
        .select('id')
        .eq('household_id', currentHousehold.id);

      if (checkError) throw checkError;

      // Only seed if no categories exist
      if (existingCategories && existingCategories.length === 0) {
        console.log('Seeding default categories for household:', currentHousehold.id);
        
        const categoriesToInsert = DEFAULT_RECIPE_CATEGORIES.map(name => ({
          household_id: currentHousehold.id,
          name,
          created_by: user.id
        }));

        const { error } = await supabase
          .from('household_recipe_categories')
          .insert(categoriesToInsert);

        if (error) throw error;

        // Refresh categories after seeding
        await fetchRecipeCategories();
        
        toast({
          title: "Categories Added",
          description: "Default recipe categories have been added to your household",
        });
      }
    } catch (error) {
      console.error('Error seeding default categories:', error);
      toast({
        title: "Error",
        description: "Failed to add default categories",
        variant: "destructive",
      });
    }
  };

  const addShoppingItem = async (item: Omit<HouseholdShoppingItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'household_id'>) => {
    if (!currentHousehold || !user) return;

    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .insert([{
          ...item,
          household_id: currentHousehold.id,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      setShoppingItems(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding shopping item:', error);
      throw error;
    }
  };

  const updateShoppingItem = async (id: string, updates: Partial<HouseholdShoppingItem>) => {
    try {
      const { data, error } = await supabase
        .from('household_shopping_lists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setShoppingItems(prev => prev.map(item => item.id === id ? data : item));
    } catch (error) {
      console.error('Error updating shopping item:', error);
      throw error;
    }
  };

  const deleteShoppingItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('household_shopping_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setShoppingItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      throw error;
    }
  };

  const addRecipeCategory = async (name: string) => {
    if (!currentHousehold || !user) return;

    try {
      const { data, error } = await supabase
        .from('household_recipe_categories')
        .insert([{
          household_id: currentHousehold.id,
          name: name,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      setRecipeCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Category Added",
        description: `${name} category has been added`,
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const updateRecipeCategory = async (id: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('household_recipe_categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRecipeCategories(prev => prev.map(cat => cat.id === id ? data : cat).sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Category Updated",
        description: `Category has been updated to ${name}`,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const deleteRecipeCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('household_recipe_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecipeCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: "Category Deleted",
        description: "Category has been deleted",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (currentHousehold) {
      fetchShoppingItems();
      fetchRecipeCategories();
    }
  }, [currentHousehold]);

  return (
    <HouseholdShoppingContext.Provider value={{
      shoppingItems,
      recipeCategories,
      isLoading,
      fetchShoppingItems,
      fetchRecipeCategories,
      addShoppingItem,
      updateShoppingItem,
      deleteShoppingItem,
      addRecipeCategory,
      updateRecipeCategory,
      deleteRecipeCategory,
      seedDefaultCategories
    }}>
      {children}
    </HouseholdShoppingContext.Provider>
  );
};

export const useHouseholdShopping = () => {
  const context = useContext(HouseholdShoppingContext);
  if (context === undefined) {
    throw new Error("useHouseholdShopping must be used within a HouseholdShoppingProvider");
  }
  return context;
};
