import { Heart, Sparkles, Users, ArrowRight } from "lucide-react";
import { useRecipes } from "@/contexts/RecipesContext";
import { useState } from "react";
import { RecipeSwipeDialog } from "./RecipeSwipeDialog";

export function SwipeToChoose() {
  const { recipes, isLoading } = useRecipes();
  const [open, setOpen] = useState(false);
  if (isLoading || recipes.length === 0) return null;

  return (
    <>
      <div className="w-full">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Swipe to Choose</h2>
            <p className="text-sm text-gray-600">Pick your favourites for next week together</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
        </div>

        <button onClick={() => setOpen(true)} className="w-full text-left overflow-hidden rounded-3xl bg-white border border-emerald-100 shadow-md hover:shadow-xl transition-all duration-300 group">
          <div className="relative h-56 sm:h-64 overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_35%)]" />
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute left-8 bottom-5 h-24 w-24 rounded-full bg-lime-200/20 blur-2xl" />
            <div className="relative h-full p-6 sm:p-7 flex flex-col justify-between text-white">
              <div className="flex items-start justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-black tracking-wider backdrop-blur-sm"><Sparkles className="h-4 w-4" /> HOUSEHOLD PICKS</div>
                <div className="h-11 w-11 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform"><ArrowRight className="h-5 w-5" /></div>
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight">Fancy it or bin it?</h3>
                <p className="mt-2 text-white/90 max-w-md">Swipe through your recipes and find the meals everyone wants next week.</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm"><Users className="h-3.5 w-3.5" /> {recipes.length} recipes</span>
                  <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">Next week</span>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
      <RecipeSwipeDialog open={open} onOpenChange={setOpen} recipes={recipes} />
    </>
  );
}