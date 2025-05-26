import { useState, useEffect } from "react";
import ShoppingListHeader from "@/components/shopping-list/ShoppingListHeader";
import ShoppingListWeekSelector from "@/components/shopping-list/ShoppingListWeekSelector";
import ShoppingListSkeleton from "@/components/shopping-list/ShoppingListSkeleton";
import ShoppingListItem from "@/components/shopping-list/ShoppingListItem";
import ShoppingListProgress from "@/components/shopping-list/ShoppingListProgress";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useShoppingListGenerator } from "@/hooks/useShoppingListGenerator";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { Card, CardContent } from "@/components/ui/card";

export default function ShoppingList() {
  useDocumentTitle("Shopping List | RealiMeali");
  
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { getMealPlansForWeek } = useMealPlan();
  const { toast } = useToast();
  const { generateAndSaveFromMealPlans } = useShoppingListGenerator();
  const { setScrollKey, restoreScrollPosition, saveScrollPosition } = useScrollPosition();
  const isMobile = useIsMobile();
  const [weekNumber, setWeekNumber] = useState<1 | 2>(1);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    step: 0,
    totalSteps: 5,
    currentAction: ''
  });
  
  const {
    shoppingList,
    isLoading,
    toggleItemChecked,
    clearAll,
    refreshList,
  } = useShoppingList(weekNumber);

  // Set up scroll position management
  useEffect(() => {
    const scrollKey = `shopping-list-week-${weekNumber}`;
    setScrollKey(scrollKey);
    
    // Check if we should restore scroll position
    const shouldRestore = sessionStorage.getItem('restoreShoppingListScroll') === 'true';
    if (shouldRestore) {
      console.log('Restoring shopping list scroll position');
      sessionStorage.removeItem('restoreShoppingListScroll');
      restoreScrollPosition(scrollKey);
    }
  }, [weekNumber, setScrollKey, restoreScrollPosition]);

  // Save scroll position before unmounting
  useEffect(() => {
    return () => {
      const scrollKey = `shopping-list-week-${weekNumber}`;
      saveScrollPosition(scrollKey);
    };
  }, [weekNumber, saveScrollPosition]);

  const mealPlans = getMealPlansForWeek(weekNumber);
  const hasMealPlans = mealPlans.length > 0;

  const getRecipeNames = (recipeIds: string[]): string => {
    const uniqueRecipeIds = [...new Set(recipeIds)];
    const recipeNames = uniqueRecipeIds
      .map(id => {
        const recipe = recipes.find(r => r.id === id);
        return recipe ? recipe.title : `Recipe ${id.substring(0, 8)}`;
      })
      .filter(Boolean);
    
    return recipeNames.length > 0 ? recipeNames.join(', ') : 'Unknown Recipe';
  };

  const handleCopyItem = (itemId: string) => {
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
    if (!user || !currentHousehold) {
      toast({
        title: "Error",
        description: "Please log in and select a household",
        variant: "destructive",
      });
      return;
    }

    if (recipesLoading) {
      toast({
        title: "Please wait",
        description: "Recipes are still loading...",
        variant: "destructive",
      });
      return;
    }

    if (recipes.length === 0) {
      toast({
        title: "No recipes",
        description: "No recipes found. Please add some recipes first.",
        variant: "destructive",
      });
      return;
    }

    if (!hasMealPlans) {
      toast({
        title: "No meal plans",
        description: `Please add some meal plans for week ${weekNumber} first`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({ step: 1, totalSteps: 5, currentAction: 'Clearing old shopping list...' });

    try {
      // Clear the UI immediately for better user experience
      await clearAll();
      
      setGenerationProgress({ step: 2, totalSteps: 5, currentAction: 'Collecting ingredients from meal plans...' });
      
      setGenerationProgress({ step: 3, totalSteps: 5, currentAction: 'Consolidating similar ingredients...' });
      
      const startTime = performance.now();
      const result = await generateAndSaveFromMealPlans(weekNumber);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      setGenerationProgress({ step: 4, totalSteps: 5, currentAction: 'Saving to database...' });
      
      // Force refresh the list after generation
      setTimeout(async () => {
        setGenerationProgress({ step: 5, totalSteps: 5, currentAction: 'Complete!' });
        await refreshList();
        
        if (result && result.length > 0) {
          toast({
            title: "Shopping list generated!",
            description: `Week ${weekNumber} shopping list created with ${result.length} items in ${duration}ms`,
          });
        } else {
          toast({
            title: "No items created",
            description: "No ingredients were found to add to the shopping list",
            variant: "destructive",
          });
        }
      }, 500);
      
    } catch (error) {
      console.error('Error generating shopping list:', error);
      toast({
        title: "Error",
        description: `Failed to generate shopping list: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress({ step: 0, totalSteps: 5, currentAction: '' });
      }, 1000);
    }
  };

  // Show loading state while recipes are loading
  if (recipesLoading) {
    return (
      <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-4' : 'py-8'} ${!isMobile ? 'max-w-4xl' : ''}`}>
        <ShoppingListHeader 
          onShare={handleShare} 
          weekNumber={weekNumber}
        />
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-4' : 'py-8'} ${!isMobile ? 'max-w-4xl' : ''}`}>
      <ShoppingListHeader 
        onShare={handleShare} 
        weekNumber={weekNumber}
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
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            hasItems={shoppingList.length > 0}
          />

          <ShoppingListProgress
            step={generationProgress.step}
            totalSteps={generationProgress.totalSteps}
            currentAction={generationProgress.currentAction}
            isVisible={isGenerating}
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
                    <CardContent className={`${isMobile ? 'p-2' : 'p-3'}`}>
                      <ShoppingListItem
                        id={item.id}
                        name={item.name}
                        quantity={item.consolidatedQuantity || 1}
                        unit={item.consolidatedUnit}
                        isChecked={item.isChecked}
                        recipeIds={[...new Set(item.recipeIds)]}
                        copiedItemId={copiedItemId}
                        onCheck={(checked) => toggleItemChecked(item.id)}
                        onCopy={() => handleCopyItem(item.id)}
                        getRecipeNames={getRecipeNames}
                      />
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
