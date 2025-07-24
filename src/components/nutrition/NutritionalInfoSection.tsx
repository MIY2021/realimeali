import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronDown, ChevronRight } from "lucide-react";
import { Recipe } from "@/types";
import { FruitVegIndicator } from "./FruitVegIndicator";
import { useFruitVegEstimation } from "@/hooks/useFruitVegEstimation";

interface NutritionalInfoSectionProps {
  recipe: Recipe;
}

interface EstimationResult {
  portions: number;
  breakdown?: string;
  totalGrams?: number;
  cached: boolean;
}

export const NutritionalInfoSection = ({ recipe }: NutritionalInfoSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [nutritionData, setNutritionData] = useState<EstimationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { estimatePortions } = useFruitVegEstimation();

  const fetchNutritionData = async () => {
    if (nutritionData || !recipe.ingredients?.length) return;
    
    setIsLoading(true);
    try {
      // Get detailed estimation data
      const { data, error } = await fetch('/functions/v1/estimate-fruit-veg-portions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          ingredients: recipe.ingredients,
          servings: recipe.servings || 1
        })
      }).then(res => res.json());

      if (!error && data) {
        setNutritionData(data);
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && !nutritionData) {
      fetchNutritionData();
    }
  }, [isExpanded, recipe.id]);

  const portions = recipe.fruit_veg_portions || 0;
  const hasNutritionInfo = portions > 0;

  return (
    <Card className="border-sage/20">
      <CardHeader 
        className="pb-2 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-lg flex items-center justify-between h-auto">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-sage" />
            <span className="leading-none">Nutritional Information</span>
            {hasNutritionInfo && (
              <Badge variant="secondary" className="text-xs">
                AI Estimated
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasNutritionInfo && (
              <FruitVegIndicator 
                portions={portions} 
                size="small"
                showLabel={false}
              />
            )}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 px-4 pb-4">
          {hasNutritionInfo ? (
            <div className="space-y-4">
              {/* Main indicator */}
              <div className="flex items-center gap-3">
                <FruitVegIndicator 
                  portions={portions} 
                  size="medium"
                  showLabel={true}
                />
                <div className="text-sm text-muted-foreground">
                  Estimated per serving
                </div>
              </div>

              {/* Breakdown */}
              {nutritionData?.breakdown && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Calculation:</h4>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                    {nutritionData.breakdown}
                  </p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>AI Estimation:</strong> This nutritional information is estimated by AI based on the recipe ingredients and NHS 5 A Day guidelines (80g portions). 
                  Actual portions may vary depending on specific ingredients and preparation methods.
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
        </CardContent>
      )}
    </Card>
  );
};