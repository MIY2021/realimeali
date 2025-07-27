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

interface RecipeIdea {
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
  onSelectRecipe: (recipe: RecipeIdea) => void;
}

export function RecipeWhatCanIMakeTab({ onSelectRecipe }: RecipeWhatCanIMakeTabProps) {
  const [ingredients, setIngredients] = useState("");
  const [mealType, setMealType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipeIdeas, setRecipeIdeas] = useState<RecipeIdea[]>([]);
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});

  const { generateRecipe } = useAiRecipeGeneration();
  const { handleGenerateImage } = useImageGeneration();

  const generateRecipeIdeas = async () => {
    if (!ingredients.trim() || !mealType || !difficulty) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsGenerating(true);
    setRecipeIdeas([]);

    try {
      const prompt = `Generate 3 distinct ${mealType.toLowerCase()} recipes with ${difficulty.toLowerCase()} difficulty using these available ingredients: ${ingredients}. Each recipe should be different in style, cooking method, or cuisine. Make them creative but practical.`;

      // Generate 3 recipe ideas
      const ideas: RecipeIdea[] = [];
      for (let i = 0; i < 3; i++) {
        const result = await generateRecipe({
          prompt: prompt + ` Recipe ${i + 1}: Make this unique from the others.`,
          stylePreferences: [difficulty, mealType]
        });

        if (result) {
          ideas.push({
            ...result,
            meal_type: mealType,
            complexity_level: difficulty.toLowerCase(),
          });
        }
      }

      setRecipeIdeas(ideas);

      // For now, use placeholder images - image generation can be added later
      setRecipeIdeas(ideas);
    } catch (error) {
      console.error('Error generating recipe ideas:', error);
      toast.error("Failed to generate recipe ideas. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectRecipe = (idea: RecipeIdea) => {
    toast.success(`Selected "${idea.title}" - taking you to the editor!`);
    onSelectRecipe(idea);
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

      {recipeIdeas.length === 0 && (
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
            onClick={generateRecipeIdeas} 
            disabled={isGenerating || !ingredients.trim() || !mealType || !difficulty}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
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

      {recipeIdeas.length > 0 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-navy mb-2">Pick a recipe idea to continue...</h3>
            <p className="text-sm text-muted-foreground">Click on any recipe to edit and save it to your collection</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipeIdeas.map((idea, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                onClick={() => handleSelectRecipe(idea)}
              >
                <CardHeader className="pb-3">
                  <div className="aspect-video bg-gray-100 rounded-md mb-3 overflow-hidden relative">
                    {loadingImages[index] ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader className="h-6 w-6 animate-spin text-sage" />
                      </div>
                    ) : idea.image ? (
                      <img 
                        src={idea.image} 
                        alt={idea.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sage/20 to-terracotta/20">
                        <UtensilsCrossed className="h-8 w-8 text-sage" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{idea.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {idea.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {idea.prep_time + idea.cook_time}min
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {idea.complexity_level}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {idea.servings} servings
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    <Star className="h-3 w-3 mr-1" />
                    Choose This Recipe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setRecipeIdeas([]);
                setIngredients("");
                setMealType("");
                setDifficulty("");
              }}
            >
              ← Try Different Ingredients
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}