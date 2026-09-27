import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { useRecipes } from "@/contexts/RecipesContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useEffect, useRef, useState } from "react";
import { RecipeSwipeDialog } from "./RecipeSwipeDialog";

export function SwipeToChoose() {
  const { recipes, isLoading } = useRecipes();
  const [open, setOpen] = useState(false);
  const historyStateAdded = useRef(false);

  useEffect(() => {
    if (!open || historyStateAdded.current) return;

    window.history.pushState({ realimealiMealPicker: true }, "", window.location.href);
    historyStateAdded.current = true;

    const handleBack = () => {
      historyStateAdded.current = false;
      setOpen(false);
    };

    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
      return;
    }

    setOpen(false);

    if (historyStateAdded.current) {
      historyStateAdded.current = false;
      window.history.back();
    }
  };

  if (isLoading || recipes.length === 0) return null;

  const imageRecipes = recipes
    .filter(recipe => recipe.image_thumbnail || recipe.image)
    .slice(0, 3);

  return (
    <>
      <div className="w-full">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Swipe to Choose</h2>
            <p className="text-sm text-gray-600">Choose a week and pick the meals you fancy</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
            <Heart className="h-5 w-5 text-terracotta" />
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="group w-full overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 text-left"
        >
          <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
            {imageRecipes.length > 0 ? (
              <div className="absolute inset-0 flex gap-1">
                <div className="relative w-[54%] overflow-hidden">
                  <img
                    src={imageRecipes[0].image_thumbnail || imageRecipes[0].image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex w-[46%] gap-1">
                  {imageRecipes.slice(1, 3).map((recipe, index) => (
                    <div key={recipe.id} className={index === 0 ? "relative w-1/2 overflow-hidden" : "relative w-1/2 overflow-hidden"}>
                      <img
                        src={recipe.image_thumbnail || recipe.image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ))}
                  {imageRecipes.length === 2 && <div className="w-1/2 bg-gray-100" />}
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-[#f2eee9] flex items-center justify-center">
                <Heart className="h-12 w-12 text-terracotta" />
              </div>
            )}

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
              <span className="inline-flex items-center gap-2 bg-white/95 px-3 py-1.5 text-xs font-bold tracking-widest text-gray-800 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-terracotta" />
                PICK YOUR MEALS
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-end justify-between gap-5">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  What do you fancy?
                </h3>
                <p className="mt-2 max-w-md text-sm sm:text-base leading-6 text-gray-600">
                  Swipe through your recipes and pick the ones you would actually eat.
                </p>
              </div>
              <div className="hidden sm:flex shrink-0 h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white group-hover:translate-x-1 transition-transform">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm font-medium text-gray-600">
                Pick your meals
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all group-hover:bg-[#cf6f55] group-hover:translate-x-1 group-hover:shadow-md">
                Start swiping
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </button>
      </div>

      <RecipeSwipeDialog open={open} onOpenChange={handleOpenChange} recipes={recipes} />
    </>
  );
}