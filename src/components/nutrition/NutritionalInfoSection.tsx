import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ChevronDown, ChevronRight, RotateCcw, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Recipe } from "@/types";
import { FruitVegIndicator } from "./FruitVegIndicator";
import { useFruitVegEstimation } from "@/hooks/useFruitVegEstimation";
import { supabase } from "@/integrations/supabase/client";

interface NutritionalInfoSectionProps {
  recipe: Recipe;
}

interface EstimationResult {
  portions: number;
  breakdown?: string;
  perServingAnalysis?: Array<{
    ingredient: string;
    totalGrams: number;
    perServingGrams: number;
    cappedPortions: number;
    reasoning: string;
  }>;
  contributingIngredients?: Array<{
    ingredient: string;
    portions: number;
    grams: number;
  }>;
  referencedIngredients?: Array<{
    ingredient: string;
    actualPortions: number;
    grams: number;
    reason: string;
  }>;
  recommendations?: Array<{
    suggestion: string;
    portionIncrease: number;
    reasoning: string;
  }>;
  totalGrams?: number;
  cached: boolean;
}

export const NutritionalInfoSection = ({ recipe }: NutritionalInfoSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [nutritionData, setNutritionData] = useState<EstimationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { estimatePortions } = useFruitVegEstimation();

  const fetchNutritionData = async (forceRefresh = false) => {
    // Check if we need to fetch data
    const hasScore = recipe.fruit_veg_portions && recipe.fruit_veg_portions > 0;
    const hasBreakdown = nutritionData && (
      nutritionData.contributingIngredients?.length || 
      nutritionData.perServingAnalysis?.length
    );
    
    // Only fetch if: no data at all, or has score but missing breakdown, or force refresh
    if (!forceRefresh && (nutritionData && hasBreakdown) || !recipe.ingredients?.length || isLoading) return;
    
    setIsLoading(true);
    
    // Set a timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      console.log('Nutrition analysis timeout for recipe:', recipe.title);
      setIsLoading(false);
      setNutritionData({ 
        portions: recipe.fruit_veg_portions || 0, 
        cached: false,
        breakdown: "Analysis timeout - please try refreshing"
      });
    }, 30000); // 30 second timeout

    try {
      console.log('Fetching nutrition data for:', recipe.title, 'with ingredients:', recipe.ingredients.length);
      
      // Get detailed estimation data using Supabase client
      const { data, error } = await supabase.functions.invoke('estimate-fruit-veg-portions', {
        body: {
          recipeId: recipe.id,
          ingredients: recipe.ingredients,
          servings: recipe.servings || 1
        }
      });

      clearTimeout(timeoutId);

      if (!error && data) {
        console.log('Nutrition data received successfully for:', recipe.title, data);
        setNutritionData(data);
      } else if (error) {
        console.error('Error from AI function for recipe', recipe.title, ':', error);
        // Set a fallback state to indicate error
        setNutritionData({ 
          portions: recipe.fruit_veg_portions || 0, 
          cached: false,
          breakdown: `Analysis failed: ${error.message || 'Unknown error'}`
        });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error fetching nutrition data for recipe', recipe.title, ':', error);
      // Set a fallback state to indicate error
      setNutritionData({ 
        portions: recipe.fruit_veg_portions || 0, 
        cached: false,
        breakdown: `Network error: ${error instanceof Error ? error.message : 'Connection failed'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch nutrition data on mount or when we have a score but missing breakdown
  useEffect(() => {
    const hasScore = recipe.fruit_veg_portions && recipe.fruit_veg_portions > 0;
    const hasBreakdown = nutritionData && (
      nutritionData.contributingIngredients?.length || 
      nutritionData.perServingAnalysis?.length
    );
    
    if (!isLoading && (!nutritionData || (hasScore && !hasBreakdown))) {
      fetchNutritionData();
    }
  }, [recipe.id, recipe.fruit_veg_portions, nutritionData, isLoading]);

  const portions = recipe.fruit_veg_portions || 0;
  const hasNutritionInfo = portions > 0;

  return (
    <div className="mb-6">
      <div className="bg-white border border-sage/20 rounded-lg p-4">
        <div 
          className="flex items-start gap-3 cursor-pointer hover:bg-gray-50/50 transition-colors rounded-lg p-2 -m-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-shrink-0 mt-0.5">
            <Heart className="h-5 w-5 text-sage" />
          </div>
          <div className="flex-1">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sage-800">5 A Day - Fruit & Veg</h3>
                <div className="flex items-center gap-2">
                  {hasNutritionInfo && (
                    <div className="flex items-center gap-2">
                      <FruitVegIndicator 
                        portions={portions} 
                        size="small"
                        showLabel={false}
                      />
                      <span className="text-sm font-medium text-sage-700">{portions}/{5}</span>
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {hasNutritionInfo && !isExpanded && (
          <p className="text-xs text-gray-600 mt-2 ml-8">Estimated fruit & vegetable portions per serving</p>
        )}

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {hasNutritionInfo ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Total: {portions} out of 5 recommended daily portions
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchNutritionData(true)}
                    disabled={isLoading}
                    className="h-7 px-2 text-xs"
                  >
                    <RotateCcw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Analysis
                  </Button>
                </div>

                {/* Loading state for breakdown */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    Analyzing ingredient breakdown...
                  </div>
                )}

                {/* Enhanced Breakdown */}
                {!isLoading && nutritionData?.contributingIngredients && nutritionData.contributingIngredients.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-sage-800">🥦 Fruit & Veg Per Serving:</h4>
                    
                    <div className="space-y-2">
                      {nutritionData.contributingIngredients.map((item, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-sage-800">{item.ingredient}</span>
                          <span className="text-sage-600"> – {item.portions} portion{item.portions !== 1 ? 's' : ''} ({item.grams}g)</span>
                        </div>
                      ))}
                      
                       {/* Show referenced (non-counting) ingredients */}
                      {nutritionData.referencedIngredients && nutritionData.referencedIngredients.length > 0 && (
                        <div className="pt-2 border-t border-sage/20">
                          <p className="text-sm text-gray-600">
                            🧂 Other ingredients don't count towards your 5 A Day
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Fallback message when we have score but no breakdown */}
                {!isLoading && hasNutritionInfo && !nutritionData?.contributingIngredients?.length && 
                 !nutritionData?.perServingAnalysis?.length && (
                  <p className="text-sm text-amber-600">
                    Detailed breakdown missing. Try "Refresh Analysis".
                  </p>
                )}

                {/* Fallback to old format if new format not available */}
                {!isLoading && (!nutritionData?.contributingIngredients || nutritionData.contributingIngredients.length === 0) && 
                 nutritionData?.perServingAnalysis && nutritionData.perServingAnalysis.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-sage-800">🥦 Fruit & Veg Per Serving:</h4>
                    
                    <div className="space-y-2">
                      {nutritionData.perServingAnalysis
                        .filter(item => item.cappedPortions > 0)
                        .map((item, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-sage-800">{item.ingredient}</span>
                          <span className="text-sage-600"> – {item.cappedPortions} portion{item.cappedPortions !== 1 ? 's' : ''} ({item.perServingGrams}g)</span>
                        </div>
                      ))}
                      
                      {/* Show non-counting ingredients */}
                      {nutritionData.perServingAnalysis.some(item => item.cappedPortions === 0) && (
                        <div className="pt-2 border-t border-sage/20">
                          <p className="text-sm text-gray-600">
                            🧂 Other ingredients don't count towards your 5 A Day
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Simple Recommendations */}
                {!isLoading && nutritionData?.recommendations && nutritionData.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-sage-800">🌟 Boost Your Score:</h4>
                    <div className="space-y-2">
                      {nutritionData.recommendations.map((rec, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-green-800">{rec.suggestion}</span>
                          <span className="text-green-600"> – +{rec.portionIncrease} portion{rec.portionIncrease !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NHS Guidelines in tooltip */}
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-auto p-1">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          <strong>NHS 5 A Day Guidelines:</strong> 1 portion = 80g of fruit or vegetables. 
                          This analysis follows official NHS guidelines. Estimates may vary based on ingredients and preparation.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-xs text-muted-foreground">About this analysis</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {isLoading ? (
                  <p className="text-sm text-gray-500">Analyzing ingredients...</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">
                      No fruit and vegetable content detected in this recipe.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      AI analysis follows NHS 5 A Day guidelines. Only recipes with fruit/vegetable content show estimates.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};