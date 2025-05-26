
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { HouseholdShoppingService } from "@/services/householdShoppingService";
import { HouseholdShoppingItem, HouseholdRecipeCategory } from "@/types/householdShopping";

export const useHouseholdShoppingOperations = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const [isLoading, setIsLoading] = useState(false);

  const addShoppingItem = async (
    item: Omit<HouseholdShoppingItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'household_id'>,
    onSuccess: (item: HouseholdShoppingItem) => void
  ) => {
    if (!currentHousehold || !user) return;

    try {
      const data = await HouseholdShoppingService.addShoppingItem(item, currentHousehold.id, user.id);
      onSuccess(data);
    } catch (error) {
      console.error('Error adding shopping item:', error);
      toast({
        title: "Error",
        description: "Failed to add shopping item",
        variant: "destructive",
      });
    }
  };

  const updateShoppingItem = async (
    id: string,
    updates: Partial<HouseholdShoppingItem>,
    onSuccess: (item: HouseholdShoppingItem) => void
  ) => {
    try {
      const data = await HouseholdShoppingService.updateShoppingItem(id, updates);
      onSuccess(data);
    } catch (error) {
      console.error('Error updating shopping item:', error);
      toast({
        title: "Error",
        description: "Failed to update shopping item",
        variant: "destructive",
      });
    }
  };

  const deleteShoppingItem = async (id: string, onSuccess: () => void) => {
    try {
      await HouseholdShoppingService.deleteShoppingItem(id);
      onSuccess();
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      toast({
        title: "Error",
        description: "Failed to delete shopping item",
        variant: "destructive",
      });
    }
  };

  const addRecipeCategory = async (name: string, onSuccess: (category: HouseholdRecipeCategory) => void) => {
    if (!currentHousehold || !user) return;

    try {
      const data = await HouseholdShoppingService.addRecipeCategory(name, currentHousehold.id, user.id);
      onSuccess(data);
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

  const updateRecipeCategory = async (id: string, name: string, onSuccess: (category: HouseholdRecipeCategory) => void) => {
    try {
      const data = await HouseholdShoppingService.updateRecipeCategory(id, name);
      onSuccess(data);
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

  const deleteRecipeCategory = async (id: string, onSuccess: () => void) => {
    try {
      await HouseholdShoppingService.deleteRecipeCategory(id);
      onSuccess();
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

  const seedDefaultCategories = async (onSuccess: () => void) => {
    if (!currentHousehold || !user) return;

    try {
      setIsLoading(true);
      const wasSeeded = await HouseholdShoppingService.seedDefaultCategories(currentHousehold.id, user.id);
      
      if (wasSeeded) {
        onSuccess();
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    addRecipeCategory,
    updateRecipeCategory,
    deleteRecipeCategory,
    seedDefaultCategories
  };
};
