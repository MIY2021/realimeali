import { useState } from "react";
import { Recipe, RecipeCategory } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditRecipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  recipe: Recipe;
}

export function EditRecipeDialog({
  isOpen,
  onClose,
  onSave,
  onDelete,
  recipe,
}: EditRecipeDialogProps) {
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description);
  const [ingredients, setIngredients] = useState(recipe.ingredients.join("\n"));
  const [instructions, setInstructions] = useState(recipe.instructions.join("\n"));
  const [categories, setCategories] = useState<RecipeCategory[]>(recipe.categories);
  const [prepTime, setPrepTime] = useState(recipe.prepTime.toString());
  const [cookTime, setCookTime] = useState(recipe.cookTime.toString());
  const [servings, setServings] = useState(recipe.servings.toString());
  const [image, setImage] = useState(recipe.image || "");

  const handleSave = () => {
    const updatedRecipe: Recipe = {
      ...recipe,
      title,
      description,
      ingredients: ingredients.split("\n"),
      instructions: instructions.split("\n"),
      categories,
      prepTime: parseInt(prepTime),
      cookTime: parseInt(cookTime),
      servings: parseInt(servings),
      image,
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedRecipe);
    onClose();
  };

  const handleDelete = () => {
    onDelete(recipe.id);
    onClose();
  };

  const toggleCategory = (category: RecipeCategory) => {
    if (categories.includes(category)) {
      setCategories(categories.filter((c) => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  const allCategories: RecipeCategory[] = [
    "Bulk",
    "Easy",
    "Cheap",
    "Healthy",
    "Vegetarian",
    "Fish",
    "Super Tasty",
    "Pasta",
    "Tapas",
    "Winter",
    "BBQ",
    "Faffy",
    "Pricey!",
    "Not Yet Made",
    "Snacks",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ingredients" className="text-right">
              Ingredients
            </Label>
            <Textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="instructions" className="text-right">
              Instructions
            </Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prepTime" className="text-right">
              Prep Time
            </Label>
            <Input
              id="prepTime"
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cookTime" className="text-right">
              Cook Time
            </Label>
            <Input
              id="cookTime"
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              className="col-span-3"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="servings" className="text-right">
              Servings
            </Label>
            <Input
              id="servings"
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image URL
            </Label>
            <Input
              id="image"
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Categories</Label>
            <div className="col-span-3 flex flex-wrap gap-2">
              <ScrollArea className="h-24 w-full rounded-md border p-2">
                {allCategories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className={categories.includes(category) ? "bg-muted" : ""}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </ScrollArea>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            className="mr-2"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button type="button" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
