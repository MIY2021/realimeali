
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Recipe } from "@/types";

interface RecipeTabContentProps {
  recipe: Recipe;
}

export const RecipeTabContent = ({ recipe }: RecipeTabContentProps) => {
  return (
    <Tabs defaultValue="ingredients" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1 mb-6">
        <TabsTrigger 
          value="ingredients" 
          className="text-gray-600 data-[state=active]:bg-sage data-[state=active]:text-white font-medium rounded-md transition-all"
        >
          Ingredients
        </TabsTrigger>
        <TabsTrigger 
          value="instructions" 
          className="text-gray-600 data-[state=active]:bg-sage data-[state=active]:text-white font-medium rounded-md transition-all"
        >
          Instructions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ingredients" className="mt-0">
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-navy mb-4">Ingredients</h2>
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 leading-relaxed">{ingredient}</p>
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
    </Tabs>
  );
};
