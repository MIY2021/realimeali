
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Sparkles } from "lucide-react";
import { EnhancedImageUpload } from "../EnhancedImageUpload";
import { SimpleCategorySelector } from "../SimpleCategorySelector";
import { Recipe } from "@/types";

interface RecipeManualTabProps {
  isMobile: boolean;
  newRecipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
  setNewRecipe: (recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void;
  newCategory: string;
  setNewCategory: (category: string) => void;
  newIngredient: string;
  setNewIngredient: (ingredient: string) => void;
  newInstruction: string;
  setNewInstruction: (instruction: string) => void;
  imagePreview: string | null;
  isGeneratingImage: boolean;
  generationProgress: string;
  onImageChange: (file: File) => void;
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-base font-medium">Recipe Title</Label>
            <Input
              id="title"
              value={newRecipe.title}
              onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
              placeholder="Enter recipe title"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-medium">Description</Label>
            <Textarea
              id="description"
              value={newRecipe.description}
              onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
              placeholder="Brief description of the recipe"
              className="mt-1 min-h-20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="prep-time" className="text-base font-medium">Prep Time (minutes)</Label>
              <Input
                id="prep-time"
                type="number"
                value={newRecipe.prep_time || ''}
                onChange={(e) => setNewRecipe({ ...newRecipe, prep_time: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cook-time" className="text-base font-medium">Cook Time (minutes)</Label>
              <Input
                id="cook-time"
                type="number"
                value={newRecipe.cook_time || ''}
                onChange={(e) => setNewRecipe({ ...newRecipe, cook_time: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="servings" className="text-base font-medium">Servings</Label>
              <Input
                id="servings"
                type="number"
                value={newRecipe.servings || ''}
                onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) || 1 })}
                placeholder="1"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Recipe Image</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedImageUpload
            imagePreview={imagePreview}
            isGenerating={isGeneratingImage}
            generationProgress={generationProgress}
            onImageChange={handleImageChange}
            onGenerateImage={onGenerateImage}
            recipeTitle={newRecipe.title}
          />
        </CardContent>
      </Card>

      {/* Recipe Classification */}
      <SimpleCategorySelector
        recipe={newRecipe}
        onRecipeChange={setNewRecipe}
      />

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add a category (e.g., Quick Meals, Comfort Food)"
              onKeyPress={(e) => e.key === 'Enter' && onAddCategory()}
            />
            <Button onClick={onAddCategory} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {newRecipe.diet_lifestyle && newRecipe.diet_lifestyle.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {newRecipe.diet_lifestyle.map((category, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <button
                    onClick={() => onRemoveCategory(category)}
                    className="hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              placeholder="Add an ingredient (e.g., 2 cups flour)"
              onKeyPress={(e) => e.key === 'Enter' && onAddIngredient()}
            />
            <Button onClick={onAddIngredient} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {newRecipe.ingredients && newRecipe.ingredients.length > 0 && (
            <div className="space-y-2">
              {newRecipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="flex-1">{ingredient}</span>
                  <button
                    onClick={() => onRemoveIngredient(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              value={newInstruction}
              onChange={(e) => setNewInstruction(e.target.value)}
              placeholder="Add an instruction step"
              className="min-h-20"
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onAddInstruction()}
            />
            <Button onClick={onAddInstruction} size="sm" className="self-start mt-1">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {newRecipe.instructions && newRecipe.instructions.length > 0 && (
            <div className="space-y-2">
              {newRecipe.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                  <div className="bg-terracotta text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="flex-1">{instruction}</span>
                  <button
                    onClick={() => onRemoveInstruction(index)}
                    className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
