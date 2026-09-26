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
      <button onClick={() => setOpen(true)} className="w-full text-left rounded-[2rem] overflow-hidden relative group shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-32 w-32 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="relative p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-black tracking-widest"><Sparkles className="h-4 w-4" /> NEW THIS WEEK</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">Swipe to Choose</h2>
              <p className="text-white/65 mt-2 max-w-sm">Swipe through your household recipes and find the meals you both fancy.</p>
            </div>
            <div className="hidden sm:flex shrink-0 h-16 w-16 rounded-2xl bg-white/10 border border-white/10 items-center justify-center rotate-6 group-hover:rotate-12 transition-transform"><Heart className="h-8 w-8 text-emerald-300 fill-emerald-300/20" /></div>
          </div>
          <div className="mt-5 flex items-center gap-3 text-sm text-white/70">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><Users className="h-4 w-4" /> Household picks</span>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5">{recipes.length} recipes</span>
            <span className="ml-auto text-emerald-300 font-bold">Start swiping →</span>
          </div>
        </div>
      </button>
      <RecipeSwipeDialog open={open} onOpenChange={setOpen} recipes={recipes} />
    </>
  );
}
