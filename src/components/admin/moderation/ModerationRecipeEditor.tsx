
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Loader, Wand2 } from "lucide-react";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import {
  MEAL_TYPE_OPTIONS,
  CUISINE_REGION_OPTIONS,
  DIET_LIFESTYLE_OPTIONS,
  COMPLEXITY_LEVEL_OPTIONS,
} from "@/utils/recipeClassification";

interface ModerationRecipeEditorProps {
  recipe: CommunityRecipe;
  onSave: (updates: Partial<CommunityRecipe>) => void;
  onGenerateAIDescription: (recipe: CommunityRecipe) => Promise<string | null>;
  isSaving: boolean;
  isGeneratingAIDescription: boolean;
}

export function ModerationRecipeEditor({
  recipe,
  onSave,
  onGenerateAIDescription,
  isSaving,
  isGeneratingAIDescription,
}: ModerationRecipeEditorProps) {
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description || "");
  const [category, setCategory] = useState(recipe.category || "");
  const [cuisine, setCuisine] = useState(recipe.cuisine || "");
  const [difficultyLevel, setDifficultyLevel] = useState(recipe.difficulty_level || "");
  const [selectedDietLifestyle, setSelectedDietLifestyle] = useState<string[]>([]);

  const handleSave = () => {
    const updates: Partial<CommunityRecipe> = {
      title,
      description,
      category,
      cuisine,
      difficulty_level: difficultyLevel,
    };
    onSave(updates);
  };

  const handleGenerateAIDescription = async () => {
    const aiDescription = await onGenerateAIDescription(recipe);
    if (aiDescription) {
      setDescription(aiDescription);
    }
  };

  const toggleDietLifestyle = (value: string) => {
    setSelectedDietLifestyle(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const CategoryButton = ({ 
    option, 
    isSelected, 
    onClick 
  }: { 
    option: { value: string; label: string; icon: string }; 
    isSelected: boolean; 
    onClick: () => void; 
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-all text-left relative ${
        isSelected
          ? 'border-green-500 bg-green-50 text-green-700'
          : 'border-gray-200 hover:border-gray-300 bg-white/50 hover:bg-white/70'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{option.icon}</span>
        <span className="text-sm">{option.label}</span>
      </div>
      {isSelected && (
        <div className="absolute top-1 right-1">
          <div className="h-5 w-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            ✓
          </div>
        </div>
      )}
    </button>
  );

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-white/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Edit Recipe Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Title */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Recipe Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter recipe title"
            className="w-full"
          />
        </div>

        {/* Description with AI Generation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Description</Label>
            <Button
              onClick={handleGenerateAIDescription}
              disabled={isGeneratingAIDescription}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {isGeneratingAIDescription ? (
                <>
                  <Loader className="h-3 w-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-3 w-3 mr-1" />
                  Generate AI Description
                </>
              )}
            </Button>
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter recipe description"
            rows={3}
            className="w-full"
          />
        </div>

        {/* Meal Type */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Meal Type</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {MEAL_TYPE_OPTIONS.map((option) => (
              <CategoryButton
                key={option.value}
                option={option}
                isSelected={category === option.value}
                onClick={() => setCategory(option.value)}
              />
            ))}
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Cuisine</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {CUISINE_REGION_OPTIONS.map((option) => (
              <CategoryButton
                key={option.value}
                option={option}
                isSelected={cuisine === option.value}
                onClick={() => setCuisine(option.value)}
              />
            ))}
          </div>
        </div>

        {/* Complexity Level */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Complexity Level</Label>
          <div className="flex flex-wrap gap-2">
            {COMPLEXITY_LEVEL_OPTIONS.map((option) => (
              <CategoryButton
                key={option.value}
                option={option}
                isSelected={difficultyLevel === option.value}
                onClick={() => setDifficultyLevel(option.value)}
              />
            ))}
          </div>
        </div>

        {/* Diet & Lifestyle */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Diet & Lifestyle (select multiple)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {DIET_LIFESTYLE_OPTIONS.map((option) => {
              const isSelected = selectedDietLifestyle.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleDietLifestyle(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                    isSelected
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white/50 hover:bg-white/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm">{option.label}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <div className="h-5 w-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="w-full"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
