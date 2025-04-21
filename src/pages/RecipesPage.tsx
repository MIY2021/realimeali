import { useState } from "react";
import { RecipeList } from "@/components/recipes/RecipeList";
import { Button } from "@/components/ui/button";
import { Plus, Book } from "lucide-react";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";
import { RecipeCategory, Recipe, MealType } from "@/types";
import { mockRecipes } from "@/data/recipes";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";

const MEAL_TYPES: MealType[] = ["dinner", "lunch", "breakfast"];
const SORTS = [
  { label: "Title (A-Z)", value: "title-asc" },
  { label: "Title (Z-A)", value: "title-desc" },
  { label: "Prep Time (Shortest)", value: "prep-asc" },
  { label: "Prep Time (Longest)", value: "prep-desc" },
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState(mockRecipes);
  const { toast } = useToast();

  // --- Add-to-meal plan state
  const [addToMealRecipe, setAddToMealRecipe] = useState<Recipe | null>(null);
  const [showMealTypeDialog, setShowMealTypeDialog] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);

  // Sorting state
  const [sortType, setSortType] = useState<string>("title-asc");

  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        try {
          const rows = results.data as string[][];
          const [headers, ...dataRows] = rows;
          const headerMap: Record<string, number> = {};
          headers.forEach((h, idx) => {
            headerMap[h.trim()] = idx;
          });
          const newRecipes: Recipe[] = dataRows
            .filter(r => r.length > 1 && !!r[headerMap.title])
            .map((r, i) => {
              let categories: RecipeCategory[] = [];
              if (headerMap.categories !== undefined && r[headerMap.categories]) {
                categories = r[headerMap.categories].split(",").map((c) => c.trim()) as RecipeCategory[];
              }
              return {
                id: `imported-${Date.now()}-${i}`,
                title: r[headerMap.title] || "Untitled",
                description: r[headerMap.description] || "",
                ingredients: (r[headerMap.ingredients] || "").split("|").map(s => s.trim()).filter(Boolean),
                instructions: (r[headerMap.instructions] || "").split("|").map(s => s.trim()).filter(Boolean),
                categories: categories.filter((c): c is RecipeCategory => !!c && [
                  "Bulk",
                  "Easy",
                  "Cheap",
                  "Healthy",
                  "Vegetarian",
                  "Fish",
                  "Super Tasty",
                  "Pasta",
                  "Tapas",
                  "Winter",
                  "BBQ",
                  "Faffy",
                  "Pricey!",
                  "Not Yet Made"
                ].includes(c)),
                prepTime: parseInt(r[headerMap.prepTime] || "0", 10),
                cookTime: parseInt(r[headerMap.cookTime] || "0", 10),
                servings: parseInt(r[headerMap.servings] || "1", 10),
                image: r[headerMap.image],
                createdBy: "user-1",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isFavorite: r[headerMap.isFavorite]?.toLowerCase() === "true",
              };
            });
          setRecipes((prev) => [...prev, ...newRecipes]);
          toast({
            title: "Meals Imported",
            description: `${newRecipes.length} recipes have been imported from CSV.`,
          });
        } catch (error) {
          toast({
            title: "Import Error",
            description: "Failed to parse or import CSV. Please check your file.",
            variant: "destructive",
          });
        }
      },
      error: () => {
        toast({
          title: "Import Error",
          description: "An error occurred while reading the file.",
          variant: "destructive",
        });
      },
      skipEmptyLines: true,
    });
  };

  const handleAddNewRecipe = () => {
    toast({
      title: "Coming Soon",
      description: "Recipe creation will be available in a future update.",
    });
  };

  // --- New: Add-to-meal plan, week selection ---
  const [addToMealWeek, setAddToMealWeek] = useState<1 | 2 | null>(null);

  // Update: When user opens Add to Meal Plan dialog, reset week
  const handleAddToMealPlan = (recipe: Recipe) => {
    setAddToMealRecipe(recipe);
    setShowMealTypeDialog(true);
    setSelectedMealType(null);
    setAddToMealWeek(null);
  };

  // Update: When user selects meal type, require week selection first
  const handleSelectMealType = (mealType: MealType) => {
    if (!addToMealWeek) {
      toast({
        title: "Select Week",
        description: "Please select which week to add this meal to.",
        variant: "destructive"
      });
      return;
    }
    if (addToMealRecipe) {
      toast({
        title: "Recipe Added",
        description: `Added ${addToMealRecipe.title} to your ${mealType} meal plan (Week ${addToMealWeek})!`,
      });
    }
    setAddToMealRecipe(null);
    setShowMealTypeDialog(false);
    setSelectedMealType(null);
    setAddToMealWeek(null);
  };

  return (
    <div className="container max-w-3xl py-6">
      <div className="flex items-center justify-between mb-8 gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Book className="h-6 w-6" />
            Recipes
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse all your favorite recipes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-terracotta hover:bg-terracotta/90" onClick={handleAddNewRecipe}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Recipe
          </Button>
        </div>
      </div>
      <div className="flex mb-4 items-center gap-4">
        <label className="font-semibold">Sort by:</label>
        <select
          className="border p-2 rounded"
          value={sortType}
          onChange={e => setSortType(e.target.value)}
        >
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <RecipeList
        recipes={
          [...recipes].sort((a, b) => {
            if (sortType === "title-asc") { return a.title.localeCompare(b.title);}
            if (sortType === "title-desc") { return b.title.localeCompare(a.title);}
            if (sortType === "prep-asc") { return a.prepTime - b.prepTime;}
            if (sortType === "prep-desc") { return b.prepTime - a.prepTime;}
            return 0;
          })
        }
        onAddToMealPlan={handleAddToMealPlan}
      />

      {/* --- Updated dialog with week selection --- */}
      <Dialog open={showMealTypeDialog && !!addToMealRecipe} onOpenChange={open => !open && setShowMealTypeDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add to Meal Plan
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <div className="text-lg font-semibold">{addToMealRecipe?.title}</div>
            <div className="text-sm text-muted-foreground">{addToMealRecipe?.description}</div>
          </div>
          <div className="flex flex-col gap-2 mb-2">
            <label className="font-semibold text-sm mb-1">Select Week</label>
            <div className="flex gap-2">
              {[1, 2].map((wk) => (
                <Button
                  key={wk}
                  variant={addToMealWeek === wk ? "default" : "outline"}
                  className={addToMealWeek === wk ? "bg-terracotta text-white" : ""}
                  onClick={() => setAddToMealWeek(wk as 1 | 2)}
                >
                  Week {wk}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {MEAL_TYPES.map(type => (
              <Button key={type} onClick={() => handleSelectMealType(type)}>
                Add to {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
            <Button variant="outline" onClick={() => setShowMealTypeDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
