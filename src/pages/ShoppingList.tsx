
import { useState, useEffect } from "react";
import ShoppingListHeader from "@/components/shopping-list/ShoppingListHeader";
import ShoppingListItems from "@/components/shopping-list/ShoppingListItems";
import ShoppingListEmptyState from "@/components/shopping-list/ShoppingListEmptyState";
import { WeekSelector } from "@/components/shared/WeekSelector";
import { CalendarMonthModal } from "@/components/shared/CalendarMonthModal";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useAutoShoppingListGeneration } from "@/hooks/useAutoShoppingListGeneration";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, SlidersHorizontal, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentWeekKey } from "@/utils/weekUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortOption, groupShoppingListItems } from "@/utils/shoppingListSorting";
import { PageControlsCard } from "@/components/layout/PageControlsCard";
import OcadoShoppingMode from "@/components/shopping-list/OcadoShoppingMode";

export default function ShoppingList() {
  useDocumentTitle("Shopping List | RealiMeali");

  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { getMealPlansForWeek, mealPlans: allMealPlans, copyWeek } = useMealPlan();
  const { toast } = useToast();

  const WEEK_STORAGE_KEY = "meal-planner-current-week";
  const [currentWeek, setCurrentWeek] = useState<string>(() => {
    if (typeof window === "undefined") return getCurrentWeekKey();
    try {
      const saved = localStorage.getItem(WEEK_STORAGE_KEY);
      if (saved && /^\d{4}-W\d{1,2}$/.test(saved)) return saved;
    } catch {
      // Ignore storage errors.
    }
    return getCurrentWeekKey();
  });

  const [allWeeksModalOpen, setAllWeeksModalOpen] = useState(false);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("category");
  const [newItemName, setNewItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [ocadoItemId, setOcadoItemId] = useState<string | null>(null);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WEEK_STORAGE_KEY && e.newValue && /^\d{4}-W\d{1,2}$/.test(e.newValue)) {
        setCurrentWeek(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(WEEK_STORAGE_KEY, currentWeek);
  }, [currentWeek]);

  useAutoShoppingListGeneration();

  const {
    shoppingList,
    toggleItemChecked,
    addCustomItem,
  } = useShoppingList(currentWeek);

  useEffect(() => {
    const saved = localStorage.getItem("realiMeali_showOnlyUnchecked");
    if (saved) {
      try {
        setShowOnlyUnchecked(JSON.parse(saved));
      } catch {
        setShowOnlyUnchecked(false);
      }
    }

    const savedSort = localStorage.getItem("realiMeali_shoppingListSort");
    if (savedSort === "category") {
      setSortOption(savedSort as SortOption);
    } else {
      setSortOption("category");
      localStorage.setItem("realiMeali_shoppingListSort", "category");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("realiMeali_showOnlyUnchecked", JSON.stringify(showOnlyUnchecked));
  }, [showOnlyUnchecked]);

  useEffect(() => {
    localStorage.setItem("realiMeali_shoppingListSort", sortOption);
  }, [sortOption]);

  const mealPlans = getMealPlansForWeek(currentWeek);
  const hasMealPlans = mealPlans.length > 0;

  const totalItems = shoppingList.length;
  const completedItems = shoppingList.filter(item => item.isChecked).length;
  const remainingItems = totalItems - completedItems;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const filteredShoppingList = shoppingList.filter(item => {
    if (showOnlyUnchecked && item.isChecked) return false;
    if (!searchOpen || !searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return item.name.toLowerCase().includes(query);
  });

  const groupedItems = groupShoppingListItems(filteredShoppingList, sortOption);

  const handleOpenOcado = (itemId: string) => {
    setOcadoItemId(itemId);
  };

  const handleCopyItem = (itemId: string) => {
    setCopiedItemId(itemId);
    setTimeout(() => setCopiedItemId(null), 2000);
  };

  const handleShare = () => {
    const listText = shoppingList
      .map(item => {
        const quantity = item.quantityDisplay
          || (item.consolidatedQuantity !== undefined ? String(item.consolidatedQuantity) : undefined);
        const unit = item.consolidatedUnit || item.unit;
        const qty = quantity ? " (" + quantity + (unit && unit !== "pcs" ? " " + unit : "") + ")" : "";
        return "• " + item.name + qty;
      })
      .join("\n");

    if (navigator.share) {
      navigator.share({
        title: "RealiMeali Shopping List",
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

  const handleAddItem = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const name = newItemName.trim();
    if (!name) return;
    await addCustomItem(name);
    setNewItemName("");
  };

  return (
    <div className="container max-w-3xl mx-auto py-4 px-4 pb-8 sm:py-8 sm:px-6 sm:pb-12" data-scroll-content>
      <ShoppingListHeader onShare={handleShare} onInfoClick={() => undefined} />

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
              <Link to="/household">Manage Household</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <PageControlsCard className="mb-4">
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
              <WeekSelector
                currentWeek={currentWeek}
                onWeekChange={setCurrentWeek}
                onWeekClick={() => setAllWeeksModalOpen(true)}
              />
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchOpen(value => !value)}
                  className="h-9 w-9 p-0 rounded-full"
                  title="Search shopping list"
                  aria-label="Search shopping list"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="h-9 w-9 p-0 rounded-full"
                  title="Share shopping list"
                  aria-label="Share shopping list"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {searchOpen && (
              <div className="border-t border-border/60 px-3 py-2 sm:px-4">
                <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <Input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your shopping list..."
                    aria-label="Search your shopping list"
                    className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                    className="rounded-full p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-border/60 px-4 py-3 sm:px-5">
              <div className="flex items-end justify-between gap-4 mb-2">
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {remainingItems} <span className="font-normal text-muted-foreground">
                      {remainingItems === 1 ? "item" : "items"} to buy
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {completedItems} of {totalItems} bought
                  </p>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">{progress}%</span>
              </div>
              <div
                className="h-2 w-full rounded-full bg-muted overflow-hidden"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label={progress + "% of shopping list completed"}
              >
                <div
                  className="h-full rounded-full bg-[#F5B82E] transition-all duration-500"
                  style={{ width: progress + "%" }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-border/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <div className="flex items-center gap-1 rounded-xl bg-muted/70 p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setShowOnlyUnchecked(false)}
                  className={
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors " +
                    (!showOnlyUnchecked
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground")
                  }
                  aria-pressed={!showOnlyUnchecked}
                >
                  All {totalItems}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOnlyUnchecked(true)}
                  className={
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors " +
                    (showOnlyUnchecked
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground")
                  }
                  aria-pressed={showOnlyUnchecked}
                >
                  To buy {remainingItems}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <SelectTrigger className="h-8 w-auto min-w-[120px] border-0 bg-transparent px-1 text-xs font-medium shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category">Shop by category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PageControlsCard>

          <CalendarMonthModal
            open={allWeeksModalOpen}
            onOpenChange={setAllWeeksModalOpen}
            currentWeek={currentWeek}
            onWeekSelect={setCurrentWeek}
            mealPlans={allMealPlans}
            onCopyWeek={copyWeek}
          />

          {shoppingList.length > 0 ? (
            <ShoppingListItems
              shoppingList={groupedItems}
              copiedItemId={copiedItemId}
              onToggleItem={toggleItemChecked}
              onCopyItem={handleCopyItem}
              onOcado={handleOpenOcado}
              sortOption={sortOption}
            />
          ) : (
            <ShoppingListEmptyState hasMealPlans={hasMealPlans} />
          )}

          <form
              onSubmit={handleAddItem}
              className="sticky bottom-3 z-20 mt-5 flex items-center gap-2 rounded-2xl border border-border bg-background/95 p-2 shadow-lg backdrop-blur"
            >
              <Plus className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Add an item..."
                aria-label="Add an item to the shopping list"
                className="h-10 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newItemName.trim()}
                className="h-9 rounded-xl bg-[#F5B82E] px-4 text-black hover:bg-[#e9aa20]"
              >
                Add
              </Button>
          </form>

          {ocadoItemId && shoppingList.some(item => item.id === ocadoItemId) && (
            <OcadoShoppingMode
              items={shoppingList}
              selectedItemId={ocadoItemId}
              onSelectItem={setOcadoItemId}
              onClose={() => setOcadoItemId(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
