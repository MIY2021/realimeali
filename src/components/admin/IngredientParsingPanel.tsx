import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader, Play, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCategoryForIngredient } from "@/services/ingredientCategorizationService";
import { IngredientCategory } from "@/types/ingredientCategories";

interface ParsedIngredient {
  original: string;
  category: IngredientCategory | null;
  error?: string;
}

export function IngredientParsingPanel() {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<ParsedIngredient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleParse = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    setRecipeTitle(null);
    setIngredients([]);

    try {
      // Step 1: Parse recipe from URL (exactly as the app does)
      console.log('🔗 Processing URL:', url.trim());
      
      const { data, error: parseError } = await supabase.functions.invoke('parse-recipe-ai', {
        body: { 
          websiteUrl: url.trim(),
          extractImages: false // We don't need images for this tool
        },
      });

      if (parseError) {
        throw parseError;
      }

      if (!data?.parsedRecipe) {
        throw new Error('No recipe data could be extracted from this website.');
      }

      const recipeData = data.parsedRecipe;
      setRecipeTitle(recipeData.title || "Untitled Recipe");

      // Step 2: Extract ingredients array
      const rawIngredients = Array.isArray(recipeData.ingredients) 
        ? recipeData.ingredients 
        : [];

      if (rawIngredients.length === 0) {
        setError("No ingredients found in the parsed recipe.");
        setIsProcessing(false);
        return;
      }

      // Step 3: Filter out section headers and empty ingredients
      const validIngredients = rawIngredients.filter(ing => {
        const trimmed = ing?.trim();
        return trimmed && 
               trimmed.length > 0 && 
               trimmed !== 'undefined' && 
               trimmed !== 'null' &&
               !trimmed.endsWith(':'); // Filter out section headers
      });

      if (validIngredients.length === 0) {
        setError("No valid ingredients found after filtering.");
        setIsProcessing(false);
        return;
      }

      // Step 4: Categorize each ingredient
      const parsedIngredients: ParsedIngredient[] = [];
      
      for (const ingredient of validIngredients) {
        try {
          const result = await getCategoryForIngredient(ingredient);
          
          parsedIngredients.push({
            original: ingredient,
            category: result.category,
            cleanedName: result.cleanedName,
          });
        } catch (err: any) {
          parsedIngredients.push({
            original: ingredient,
            category: null,
            error: err.message || "Failed to categorize",
          });
        }
      }

      setIngredients(parsedIngredients);
      
      toast({
        title: "Parsing complete",
        description: `Successfully parsed ${parsedIngredients.length} ingredients from "${recipeData.title || 'recipe'}"`,
      });
    } catch (err: any) {
      console.error('Error parsing ingredients:', err);
      setError(err.message || "Failed to parse recipe from URL");
      toast({
        title: "Error",
        description: err.message || "Failed to parse recipe from URL",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredient Parsing Tool</CardTitle>
        <CardDescription>
          Parse ingredients from a recipe URL and see how they are categorized. 
          This uses the same parsing method as the app to ensure consistency.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Recipe URL</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/recipe"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isProcessing && url.trim()) {
                handleParse();
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Enter a recipe URL to parse and categorize its ingredients
          </p>
        </div>

        <Button
          onClick={handleParse}
          disabled={isProcessing || !url.trim()}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Parsing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Parse Ingredients
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {recipeTitle && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Recipe: {recipeTitle}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Found {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
            </p>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {ingredients.map((ingredient, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {ingredient.original}
                        </p>
                      </div>
                      <div className="text-right">
                        {ingredient.error ? (
                          <div className="flex items-center gap-1 text-red-500">
                            <XCircle className="h-4 w-4" />
                            <span className="text-xs">Error</span>
                          </div>
                        ) : ingredient.category ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">{ingredient.category}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-xs">No category</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {ingredient.error && (
                      <p className="text-xs text-red-500 mt-1">{ingredient.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 p-3 rounded-lg border bg-muted/50">
              <h4 className="text-sm font-semibold mb-2">Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Total:</span>{" "}
                  <span className="font-medium">{ingredients.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Categorized:</span>{" "}
                  <span className="font-medium text-green-600">
                    {ingredients.filter(i => i.category && !i.error).length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Errors:</span>{" "}
                  <span className="font-medium text-red-500">
                    {ingredients.filter(i => i.error).length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">No category:</span>{" "}
                  <span className="font-medium text-muted-foreground">
                    {ingredients.filter(i => !i.category && !i.error).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Note:</strong> This tool uses the exact same parsing and categorization logic as the app. 
            Use it to test how ingredients are extracted and categorized from different recipe sources.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}


