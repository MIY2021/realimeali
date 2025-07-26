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
  ingredientBreakdown?: Array<{
    ingredient: string;
    estimatedGrams: number;
    portions: number;
    reasoning: string;
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
        setNutritionData(data);
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

                {/* Breakdown */}
                {nutritionData?.ingredientBreakdown && nutritionData.ingredientBreakdown.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-sage-800">Fruit & vegetable breakdown per serving:</h4>
                    
                    {/* Table Headers */}
                    <div className="flex justify-between items-center text-xs font-medium text-sage-700 border-b border-sage/20 pb-2">
                      <span>Ingredient</span>
                      <span>Portions per serving</span>
                    </div>
                    
                    {/* Only show ingredients with portions > 0 */}
                    <div className="space-y-2">
                      {nutritionData.ingredientBreakdown
                        .filter(item => item.portions > 0)
                        .map((item, index) => (
                        <div key={index} className="bg-sage/5 border border-sage/10 p-3 rounded-lg">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-sage-800">{item.ingredient}</p>
                              <p className="text-xs text-gray-600 mt-1">{item.reasoning}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-medium text-sage-700">{item.portions}</p>
                              <p className="text-xs text-gray-500">{item.estimatedGrams}g</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {nutritionData?.recommendations && nutritionData.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-sage-800">🌟 Boost Your Score:</h4>
                    <div className="space-y-2">
                      {nutritionData.recommendations.map((rec, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-green-800">{rec.suggestion}</p>
                              <p className="text-xs text-green-700 mt-1">{rec.reasoning}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-medium text-green-700">+{rec.portionIncrease}</p>
                              <p className="text-xs text-green-600">portions</p>
                            </div>
                          </div>
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