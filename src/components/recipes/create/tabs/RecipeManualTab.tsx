import { Recipe, RecipeCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, X, Camera, Loader2 } from "lucide-react";

const AVAILABLE_CATEGORIES: RecipeCategory[] = [
  "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish",
  "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ",
  "Faffy", "Pricey!", "Not Yet Made", "Snacks", "Breakfast", "Lunch"
];

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
  generationProgress?: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateImage: () => void;
  onAddCategory: () => void;
  onRemoveCategory: (category: string) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onAddInstruction: () => void;
  onRemoveInstruction: (index: number) => void;
}

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
  onRemoveInstruction,
}: RecipeManualTabProps) {
  return (
    <div className="space-y-6">
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Recipe Title</label>
            <input
              type="text"
              value={newRecipe.title}
              onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
              className="w-full p-3 border rounded-lg"
              placeholder="What's this delicious dish called?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={newRecipe.description}
              onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="Tell us about this recipe..."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Prep (min)</label>
              <input
                type="number"
                value={newRecipe.prepTime}
                onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: Number(e.target.value) })}
                className="w-full p-3 border rounded-lg"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cook (min)</label>
              <input
                type="number"
                value={newRecipe.cookTime}
                onChange={(e) => setNewRecipe({ ...newRecipe, cookTime: Number(e.target.value) })}
                className="w-full p-3 border rounded-lg"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Serves</label>
              <input
                type="number"
                value={newRecipe.servings}
                onChange={(e) => setNewRecipe({ ...newRecipe, servings: Number(e.target.value) })}
                className="w-full p-3 border rounded-lg"
                min={1}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Recipe Photo</label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="w-full p-3 border rounded-lg"
                disabled={isGeneratingImage}
              />
              <Button 
                type="button"
                variant="outline" 
                onClick={onGenerateImage}
                disabled={isGeneratingImage || !newRecipe.title.trim()}
                className="w-full"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Generate AI Photo
                  </>
                )}
              </Button>
              
              {/* Progress indicator */}
              {isGeneratingImage && (
                <div className="space-y-2">
                  <Progress value={undefined} className="w-full" />
                  {generationProgress && (
                    <p className="text-sm text-muted-foreground text-center">
                      {generationProgress}
                    </p>
                  )}
                </div>
              )}
              
              {/* Image preview or loading skeleton */}
              {isGeneratingImage && !imagePreview ? (
                <Skeleton className="w-full h-48 rounded-lg" />
              ) : imagePreview ? (
                <img src={imagePreview} alt="Recipe preview" className="w-full h-48 object-cover rounded-lg border" />
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categories</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {newRecipe.categories.map((category) => (
                <div
                  key={category}
                  className="inline-flex items-center gap-1 bg-sage/20 text-sage rounded-full px-3 py-1"
                >
                  <span className="text-sm">{category}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveCategory(category)}
                    className="text-sage hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 p-3 border rounded-lg"
              >
                <option value="">Choose a category</option>
                {AVAILABLE_CATEGORIES.filter(
                  (cat) => !newRecipe.categories.includes(cat)
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Button onClick={onAddCategory} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Ingredients</label>
            <div className="space-y-3">
              <div className="max-h-64 overflow-y-auto space-y-2">
                {newRecipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm flex-1">{ingredient}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveIngredient(index)}
                      className="text-red-500 h-8 w-8 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Add an ingredient..."
                  className="flex-1 p-3 border rounded-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onAddIngredient();
                    }
                  }}
                />
                <Button onClick={onAddIngredient} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cooking Steps</label>
            <div className="space-y-3">
              <div className="max-h-64 overflow-y-auto space-y-2">
                {newRecipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-white text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1 text-sm">{instruction}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveInstruction(index)}
                      className="text-red-500 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder="Add a cooking step..."
                  className="flex-1 p-3 border rounded-lg"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      onAddInstruction();
                    }
                  }}
                />
                <Button onClick={onAddInstruction} size="sm" className="self-start">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Press Ctrl+Enter to add step
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
