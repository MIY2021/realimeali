import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, UtensilsCrossed, Sparkles, Clock, Star } from "lucide-react";
import { useAiRecipeGeneration } from "@/hooks/useAiRecipeGeneration";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface QuickRecipeIdea {
  title: string;
  description: string;
}

interface FullRecipeIdea {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  meal_type: string;
  cuisine_region?: string;
  // complexity_level removed
  diet_lifestyle: string[];
  image?: string;
}

interface RecipeWhatCanIMakeTabProps {
  onSelectRecipe: (recipe: FullRecipeIdea) => void;
}

export function RecipeWhatCanIMakeTab({ onSelectRecipe }: RecipeWhatCanIMakeTabProps) {
  const [ingredients, setIngredients] = useState("");
  const [mealType, setMealType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingFullRecipe, setIsGeneratingFullRecipe] = useState(false);
  const [quickIdeas, setQuickIdeas] = useState<QuickRecipeIdea[]>([]);
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState<number | null>(null);

  const { generateRecipe } = useAiRecipeGeneration();

  const generateQuickIdeas = async () => {
    if (!ingredients.trim() || !mealType || !difficulty) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsGeneratingIdeas(true);
    setQuickIdeas([]);

    try {
      const prompt = `Generate 3 exciting recipe ideas for ${mealType.toLowerCase()} with ${difficulty.toLowerCase()} difficulty using these ingredients: ${ingredients}. 

Create recipe book-worthy titles that sound delicious and enticing. For each recipe, provide only:
1. An exciting, mouth-watering title (like you'd see in a premium cookbook)
2. A one-sentence description (max 20 words) that makes people want to cook it

Format as JSON: [{"title": "Recipe Name", "description": "Short description"}, ...]

Make them distinct in cooking style, cuisine, or approach. Focus on making the titles irresistible and cookbook-quality.`;

      const { data, error } = await supabase.functions.invoke('parse-recipe-ai', {
        body: {
          generateRequest: prompt,
          quickIdeasOnly: true
        }
      });

      if (error) throw error;

      if (data?.quickIdeas) {
        setQuickIdeas(data.quickIdeas);
      } else {
        // Fallback: generate quick ideas manually
        const fallbackIdeas = [
          { title: `${difficulty} ${mealType} with ${ingredients.split(',')[0]}`, description: `A delicious ${mealType.toLowerCase()} using your available ingredients.` },
          { title: `Quick ${ingredients.split(',')[0]} ${mealType}`, description: `Simple and tasty ${mealType.toLowerCase()} ready in minutes.` },
          { title: `Creative ${mealType} Bowl`, description: `Mix and match your ingredients for a satisfying meal.` }
        ];
        setQuickIdeas(fallbackIdeas);
      }

    } catch (error) {
      console.error('Error generating quick ideas:', error);
      toast.error("Failed to generate recipe ideas. Please try again.");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleSelectIdea = async (ideaIndex: number) => {
    const selectedIdea = quickIdeas[ideaIndex];
    setSelectedIdeaIndex(ideaIndex);
    setIsGeneratingFullRecipe(true);

    try {
      const fullPrompt = `Create a complete recipe for "${selectedIdea.title}". 
Description: ${selectedIdea.description}
Available ingredients: ${ingredients}
Meal type: ${mealType}
Difficulty: ${difficulty}

Generate a full recipe with ingredients list, step-by-step instructions, cooking times, and servings.`;

      const result = await generateRecipe({
        prompt: fullPrompt,
        stylePreferences: [difficulty, mealType]
      });

      if (result) {
        const fullRecipe: FullRecipeIdea = {
          ...result,
          meal_type: mealType,
          // complexity_level removed
        };
        
        toast.success(`Generated full recipe for "${selectedIdea.title}"!`);
        onSelectRecipe(fullRecipe);
      } else {
        throw new Error('Failed to generate full recipe');
      }

    } catch (error) {
      console.error('Error generating full recipe:', error);
      toast.error("Failed to generate full recipe. Please try again.");
    } finally {
      setIsGeneratingFullRecipe(false);
      setSelectedIdeaIndex(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[12px] border border-[#E3E3E3] shadow-sm p-6 sm:p-8 space-y-6">
        {quickIdeas.length === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="ingredients" className="text-base font-medium text-[#1A1A1A] block text-center">What ingredients do you have?</Label>
              <Textarea
                id="ingredients"
                placeholder="e.g. chicken, courgette, rice, garlic, onion"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="min-h-[80px] p-4 border border-[#E3E3E3] rounded-[12px] resize-none text-sm leading-relaxed focus:border-sage focus:ring-sage placeholder:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-medium text-[#1A1A1A] block text-center">What are you cooking?</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger className="rounded-[12px] border-[#E3E3E3] focus:border-sage">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Breakfast">🌅 Breakfast</SelectItem>
                    <SelectItem value="Lunch">☀️ Lunch</SelectItem>
                    <SelectItem value="Dinner">🌙 Dinner</SelectItem>
                    <SelectItem value="Snack">🍿 Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium text-[#1A1A1A] block text-center">How adventurous are you feeling?</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="rounded-[12px] border-[#E3E3E3] focus:border-sage">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quick & Easy">⚡ Quick & Easy</SelectItem>
                    <SelectItem value="Standard">👨‍🍳 Standard</SelectItem>
                    <SelectItem value="Complex">🔥 Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button 
                onClick={generateQuickIdeas} 
                disabled={isGeneratingIdeas || !ingredients.trim() || !mealType || !difficulty}
                className="bg-[#CFE6D6] hover:bg-[#B8D9C5] text-[#1A1A1A] rounded-[12px] min-h-[44px] shadow-[0_1px_0_rgba(0,0,0,0.04)] font-medium"
              >
                {isGeneratingIdeas ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Generating recipe ideas...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Find My Recipes!
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {quickIdeas.length > 0 && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Pick a recipe idea to continue...</h3>
              <p className="text-sm text-[#6B6B6B]">Click on any recipe to generate the full recipe</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickIdeas.map((idea, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${
                    selectedIdeaIndex === index ? 'ring-2 ring-sage' : ''
                  }`}
                  onClick={() => !isGeneratingFullRecipe && handleSelectIdea(index)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {idea.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      disabled={isGeneratingFullRecipe}
                    >
                      {selectedIdeaIndex === index && isGeneratingFullRecipe ? (
                        <>
                          <Loader className="h-3 w-3 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Star className="h-3 w-3 mr-1" />
                          Choose This Recipe
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setQuickIdeas([]);
                  setIngredients("");
                  setMealType("");
                  setDifficulty("");
                }}
                disabled={isGeneratingFullRecipe}
              >
                ← Try Different Ingredients
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}