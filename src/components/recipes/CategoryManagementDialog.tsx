import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHouseholdShopping } from "@/contexts/HouseholdShoppingContext";
import { Trash2, Plus, Pencil, Loader, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CategoryManagementDialog = ({ open, onOpenChange }: CategoryManagementDialogProps) => {
  const { recipeCategories, addRecipeCategory, updateRecipeCategory, deleteRecipeCategory, fetchRecipeCategories, seedDefaultCategories, isLoading } = useHouseholdShopping();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isSeedingCategories, setIsSeedingCategories] = useState(false);
  const { toast } = useToast();

  // Fetch categories when dialog opens
  useEffect(() => {
    if (open) {
      console.log("Dialog opened, fetching categories...");
      fetchRecipeCategories();
    }
  }, [open, fetchRecipeCategories]);

  // Log categories for debugging
  useEffect(() => {
    console.log("Recipe categories updated:", recipeCategories);
  }, [recipeCategories]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }
    
    // Check for duplicate names
    const isDuplicate = recipeCategories.some(
      category => category.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      toast({
        title: "Duplicate Category",
        description: "A category with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingCategory(true);
      console.log("Adding new category:", newCategoryName.trim());
      await addRecipeCategory(newCategoryName.trim());
      setNewCategoryName("");
      toast({
        title: "Success",
        description: "Category added successfully!",
      });
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleSeedCategories = async () => {
    try {
      setIsSeedingCategories(true);
      await seedDefaultCategories();
    } catch (error) {
      console.error("Error seeding categories:", error);
    } finally {
      setIsSeedingCategories(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }
    
    // Check for duplicate names (excluding current category)
    const isDuplicate = recipeCategories.some(
      category => category.id !== editingCategory.id && 
      category.name.toLowerCase() === editingCategory.name.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      toast({
        title: "Duplicate Category",
        description: "A category with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Updating category:", editingCategory);
      await updateRecipeCategory(editingCategory.id, editingCategory.name.trim());
      setEditingCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" category? This action cannot be undone.`)) {
      try {
        console.log("Deleting category:", { id, name });
        await deleteRecipeCategory(id);
      } catch (error) {
        console.error("Error deleting category:", error);
        toast({
          title: "Error",
          description: "Failed to delete category. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Recipe Categories</DialogTitle>
          <DialogDescription>
            Add, edit, or delete recipe categories for your household.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add new category */}
          <div className="space-y-2">
            <Label htmlFor="new-category" className="text-sm font-medium">
              Add New Category
            </Label>
            <div className="flex gap-2">
              <Input
                id="new-category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                onKeyPress={(e) => e.key === 'Enter' && !isAddingCategory && handleAddCategory()}
                disabled={isAddingCategory}
                className="flex-1"
              />
              <Button 
                onClick={handleAddCategory} 
                disabled={!newCategoryName.trim() || isAddingCategory}
                className="shrink-0"
              >
                {isAddingCategory ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Existing categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Existing Categories</Label>
              {recipeCategories.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSeedCategories}
                  disabled={isSeedingCategories}
                  className="flex items-center gap-1"
                >
                  {isSeedingCategories ? (
                    <Loader className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Add Common Categories
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading categories...</span>
              </div>
            ) : recipeCategories.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <div className="text-muted-foreground">
                  <p className="text-sm mb-2">No categories created yet</p>
                  <p className="text-xs">Add your first category above or use common categories!</p>
                </div>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {recipeCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2 p-3 border rounded-lg bg-card">
                    {editingCategory?.id === category.id ? (
                      <>
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          className="flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory()}
                          autoFocus
                        />
                        <Button size="sm" onClick={handleUpdateCategory}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium">{category.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCategory({ id: category.id, name: category.name })}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
