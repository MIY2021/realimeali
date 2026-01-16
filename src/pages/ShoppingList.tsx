
import { useState, useEffect, useRef } from "react";
import ShoppingListHeader from "@/components/shopping-list/ShoppingListHeader";
import ShoppingListItems from "@/components/shopping-list/ShoppingListItems";
import ShoppingListEmptyState from "@/components/shopping-list/ShoppingListEmptyState";
import { WeekSelector } from "@/components/shared/WeekSelector";
import { CalendarMonthModal } from "@/components/shared/CalendarMonthModal";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useAutoShoppingListGeneration } from "@/hooks/useAutoShoppingListGeneration";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { usePageTransition } from "@/hooks/usePageTransition";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Send, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentWeekKey } from "@/utils/weekUtils";
import { HeaderControls } from "@/components/layout/HeaderControls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortOption, groupShoppingListItems } from "@/utils/shoppingListSorting";

export default function ShoppingList() {
  useDocumentTitle("Shopping List | RealiMeali");
  
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes } = useRecipes();
  const { getMealPlansForWeek, mealPlans: allMealPlans, copyWeek } = useMealPlan();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Use same localStorage key as meal planner for consistency
  const WEEK_STORAGE_KEY = "meal-planner-current-week";
  const [currentWeek, setCurrentWeek] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return getCurrentWeekKey();
    }
    try {
      const saved = localStorage.getItem(WEEK_STORAGE_KEY);
      if (saved && /^\d{4}-W\d{1,2}$/.test(saved)) {
        return saved;
      }
    } catch (e) {
      // Ignore
    }
    return getCurrentWeekKey();
  });
  
  const [allWeeksModalOpen, setAllWeeksModalOpen] = useState(false);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState(false);
  const [infoDialog, setInfoDialog] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("category");
  
  // Sync week with localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WEEK_STORAGE_KEY && e.newValue && /^\d{4}-W\d{1,2}$/.test(e.newValue)) {
        setCurrentWeek(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(WEEK_STORAGE_KEY, currentWeek);
  }, [currentWeek]);
  
  // Enable automatic shopping list generation (silent - no UI indication)
  useAutoShoppingListGeneration();
  
  const {
    shoppingList,
    toggleItemChecked,
    refreshList,
  } = useShoppingList(currentWeek);

  // Load toggle state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('realiMeali_showOnlyUnchecked');
    if (saved) {
      setShowOnlyUnchecked(JSON.parse(saved));
    }
    const savedSort = localStorage.getItem('realiMeali_shoppingListSort');
    if (savedSort && (savedSort === "category" || savedSort === "recipe")) {
      setSortOption(savedSort as SortOption);
    } else {
      // Default to category, or migrate "none" to "category"
      setSortOption("category");
      localStorage.setItem('realiMeali_shoppingListSort', "category");
    }
  }, []);

  // Save toggle state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('realiMeali_showOnlyUnchecked', JSON.stringify(showOnlyUnchecked));
  }, [showOnlyUnchecked]);

  // Save sort option to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('realiMeali_shoppingListSort', sortOption);
  }, [sortOption]);


  // Remove lastGenerated tracking - not needed without generation UI

  const mealPlans = getMealPlansForWeek(currentWeek);
  const hasMealPlans = mealPlans.length > 0;

  // Calculate item counts
  const totalItems = shoppingList.length;
  const completedItems = shoppingList.filter(item => item.isChecked).length;

  const getRecipeNames = (recipeIds: string[]): string => {
    const uniqueRecipeIds = [...new Set(recipeIds)];
    const recipeNames = uniqueRecipeIds
      .map(id => {
        // First try to find it as a recipe
        const recipe = recipes.find(r => r.id === id);
        if (recipe) {
          return recipe.title;
        }
        
        // If not found as recipe, check if it's a custom meal (meal plan ID)
        const customMeal = mealPlans.find(mp => mp.id === id && mp.is_freetyped && mp.meal_name);
        if (customMeal) {
          return 'Custom Entry';
        }
        
        return `Recipe ${id.substring(0, 8)}`;
      })
      .filter(Boolean);
    
    return recipeNames.length > 0 ? recipeNames.join(', ') : 'Unknown Recipe';
  };

  // Filter shopping list
  const filteredShoppingList = showOnlyUnchecked 
    ? shoppingList.filter(item => !item.isChecked)
    : shoppingList;

  // Group items based on sort option
  const groupedItems = groupShoppingListItems(
    filteredShoppingList,
    sortOption,
    getRecipeNames
  );

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
        title: `Shopping List`,
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

  // Remove loading state check - show UI immediately

  return (
    <div className="container max-w-4xl py-4 px-4 sm:py-8 sm:px-6 space-y-3" data-scroll-content>
      <ShoppingListHeader
        onShare={handleShare} 
        onInfoClick={() => setInfoDialog(true)}
      />

      {!user ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view and manage your shopping list.</p>
        </div>
      ) : !currentHousehold ? (
        <div className="py-10 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold text-navy mb-2">No Household Selected</h2>
            <p className="text-muted-foreground mb-6">
              You need to create or join a household to manage shopping lists.
            </p>
            <Button asChild className="bg-terracotta hover:bg-terracotta/90">
              <Link to="/household">
                Manage Household
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <HeaderControls
            weekControl={
              <WeekSelector 
                currentWeek={currentWeek} 
                onWeekChange={setCurrentWeek}
                onWeekClick={() => setAllWeeksModalOpen(true)}
              />
            }
            utilityActions={
              <>
                {/* Manual generate button removed - shopping lists now generate automatically */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  className="h-9 w-9 p-0"
                  title="Share"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </>
            }
            rightActions={
              user && currentHousehold ? (
                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 border border-gray-200">
                    <label htmlFor="show-unchecked" className="text-xs font-medium whitespace-nowrap text-gray-700 cursor-pointer">
                      Hide Checked
                    </label>
                    <Switch
                      id="show-unchecked"
                      checked={showOnlyUnchecked}
                      onCheckedChange={setShowOnlyUnchecked}
                      className="data-[state=checked]:bg-[#F5B82E]"
                    />
                  </div>
                  <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                    <SelectTrigger id="sort-option" className="h-8 w-auto min-w-[100px] text-xs px-2 focus:ring-0 focus-visible:ring-0">
                      <ArrowUpDown className="h-4 w-4 mr-2 flex-shrink-0" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="recipe">Recipe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : null
            }
          />
          
          <CalendarMonthModal
            open={allWeeksModalOpen}
            onOpenChange={setAllWeeksModalOpen}
            currentWeek={currentWeek}
            onWeekSelect={setCurrentWeek}
            mealPlans={allMealPlans}
            onCopyWeek={copyWeek}
          />

          {/* No loading states - just show data or empty state immediately */}
          {shoppingList.length === 0 ? (
            <ShoppingListEmptyState
              hasMealPlans={hasMealPlans}
            />
          ) : (
            <ShoppingListItems
              shoppingList={groupedItems}
              copiedItemId={copiedItemId}
              onToggleItem={toggleItemChecked}
              onCopyItem={handleCopyItem}
              getRecipeNames={getRecipeNames}
              sortOption={sortOption}
            />
          )}

          {/* Remove info dialog - not needed without generation UI */}
        </>
      )}
    </div>
  );
}
