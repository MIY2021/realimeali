import { useState } from "react";
import { RecipeCategory } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateRecipeDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (recipeData: {
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    categories: RecipeCategory[];
    prepTime: number;
    cookTime: number;
    servings: number;
    image?: string;
  }) => void;
}

export function CreateRecipeDialog({ open, onClose, onCreate }: CreateRecipeDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [servings, setServings] = useState(1);
  const [image, setImage] = useState<string | undefined>(undefined);

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 1);
    setInstructions(newInstructions);
  };

  const handleSubmit = () => {
    const recipeData = {
      title,
      description,
      ingredients: ingredients.filter(Boolean),
      instructions: instructions.filter(Boolean),
      categories,
      prepTime,
      cookTime,
      servings,
      image,
    };
    onCreate(recipeData);
    onClose();
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Recipe</DialogTitle>
          <DialogDescription>Add a new recipe to your collection.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
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
          <div>
            <Label htmlFor="ingredients">Ingredients</Label>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-2 mt-1">
                <Input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => handleRemoveIngredient(index)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" className="mt-2" onClick={handleAddIngredient}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </div>
          <div>
            <Label htmlFor="instructions">Instructions</Label>
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-center space-x-2 mt-1">
                <Textarea
                  value={instruction}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => handleRemoveInstruction(index)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" className="mt-2" onClick={handleAddInstruction}>
              <Plus className="h-4 w-4 mr-2" />
              Add Instruction
            </Button>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categories" className="text-right">
              Categories
            </Label>
            <Select
              multiple
              value={categories}
              onValueChange={(value) => setCategories(value as RecipeCategory[])}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select categories" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prepTime" className="text-right">
              Prep Time (minutes)
            </Label>
            <Input
              type="number"
              id="prepTime"
              value={prepTime}
              onChange={(e) => setPrepTime(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cookTime" className="text-right">
              Cook Time (minutes)
            </Label>
            <Input
              type="number"
              id="cookTime"
              value={cookTime}
              onChange={(e) => setCookTime(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="servings" className="text-right">
              Servings
            </Label>
            <Input
              type="number"
              id="servings"
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image URL
            </Label>
            <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
