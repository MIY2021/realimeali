
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Recipe } from "@/types";
import { IngredientSectionParser } from "@/utils/ingredientSectionParser";
import { EquipmentExtractor } from "@/utils/equipmentExtractor";

interface RecipeTabContentProps {
  recipe: Recipe;
  scaledIngredients?: string[];
  isScaled?: boolean;
}

export const RecipeTabContent = ({ recipe, scaledIngredients, isScaled }: RecipeTabContentProps) => {
  const ingredientsToShow = scaledIngredients || recipe.ingredients;
  const ingredientSections = IngredientSectionParser.parseIngredients(ingredientsToShow);
  const equipment = EquipmentExtractor.formatEquipmentList(
    EquipmentExtractor.extractEquipment(recipe)
  );

  return (
    <Tabs defaultValue="ingredients" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg p-1 mb-6">
        <TabsTrigger 
          value="ingredients" 
          className="text-gray-600 data-[state=active]:bg-sage data-[state=active]:text-white font-medium rounded-md transition-all"
        >
          Ingredients
          {isScaled && <span className="ml-1 text-xs opacity-75">(scaled)</span>}
        </TabsTrigger>
        <TabsTrigger 
          value="instructions" 
          className="text-gray-600 data-[state=active]:bg-sage data-[state=active]:text-white font-medium rounded-md transition-all"
        >
          Instructions
        </TabsTrigger>
        <TabsTrigger 
          value="equipment" 
          className="text-gray-600 data-[state=active]:bg-sage data-[state=active]:text-white font-medium rounded-md transition-all"
        >
          Equipment
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ingredients" className="mt-0">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-navy mb-4">
            Ingredients
            {isScaled && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (adjusted quantities)
              </span>
            )}
          </h2>
          
          {ingredientSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-3">
              {section.header && (
                <h3 className="text-lg font-semibold text-navy mt-6 mb-3 first:mt-0">
                  {section.header}
                </h3>
              )}
              
              {section.ingredients.map((ingredient, index) => (
                <div key={index} className={`p-4 rounded-lg ${isScaled ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                  <p className="text-gray-700 leading-relaxed">{ingredient}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="instructions" className="mt-0">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-navy mb-4">Instructions</h2>
          {recipe.instructions.map((step, index) => (
            <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-terracotta text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <p className="text-gray-700 leading-relaxed flex-1">{step}</p>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="equipment" className="mt-0">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-navy mb-4">Equipment</h2>
          
          {equipment.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {equipment.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">No specific equipment detected for this recipe.</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
