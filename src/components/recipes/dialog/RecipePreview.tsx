
import { Recipe, RecipeCategory } from "@/types";

interface RecipePreviewProps {
  parsedRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
  onUpdateRecipe: (field: string, value: any) => void;
}

export function RecipePreview({ parsedRecipe, onUpdateRecipe }: RecipePreviewProps) {
  const availableCategories: RecipeCategory[] = [
    "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish",
    "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ",
    "Faffy", "Pricey", "Not-Yet-Made", "Snacks", "Breakfast"
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={parsedRecipe.title}
            onChange={(e) => onUpdateRecipe('title', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={parsedRecipe.description}
            onChange={(e) => onUpdateRecipe('description', e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Prep (min)</label>
            <input
              type="number"
              value={parsedRecipe.prepTime}
              onChange={(e) => onUpdateRecipe('prepTime', Number(e.target.value))}
              className="w-full p-2 border rounded"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cook (min)</label>
            <input
              type="number"
              value={parsedRecipe.cookTime}
              onChange={(e) => onUpdateRecipe('cookTime', Number(e.target.value))}
              className="w-full p-2 border rounded"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Servings</label>
            <input
              type="number"
              value={parsedRecipe.servings}
              onChange={(e) => onUpdateRecipe('servings', Number(e.target.value))}
              className="w-full p-2 border rounded"
              min={1}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categories</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {parsedRecipe.categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center gap-1 bg-sage/20 text-sage rounded-full px-2 py-1 text-xs cursor-pointer hover:bg-red-100"
                onClick={() => onUpdateRecipe('categories', parsedRecipe.categories.filter(c => c !== category))}
              >
                {category} ×
              </span>
            ))}
          </div>
          <select
            onChange={(e) => {
              const category = e.target.value as RecipeCategory;
              if (category && !parsedRecipe.categories.includes(category)) {
                onUpdateRecipe('categories', [...parsedRecipe.categories, category]);
              }
            }}
            value=""
            className="w-full p-2 border rounded"
          >
            <option value="">Add category...</option>
            {availableCategories.filter(cat => !parsedRecipe.categories.includes(cat)).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ingredients ({parsedRecipe.ingredients.length})</label>
          <div className="space-y-1 max-h-32 overflow-y-auto border rounded p-2">
            {parsedRecipe.ingredients.map((ingredient, index) => (
              <div key={index} className="text-sm">• {ingredient}</div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Instructions ({parsedRecipe.instructions.length} steps)</label>
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
            {parsedRecipe.instructions.map((instruction, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-sage">{index + 1}.</span> {instruction}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
