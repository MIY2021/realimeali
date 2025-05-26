
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { HouseholdShoppingService } from "@/services/householdShoppingService";
import { useHouseholdShoppingOperations } from "@/hooks/useHouseholdShoppingOperations";
import { HouseholdShoppingItem, HouseholdRecipeCategory } from "@/types/householdShopping";

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

const HouseholdShoppingContext = createContext<HouseholdShoppingContextType | undefined>(undefined);

export const HouseholdShoppingProvider = ({ children }: { children: ReactNode }) => {
  const [shoppingItems, setShoppingItems] = useState<HouseholdShoppingItem[]>([]);
  const [recipeCategories, setRecipeCategories] = useState<HouseholdRecipeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const operations = useHouseholdShoppingOperations();

  const fetchShoppingItems = async () => {
    if (!currentHousehold || !user) return;

    try {
      setIsLoading(true);
      const data = await HouseholdShoppingService.fetchShoppingItems(currentHousehold.id);
      setShoppingItems(data);
    } catch (error) {
      console.error('Error fetching shopping items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecipeCategories = async () => {
    if (!currentHousehold || !user) return;

    try {
      const data = await HouseholdShoppingService.fetchRecipeCategories(currentHousehold.id);
      setRecipeCategories(data);
    } catch (error) {
      console.error('Error fetching recipe categories:', error);
    }
  };

  const addShoppingItem = async (item: Omit<HouseholdShoppingItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'household_id'>) => {
    await operations.addShoppingItem(item, (data) => {
      setShoppingItems(prev => [data, ...prev]);
    });
  };

  const updateShoppingItem = async (id: string, updates: Partial<HouseholdShoppingItem>) => {
    await operations.updateShoppingItem(id, updates, (data) => {
      setShoppingItems(prev => prev.map(item => item.id === id ? data : item));
    });
  };

  const deleteShoppingItem = async (id: string) => {
    await operations.deleteShoppingItem(id, () => {
      setShoppingItems(prev => prev.filter(item => item.id !== id));
    });
  };

  const addRecipeCategory = async (name: string) => {
    await operations.addRecipeCategory(name, (data) => {
      setRecipeCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    });
  };

  const updateRecipeCategory = async (id: string, name: string) => {
    await operations.updateRecipeCategory(id, name, (data) => {
      setRecipeCategories(prev => prev.map(cat => cat.id === id ? data : cat).sort((a, b) => a.name.localeCompare(b.name)));
    });
  };

  const deleteRecipeCategory = async (id: string) => {
    await operations.deleteRecipeCategory(id, () => {
      setRecipeCategories(prev => prev.filter(cat => cat.id !== id));
    });
  };

  const seedDefaultCategories = async () => {
    await operations.seedDefaultCategories(() => {
      fetchRecipeCategories();
    });
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
      isLoading: isLoading || operations.isLoading,
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

export type { HouseholdShoppingItem, HouseholdRecipeCategory };
