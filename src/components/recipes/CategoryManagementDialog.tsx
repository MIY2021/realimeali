import { useState } from "react";
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
import { Trash2, Plus, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CategoryManagementDialog = ({ open, onOpenChange }: CategoryManagementDialogProps) => {
  const { recipeCategories, addRecipeCategory, updateRecipeCategory, deleteRecipeCategory } = useHouseholdShopping();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    await addRecipeCategory(newCategoryName.trim());
    setNewCategoryName("");
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    
    await updateRecipeCategory(editingCategory.id, editingCategory.name.trim());
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" category?`)) {
      await deleteRecipeCategory(id);
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

        <div className="space-y-4">
          {/* Add new category */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="new-category">Add New Category</Label>
              <Input
                id="new-category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
            </div>
            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="self-end">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Existing categories */}
          <div className="space-y-2">
            <Label>Existing Categories</Label>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {recipeCategories.map((category) => (
                <div key={category.id} className="flex items-center gap-2 p-2 border rounded">
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
                      <span className="flex-1">{category.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingCategory({ id: category.id, name: category.name })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
