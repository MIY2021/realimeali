import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronDown, ChevronRight } from "lucide-react";
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

  const fetchNutritionData = async () => {
    if (nutritionData || !recipe.ingredients?.length || isLoading) return;
    
    setIsLoading(true);
    try {
      // Get detailed estimation data using Supabase client
      const { data, error } = await supabase.functions.invoke('estimate-fruit-veg-portions', {
        body: {
          recipeId: recipe.id,
          ingredients: recipe.ingredients,
          servings: recipe.servings || 1
        }
      });

      if (!error && data) {
        console.log('Nutrition data received:', data);
        setNutritionData(data);
      } else if (error) {
        console.error('Error from AI function:', error);
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch nutrition data on mount to enable ingredient breakdown when expanded
  useEffect(() => {
    if (!nutritionData && !isLoading) {
      fetchNutritionData();
    }
  }, [recipe.id, nutritionData, isLoading]);

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
                <h3 className="font-semibold text-sage-800">Nutritional Information</h3>
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
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total: {portions} out of 5 recommended daily portions
                  </p>
                </div>

                {/* Enhanced Breakdown */}
                {nutritionData?.contributingIngredients && nutritionData.contributingIngredients.length > 0 && (
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
                            🧂 Other ingredients ({nutritionData.referencedIngredients
                              .map(item => item.ingredient.toLowerCase())
                              .join(', ')}) provide small amounts but don't count towards your 5 A Day.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Fallback to old format if new format not available */}
                {(!nutritionData?.contributingIngredients || nutritionData.contributingIngredients.length === 0) && 
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
                            🧂 Other ingredients ({nutritionData.perServingAnalysis
                              .filter(item => item.cappedPortions === 0)
                              .map(item => item.ingredient.toLowerCase())
                              .join(', ')}) provide small amounts but don't count towards your 5 A Day.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Simple Recommendations */}
                {nutritionData?.recommendations && nutritionData.recommendations.length > 0 && (
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

                {/* NHS Guidelines */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Based on NHS 5 A Day Guidelines:</strong> 1 portion = 80g of fruit or vegetables. 
                    This analysis follows official NHS guidelines for what counts towards your daily 5 portions. 
                    Estimates may vary based on specific ingredients and preparation methods.
                  </p>
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800">
                        <strong>AI Analysis:</strong> Our AI analyzes recipe ingredients to estimate fruit and vegetable portions 
                        according to NHS 5 A Day guidelines. Only recipes with detectable fruit/vegetable content will show estimates.
                      </p>
                    </div>
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