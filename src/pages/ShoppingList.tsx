
import { useState } from "react";
import ShoppingListHeader from "@/components/shopping-list/ShoppingListHeader";
import ShoppingListWeekSelector from "@/components/shopping-list/ShoppingListWeekSelector";
import ShoppingListSkeleton from "@/components/shopping-list/ShoppingListSkeleton";
import GenerateShoppingListButton from "@/components/shopping-list/GenerateShoppingListButton";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useShoppingListGenerator } from "@/hooks/useShoppingListGenerator";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { extractIngredientName } from "@/utils/shoppingListUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export default function ShoppingList() {
  useDocumentTitle("Shopping List | RealiMeali");
  
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes } = useRecipes();
  const { getMealPlansForWeek } = useMealPlan();
  const { toast } = useToast();
  const { generateAndSaveFromMealPlans } = useShoppingListGenerator();
  const isMobile = useIsMobile();
  const [weekNumber, setWeekNumber] = useState<1 | 2>(1);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const {
    shoppingList,
    isLoading,
    toggleItemChecked,
    addCustomItem,
    clearAll,
  } = useShoppingList(weekNumber);

  const mealPlans = getMealPlansForWeek(weekNumber);
  const hasMealPlans = mealPlans.length > 0;

  const getRecipeNames = (recipeIds: string[]): string => {
    const recipeNames = recipeIds
      .map(id => {
        const recipe = recipes.find(r => r.id === id);
        return recipe ? recipe.title : `Recipe ${id.substring(0, 8)}`;
      })
      .filter(Boolean);
    
    return recipeNames.length > 0 ? recipeNames.join(', ') : 'Unknown Recipe';
  };

  const handleCopyItem = (itemName: string, itemId: string) => {
    const ingredientName = extractIngredientName(itemName);
    navigator.clipboard.writeText(ingredientName);
    setCopiedItemId(itemId);
    
    setTimeout(() => {
      setCopiedItemId(null);
    }, 2000);
  };

  const handleShare = () => {
    const listText = shoppingList
      .map(item => {
        const qty = item.consolidatedQuantity && item.consolidatedQuantity > 1 
          ? ` (${item.consolidatedQuantity}${item.consolidatedUnit ? ` ${item.consolidatedUnit}` : ''})`
          : '';
        return `• ${item.name}${qty}`;
      })
      .join('\n');

    if (navigator.share) {
      navigator.share({
        title: `Shopping List - Week ${weekNumber}`,
        text: listText,
      });
    } else {
      navigator.clipboard.writeText(listText);
      toast({
        title: "Copied to clipboard",
        description: "Shopping list has been copied to your clipboard",
      });
    }
  };

  const handleGenerate = async () => {
    if (!user || !currentHousehold) return;

    if (!hasMealPlans) {
      toast({
        title: "No meal plans",
        description: `Please add some meal plans for week ${weekNumber} first`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateAndSaveFromMealPlans(weekNumber);
      toast({
        title: "Shopping list generated!",
        description: `Week ${weekNumber} shopping list has been created with consolidated ingredients`,
      });
    } catch (error) {
      console.error('Error generating shopping list:', error);
      toast({
        title: "Error",
        description: "Failed to generate shopping list",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-4' : 'py-8'} ${!isMobile ? 'max-w-4xl' : ''}`}>
      <ShoppingListHeader 
        onShare={handleShare} 
        onRegenerate={handleGenerate}
        weekNumber={weekNumber}
        isRegenerating={isGenerating}
      />

      {!user ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view and manage your shopping list.</p>
        </div>
      ) : !currentHousehold ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please create or select a household to manage shopping lists.</p>
        </div>
      ) : (
        <>
          <ShoppingListWeekSelector 
            selectedWeek={weekNumber} 
            onWeekSelect={setWeekNumber} 
          />

          <GenerateShoppingListButton
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            weekNumber={weekNumber}
            hasItems={shoppingList.length > 0}
          />

          {isLoading ? (
            <ShoppingListSkeleton />
          ) : (
            <div className={`space-y-${isMobile ? '2' : '3'}`}>
              {shoppingList.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      {hasMealPlans 
                        ? `No shopping list generated yet for week ${weekNumber}.`
                        : `No meal plans found for week ${weekNumber}.`
                      }
                    </p>
                    {!hasMealPlans && (
                      <p className="text-sm text-muted-foreground">
                        Add some meal plans first to generate a shopping list.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                shoppingList.map((item) => (
                  <Card key={item.id} className="w-full">
                    <CardContent className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'}`}>
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox
                          checked={item.isChecked}
                          onCheckedChange={() => toggleItemChecked(item.id)}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium ${item.isChecked ? 'line-through text-muted-foreground' : ''}`}>
                            {item.consolidatedQuantity && item.consolidatedQuantity > 1 ? (
                              <span className="text-primary font-semibold">
                                {item.consolidatedQuantity}{item.consolidatedUnit ? ` ${item.consolidatedUnit}` : ''} 
                              </span>
                            ) : null}
                            {item.consolidatedQuantity && item.consolidatedQuantity > 1 ? ' ' : ''}
                            {item.name}
                          </div>
                          {item.recipeIds.length > 0 && (
                            <div className="text-sm text-green-600 mt-1">
                              From: {getRecipeNames(item.recipeIds)}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyItem(item.name, item.id)}
                        className="flex-shrink-0 ml-2"
                      >
                        {copiedItemId === item.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
