
import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Recipe } from "@/types";
import { IngredientSectionParser } from "@/utils/ingredientSectionParser";
import { EquipmentExtractor } from "@/utils/equipmentExtractor";

interface RecipeTabContentProps {
  recipe: Recipe;
  scaledIngredients?: string[];
  isScaled?: boolean;
}

export const RecipeTabContent = React.memo(({ recipe, scaledIngredients, isScaled }: RecipeTabContentProps) => {
  const ingredientsToShow = scaledIngredients || recipe.ingredients;
  
  // Track when Chef's Insight tab is opened
  const handleTabChange = (value: string) => {
    if (value === 'chef-insight') {
      window.dispatchEvent(new CustomEvent('checkChefInsight'));
    }
  };
  
  // Memoize expensive computations to prevent infinite loops
  const ingredientSections = useMemo(() => {
    return IngredientSectionParser.parseIngredients(ingredientsToShow);
  }, [JSON.stringify(ingredientsToShow)]); // Use JSON.stringify for deep comparison
  
  const equipment = useMemo(() => {
    return EquipmentExtractor.formatEquipmentList(
      EquipmentExtractor.extractEquipment(recipe)
    );
  }, [recipe.instructions, recipe.ingredients, recipe.title, recipe.description]);

  // Only log in development and limit frequency
  if (process.env.NODE_ENV === 'development') {
    console.log("🧩 Ingredient Analysis:", {
      sectionsCount: ingredientSections.length,
      hasIngredients: ingredientsToShow.length > 0
    });
  }

  return (
    <Tabs defaultValue="ingredients" className="w-full" onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 mb-6">
        <TabsTrigger 
          value="ingredients" 
          className="data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:border data-[state=inactive]:border-gray-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-sage data-[state=active]:to-sage/90 data-[state=active]:text-white data-[state=active]:shadow-md font-medium rounded-xl py-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Ingredients
        </TabsTrigger>
        <TabsTrigger 
          value="equipment" 
          className="data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:border data-[state=inactive]:border-gray-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-butter data-[state=active]:to-butter/90 data-[state=active]:text-white data-[state=active]:shadow-md font-medium rounded-xl py-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Equipment
        </TabsTrigger>
        <TabsTrigger 
          value="instructions" 
          className="data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:border data-[state=inactive]:border-gray-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-terracotta data-[state=active]:to-terracotta/90 data-[state=active]:text-white data-[state=active]:shadow-md font-medium rounded-xl py-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Instructions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ingredients" className="mt-0">
        <div className="space-y-2">
          <h2 className="font-bold text-navy text-lg mb-2">
            Ingredients
          </h2>
          
          {ingredientSections.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-500 text-xs">No ingredients found</p>
            </div>
          ) : (
            ingredientSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-1">
                {section.header && (
                  <div className="flex items-center gap-2 mt-3 mb-2 first:mt-0 border-b border-sage/30 pb-2 bg-sage/10 px-2 py-1.5 rounded-lg">
                    <span className="text-sage-600 font-bold">▷</span>
                    <h3 className="font-semibold text-sage-800 text-sm">
                      {section.header}
                    </h3>
                  </div>
                )}
                
                {section.ingredients.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-500 text-xs">No ingredients in this section</p>
                  </div>
                ) : (
                  section.ingredients.map((ingredient, index) => (
                    <div key={`${sectionIndex}-${index}`} className={`p-2 rounded-lg transition-all ${
                      isScaled 
                        ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                      <p className="text-gray-700 text-sm leading-snug">{ingredient}</p>
                    </div>
                  ))
                )}
              </div>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="equipment" className="mt-0">
        <div className="space-y-2">
          <h2 className="font-bold text-navy text-lg mb-2">Equipment</h2>
          
          {equipment.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {equipment.map((item, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <p className="text-gray-700 text-sm leading-snug">{item}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg text-center p-3">
              <p className="text-gray-500 text-sm">No specific equipment detected for this recipe.</p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="instructions" className="mt-0">
        <div className="space-y-2">
          <h2 className="font-bold text-navy text-lg mb-2">Instructions</h2>
          {recipe.instructions.map((step, index) => (
            <div key={index} className="flex gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0 w-6 h-6 bg-terracotta text-white rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <p className="text-gray-700 flex-1 text-sm leading-snug">{step}</p>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
});
