import { Heart, Sparkles, Users } from "lucide-react";
import { useRecipes } from "@/contexts/RecipesContext";
import { useState } from "react";
import { RecipeSwipeDialog } from "./RecipeSwipeDialog";

export function SwipeToChoose() {
  const { recipes, isLoading } = useRecipes();
  const [open, setOpen] = useState(false);
  if (isLoading || recipes.length === 0) return null;

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-full text-left rounded-3xl overflow-hidden relative group bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-orange-50" />
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-32 w-32 rounded-full bg-orange-200/35 blur-3xl" />
        <div className="relative p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-black tracking-widest"><Sparkles className="h-4 w-4" /> THIS WEEK</div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">Swipe to Choose</h2>
              <p className="text-gray-600 mt-2 max-w-sm">Find the meals you and your household both fancy for next week.</p>
            </div>
            <div className="hidden sm:flex shrink-0 h-16 w-16 rounded-2xl bg-emerald-100 border border-emerald-200 items-center justify-center rotate-6 group-hover:rotate-12 transition-transform">
              <Heart className="h-8 w-8 text-emerald-600 fill-emerald-100" />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-gray-200 px-3 py-1.5"><Users className="h-4 w-4 text-emerald-600" /> Household picks</span>
            <span className="inline-flex items-center rounded-full bg-white/80 border border-gray-200 px-3 py-1.5">{recipes.length} recipes</span>
            <span className="ml-auto text-emerald-600 font-bold">Start swiping →</span>
          </div>
        </div>
      </button>
      <RecipeSwipeDialog open={open} onOpenChange={setOpen} recipes={recipes} />
    </>
  );
}
