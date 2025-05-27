import { Recipe, RecipeCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Bulb } from "lucide-react";

interface RecipeManualTabProps {
  isMobile: boolean;
  newRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
  setNewRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
  newCategory: string;
  setNewCategory: (category: string) => void;
  newIngredient: string;
  setNewIngredient: (ingredient: string) => void;
  newInstruction: string;
  setNewInstruction: (instruction: string) => void;
  imagePreview: string | null;
  isGeneratingImage: boolean;
  generationProgress: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateImage: () => void;
  onAddCategory: () => void;
  onRemoveCategory: (category: string) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onAddInstruction: () => void;
  onRemoveInstruction: (index: number) => void;
}

const PREDEFINED_CATEGORIES: RecipeCategory[] = [
  "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", "Super Tasty",
  "Pasta", "Tapas", "Winter", "BBQ", "Faffy", "Pricey!", "Not Yet Made",
  "Snacks", "Breakfast", "Lunch"
];

export function RecipeManualTab({
  isMobile,
  newRecipe,
  setNewRecipe,
  newCategory,
  setNewCategory,
  newIngredient,
  setNewIngredient,
  newInstruction,
  setNewInstruction,
  imagePreview,
  isGeneratingImage,
  generationProgress,
  onImageChange,
  onGenerateImage,
  onAddCategory,
  onRemoveCategory,
  onAddIngredient,
  onRemoveIngredient,
  onAddInstruction,
  onRemoveInstruction
}: RecipeManualTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-2">Recipe Title</label>
          <Input
            value={newRecipe.title}
            onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
            placeholder="Enter recipe title"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={newRecipe.description}
            onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
            placeholder="Brief description of the recipe"
            className="h-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Prep Time (minutes)</label>
          <Input
            type="number"
            value={newRecipe.prepTime}
            onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: parseInt(e.target.value) || 0 })}
            placeholder="15"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Cook Time (minutes)</label>
          <Input
            type="number"
            value={newRecipe.cookTime}
            onChange={(e) => setNewRecipe({ ...newRecipe, cookTime: parseInt(e.target.value) || 0 })}
            placeholder="30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Servings</label>
          <Input
            type="number"
            value={newRecipe.servings}
            onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) || 1 })}
            placeholder="4"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium mb-2">Categories</label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {newRecipe.categories.map((category) => (
              <Badge key={category} variant="secondary" className="flex items-center gap-1">
                {category}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onRemoveCategory(category)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 p-2 border rounded-md text-sm"
            >
              <option value="">Select a category</option>
              {PREDEFINED_CATEGORIES
                .filter(cat => !newRecipe.categories.includes(cat))
                .map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
            </select>
            <Button onClick={onAddCategory} size="sm" disabled={!newCategory}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className="block text-sm font-medium mb-2">Ingredients</label>
        <div className="space-y-2">
          {newRecipe.ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm flex-1">{ingredient}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveIngredient(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              placeholder="Add ingredient (e.g., 2 cups flour)"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && onAddIngredient()}
            />
            <Button onClick={onAddIngredient} size="sm" disabled={!newIngredient.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium mb-2">Instructions</label>
        <div className="space-y-2">
          {newRecipe.instructions.map((instruction, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-sm font-medium text-muted-foreground mt-1">{index + 1}.</span>
              <span className="text-sm flex-1">{instruction}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveInstruction(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Textarea
              value={newInstruction}
              onChange={(e) => setNewInstruction(e.target.value)}
              placeholder="Add instruction step"
              className="flex-1 h-16"
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onAddInstruction()}
            />
            <Button onClick={onAddInstruction} size="sm" disabled={!newInstruction.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Top Tip */}
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Bulb className="h-4 w-4 text-yellow-600" />
          Top Tip (Optional)
        </label>
        <Textarea
          value={newRecipe.topTip || ""}
          onChange={(e) => setNewRecipe({ ...newRecipe, topTip: e.target.value })}
          placeholder="Share a helpful cooking tip or secret for this recipe..."
          className="h-20"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Add a pro tip, cooking secret, or helpful advice to make this recipe even better!
        </p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Recipe Image</label>
        <div className="space-y-3">
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Recipe preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
              id="recipe-image-upload"
            />
            <label
              htmlFor="recipe-image-upload"
              className="flex-1 cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Upload Image
            </label>
            <Button
              onClick={onGenerateImage}
              disabled={isGeneratingImage || !newRecipe.title.trim()}
              variant="outline"
            >
              {isGeneratingImage ? "Generating..." : "Generate with AI"}
            </Button>
          </div>
          {isGeneratingImage && generationProgress && (
            <p className="text-sm text-muted-foreground">{generationProgress}</p>
          )}
        </div>
      </div>
    </div>
  );
}
