import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { useRecipes } from "@/contexts/RecipesContext";
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
        <button
          onClick={() => setOpen(true)}
          className="group w-full overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 text-left"
        >
          <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100">
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
                  {imageRecipes.slice(1, 3).map((recipe) => (
                    <div key={recipe.id} className="relative w-1/2 overflow-hidden">
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
                <Heart className="h-10 w-10 text-terracotta" />
              </div>
            )}

            <div className="absolute left-4 top-4">
              <span className="inline-flex items-center gap-2 bg-white/95 px-3 py-1.5 text-xs font-bold tracking-widest text-gray-800 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-terracotta" />
                PICK YOUR MEALS
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                Swipe through your recipes
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Pick the ones you fancy for your week.
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-terracotta px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all group-hover:bg-[#cf6f55] group-hover:translate-x-1">
              Start
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </button>
      </div>

      <RecipeSwipeDialog open={open} onOpenChange={handleOpenChange} recipes={recipes} />
    </>
  );
}