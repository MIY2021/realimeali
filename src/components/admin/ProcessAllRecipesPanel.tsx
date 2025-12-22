import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { categorizeIngredients } from "@/services/ingredientCategorizationService";

export function ProcessAllRecipesPanel() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{
    totalRecipes: number;
    processedRecipes: number;
    totalIngredients: number;
    processedIngredients: number;
    categorized: number;
  } | null>(null);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleProcess = async () => {
    setIsProcessing(true);
    setProgress(null);
    setResult(null);

    try {
      // Step 1: Fetch all recipes
      console.log('ðŸ“š Fetching all recipes...');
      const { data: recipes, error: fetchError } = await supabase
        .from('recipes')
        .select('id, title, ingredients')
        .eq('is_deleted', false)
        .not('ingredients', 'is', null);

      if (fetchError) {
        throw new Error(`Failed to fetch recipes: ${fetchError.message}`);
      }

      if (!recipes || recipes.length === 0) {
        toast({
          title: "No recipes found",
          description: "There are no recipes to process.",
        });
        setIsProcessing(false);
        return;
      }

      console.log(`ðŸ“š Found ${recipes.length} recipes`);

      // Step 2: Extract all unique ingredients
      const ingredientSet = new Set<string>();
      recipes.forEach(recipe => {
        if (Array.isArray(recipe.ingredients)) {
          recipe.ingredients.forEach(ing => {
            if (ing && typeof ing === 'string') {
              const trimmed = ing.trim();
              // Filter out empty ingredients and section headers
              if (trimmed && 
                  trimmed.length > 0 && 
                  trimmed !== 'undefined' && 
                  trimmed !== 'null' &&
                  !trimmed.endsWith(':')) {
                ingredientSet.add(trimmed);
              }
            }
          });
        }
      });

      const allIngredients = Array.from(ingredientSet);
      console.log(`ðŸ“¦ Found ${allIngredients.length} unique ingredients`);

      setProgress({
        totalRecipes: recipes.length,
        processedRecipes: 0,
        totalIngredients: allIngredients.length,
        processedIngredients: 0,
        categorized: 0,
      });

      // Step 3: Process ingredients in batches to avoid overwhelming the system
      const batchSize = 20; // Process 20 ingredients at a time
      let categorizedCount = 0;

      for (let i = 0; i < allIngredients.length; i += batchSize) {
        const batch = allIngredients.slice(i, i + batchSize);
        console.log(`ðŸ”„ Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} ingredients)...`);

        try {
          const categoryMap = await categorizeIngredients(batch);
          categorizedCount += categoryMap.size;

          setProgress(prev => prev ? {
            ...prev,
            processedIngredients: Math.min(i + batchSize, allIngredients.length),
            categorized: categorizedCount,
          } : null);

          // Small delay between batches to avoid rate limiting
          if (i + batchSize < allIngredients.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (batchError) {
          console.error(`Error processing batch starting at index ${i}:`, batchError);
          // Continue with next batch
        }
      }

      const finalResult = {
        success: true,
        totalRecipes: recipes.length,
        totalIngredients: allIngredients.length,
        categorized: categorizedCount,
      };

      setResult(finalResult);
      setProgress(null);

      toast({
        title: "Processing complete",
        description: `Successfully processed ${allIngredients.length} ingredients from ${recipes.length} recipes.`,
      });

    } catch (error: any) {
      console.error('Error processing recipes:', error);
      setResult({
        success: false,
        error: error.message || "Failed to process recipes",
      });
      toast({
        title: "Error",
        description: error.message || "Failed to process recipes",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process All Recipes</CardTitle>
        <CardDescription>
          Process all existing recipes through the categorization system. 
          This will check the database first for each ingredient, then use AI if needed.
          All categorized ingredients will be saved to the database to reduce future AI usage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleProcess}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Process All Recipes
            </>
          )}
        </Button>

        {progress && (
          <div className="mt-4 p-4 rounded-lg border bg-muted/50">
            <h4 className="text-sm font-semibold mb-2">Progress</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipes:</span>
                <span className="font-medium">{progress.processedRecipes} / {progress.totalRecipes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ingredients:</span>
                <span className="font-medium">{progress.processedIngredients} / {progress.totalIngredients}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categorized:</span>
                <span className="font-medium text-green-600">{progress.categorized}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.processedIngredients / progress.totalIngredients) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <h4 className="font-semibold">
                {result.success ? "Success" : "Error"}
              </h4>
            </div>
            
            {result.success ? (
              <div className="space-y-1 text-sm">
                <p><strong>Total Recipes:</strong> {result.totalRecipes}</p>
                <p><strong>Total Ingredients:</strong> {result.totalIngredients}</p>
                <p><strong>Categorized:</strong> {result.categorized}</p>
              </div>
            ) : (
              <p className="text-sm text-red-500">{result.error}</p>
            )}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Note:</strong> This process uses the same categorization logic as recipe imports. 
            It checks the database first for each ingredient, then uses AI only if needed. 
            All categorized ingredients are automatically saved to reduce future AI usage.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
