import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, Sparkles, X } from "lucide-react";
import { Recipe } from "@/types";
import { useRecipeSwipe } from "@/hooks/useRecipeSwipe";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RecipeSwipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: Recipe[];
}

export function RecipeSwipeDialog({ open, onOpenChange, recipes }: RecipeSwipeDialogProps) {
  const navigate = useNavigate();
  const { remainingRecipes, matchRecipes, householdMemberCount, isLoading, isSaving, dbAvailable, swipe } = useRecipeSwipe(recipes);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const current = remainingRecipes[0];
  const next = remainingRecipes[1];
  const progress = recipes.length ? Math.round(((recipes.length - remainingRecipes.length) / recipes.length) * 100) : 0;

  useEffect(() => {
    if (!open) { setDragX(0); setDragging(false); }
  }, [open]);

  const finishMessage = useMemo(() => {
    if (householdMemberCount < 2) return "Your picks are saved. When another household member swipes, shared matches will appear here.";
    if (matchRecipes.length === 0) return "No matches yet. Matches appear as you both choose recipes.";
    return matchRecipes.length + " recipe" + (matchRecipes.length === 1 ? "" : "s") + " matched for next week.";
  }, [householdMemberCount, matchRecipes.length]);

  const handleSwipe = async (decision: "yes" | "no") => {
    if (!current || isSaving) return;
    setDragX(decision === "yes" ? 420 : -420);
    window.setTimeout(async () => { await swipe(current, decision); setDragX(0); }, 180);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    startX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) setDragX(event.clientX - startX.current);
  };

  const handlePointerUp = async () => {
    if (!dragging) return;
    setDragging(false);
    if (dragX > 100) await handleSwipe("yes");
    else if (dragX < -100) await handleSwipe("no");
    else setDragX(0);
  };

  const goToRecipe = () => {
    if (current) { onOpenChange(false); navigate("/my-recipes/" + current.id); }
  };

  const image = current?.image_thumbnail || current?.image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-0 bg-slate-950 text-white rounded-[2rem]">
        <div className="min-h-[78vh] flex flex-col">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-black tracking-widest"><Sparkles className="h-4 w-4" /> SWIPE TO CHOOSE</div>
              <h2 className="text-2xl font-black mt-1">What are you fancying?</h2>
              <p className="text-white/60 text-sm">Choosing for next week's meal plan</p>
            </div>
            <div className="text-right text-xs text-white/60"><div>{remainingRecipes.length} left</div><div className="mt-1">{progress}%</div></div>
          </div>
          <div className="px-5"><div className="h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-emerald-400 transition-all" style={{ width: progress + "%" }} /></div></div>
          <div className="flex-1 flex items-center justify-center px-5 py-6">
            {isLoading ? (
              <div className="text-center text-white/60">Loading your choices…</div>
            ) : current ? (
              <div className="relative w-full max-w-sm h-[52vh]">
                {next && <div className="absolute inset-0 translate-y-3 scale-[0.96] rounded-[1.75rem] bg-white/10 border border-white/10" />}
                <div
                  className="absolute inset-0 rounded-[1.75rem] overflow-hidden bg-white text-slate-900 shadow-2xl touch-none select-none cursor-grab active:cursor-grabbing"
                  style={{ transform: "translateX(" + dragX + "px) rotate(" + dragX / 18 + "deg)", transition: dragging ? "none" : "transform 180ms ease-out" }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={() => { setDragging(false); setDragX(0); }}
                  onDoubleClick={goToRecipe}
                >
                  {image ? <img src={image} alt={current.title} className="w-full h-[62%] object-cover" draggable={false} /> : <div className="w-full h-[62%] bg-gradient-to-br from-emerald-100 to-orange-100 flex items-center justify-center text-6xl">🍽️</div>}
                  <div className="p-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">{current.cuisine_region?.replace("_", " ") || "Recipe"}</div>
                    <h3 className="text-2xl font-black mt-1 line-clamp-2">{current.title}</h3>
                    <div className="flex gap-3 mt-3 text-sm text-slate-500"><span>{current.prep_time + current.cook_time} min</span><span>•</span><span>{current.servings} servings</span></div>
                    {dragX > 40 && <div className="absolute top-5 left-5 rotate-[-10deg] rounded-xl border-4 border-emerald-400 px-3 py-1 text-emerald-400 font-black text-xl">YES</div>}
                    {dragX < -40 && <div className="absolute top-5 right-5 rotate-[10deg] rounded-xl border-4 border-red-400 px-3 py-1 text-red-400 font-black text-xl">NOPE</div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center max-w-sm">
                <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-emerald-400/15 flex items-center justify-center"><Check className="h-10 w-10 text-emerald-300" /></div>
                <h3 className="text-3xl font-black">You're done!</h3>
                <p className="mt-3 text-white/60">{finishMessage}</p>
                {matchRecipes.length > 0 && (
                  <div className="mt-6 space-y-3 text-left">
                    <div className="text-sm font-bold text-white/60">💕 MATCHES FOR NEXT WEEK</div>
                    {matchRecipes.slice(0, 6).map(recipe => (
                      <button key={recipe.id} onClick={() => { onOpenChange(false); navigate("/my-recipes/" + recipe.id); }} className="w-full flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-left hover:bg-white/15 transition">
                        {recipe.image_thumbnail || recipe.image ? <img src={recipe.image_thumbnail || recipe.image} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center">🍽️</div>}
                        <span className="font-bold">{recipe.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {current && (
            <div className="px-5 pb-6">
              <div className="flex items-center justify-center gap-5">
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-2 border-red-400/60 bg-transparent text-red-300 hover:bg-red-400/10" onClick={() => handleSwipe("no")} disabled={isSaving}><X className="h-7 w-7" /></Button>
                <Button variant="outline" className="h-12 rounded-full border-white/20 bg-white/5 px-5 text-white hover:bg-white/10" onClick={goToRecipe}>View recipe</Button>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-2 border-emerald-400/60 bg-transparent text-emerald-300 hover:bg-emerald-400/10" onClick={() => handleSwipe("yes")} disabled={isSaving}><Heart className="h-7 w-7" /></Button>
              </div>
              <div className="flex justify-between mt-3 px-4 text-xs text-white/40"><span className="flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Not this week</span><span>Tap or drag the card</span><span>Fancy it <ArrowRight className="h-3 w-3" /></span></div>
              {!dbAvailable && <p className="text-center text-amber-300/80 text-xs mt-3">Your swipe couldn't be synced yet. Please try again.</p>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
