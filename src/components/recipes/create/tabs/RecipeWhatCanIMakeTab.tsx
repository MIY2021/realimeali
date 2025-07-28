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
  complexity_level: string;
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
      const prompt = `Generate 3 quick recipe ideas for ${mealType.toLowerCase()} with ${difficulty.toLowerCase()} difficulty using these ingredients: ${ingredients}. For each recipe, provide only:
1. A creative, appealing title
2. A one-sentence description (max 20 words)

Format as JSON: [{"title": "Recipe Name", "description": "Short description"}, ...]

Make them distinct in cooking style, cuisine, or approach.`;

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
          complexity_level: difficulty.toLowerCase(),
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
    <div className="space-y-6 p-4 sm:p-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center gap-2 mb-2">
          <UtensilsCrossed className="h-8 w-8 text-sage" />
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-navy">What Can I Make?</h2>
        <p className="text-muted-foreground">
          Tell us what ingredients you have, and we'll suggest delicious recipes you can make right now!
        </p>
      </div>

      {quickIdeas.length === 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ingredients">What ingredients do you have?</Label>
            <Textarea
              id="ingredients"
              placeholder="e.g. chicken, courgette, rice, garlic, onion"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-sm text-muted-foreground">
              List the main ingredients you have available (comma-separated or free text)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>What are you cooking?</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
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
              <Label>How adventurous are you feeling?</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
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

          <Button 
            onClick={generateQuickIdeas} 
            disabled={isGeneratingIdeas || !ingredients.trim() || !mealType || !difficulty}
            className="w-full"
            size="lg"
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
      )}

      {quickIdeas.length > 0 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-navy mb-2">Pick a recipe idea to continue...</h3>
            <p className="text-sm text-muted-foreground">Click on any recipe to generate the full recipe</p>
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
                  <div className="aspect-video bg-gradient-to-br from-sage/20 to-terracotta/20 rounded-md mb-3 overflow-hidden relative flex items-center justify-center">
                    {selectedIdeaIndex === index && isGeneratingFullRecipe ? (
                      <Loader className="h-8 w-8 animate-spin text-sage" />
                    ) : (
                      <UtensilsCrossed className="h-8 w-8 text-sage" />
                    )}
                  </div>
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
  );
}