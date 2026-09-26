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
  const {
    remainingRecipes,
    matchRecipes,
    householdMemberCount,
    isLoading,
    isSaving,
    dbAvailable,
    swipe,
  } = useRecipeSwipe(recipes);

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const current = remainingRecipes[0];
  const next = remainingRecipes[1];
  const progress = recipes.length
    ? Math.round(((recipes.length - remainingRecipes.length) / recipes.length) * 100)
    : 0;

  useEffect(() => {
    if (!open) {
      setDragX(0);
      setDragging(false);
    }
  }, [open]);

  const finishMessage = useMemo(() => {
    if (householdMemberCount < 2) {
      return "Your picks are saved. When another household member swipes, shared matches will appear here.";
    }
    if (matchRecipes.length === 0) {
      return "No matches yet. Matches appear as you both choose recipes.";
    }
    return matchRecipes.length + " recipe" + (matchRecipes.length === 1 ? "" : "s") + " matched for next week.";
  }, [householdMemberCount, matchRecipes.length]);

  const handleSwipe = async (decision: "yes" | "no") => {
    if (!current || isSaving) return;
    setDragX(decision === "yes" ? 420 : -420);
    window.setTimeout(async () => {
      await swipe(current, decision);
      setDragX(0);
    }, 180);
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
    if (current) {
      onOpenChange(false);
      navigate("/my-recipes/" + current.id);
    }
  };

  const image = current?.image_thumbnail || current?.image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-[#faf8f5] p-0 text-gray-900 shadow-2xl">
        <div className="flex min-h-[78vh] flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-terracotta">
                <Sparkles className="h-4 w-4" />
                NEXT WEEK
              </div>
              <h2 className="mt-1 text-xl font-bold text-gray-900">What do we fancy?</h2>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">{remainingRecipes.length} left</div>
              <div className="mt-1 text-xs text-gray-500">{progress}% picked</div>
            </div>
          </div>

          <div className="h-1 bg-gray-200">
            <div className="h-full bg-terracotta transition-all" style={{ width: progress + "%" }} />
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-6">
            {isLoading ? (
              <div className="text-center text-gray-500">Loading your choices…</div>
            ) : current ? (
              <div className="relative h-[54vh] w-full max-w-sm">
                {next && (
                  <div className="absolute inset-x-3 top-3 bottom-0 rounded-2xl border border-gray-200 bg-white shadow-sm" />
                )}

                <div
                  className="absolute inset-0 cursor-grab touch-none select-none overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg active:cursor-grabbing"
                  style={{
                    transform: "translateX(" + dragX + "px) rotate(" + dragX / 22 + "deg)",
                    transition: dragging ? "none" : "transform 180ms ease-out",
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={() => {
                    setDragging(false);
                    setDragX(0);
                  }}
                  onDoubleClick={goToRecipe}
                >
                  <div className="relative h-[58%] overflow-hidden bg-[#f2eee9]">
                    {image ? (
                      <img src={image} alt={current.title} className="h-full w-full object-cover" draggable={false} />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-5xl">🍽️</span>
                      </div>
                    )}

                    {dragX > 40 && (
                      <div className="absolute left-4 top-4 border-2 border-terracotta bg-white px-3 py-1 text-sm font-bold uppercase tracking-widest text-terracotta shadow-sm">
                        Fancy it
                      </div>
                    )}
                    {dragX < -40 && (
                      <div className="absolute right-4 top-4 border-2 border-gray-800 bg-white px-3 py-1 text-sm font-bold uppercase tracking-widest text-gray-800 shadow-sm">
                        Skip
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-terracotta">
                      {current.cuisine_region?.replace("_", " ") || "Recipe"}
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-2xl font-bold text-gray-900">{current.title}</h3>
                    <div className="mt-3 flex gap-3 text-sm text-gray-500">
                      <span>{current.prep_time + current.cook_time} min</span>
                      <span>•</span>
                      <span>{current.servings} servings</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f2eee9]">
                  <Check className="h-8 w-8 text-terracotta" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">All done.</h3>
                <p className="mt-3 text-gray-500">{finishMessage}</p>
                {matchRecipes.length > 0 && (
                  <div className="mt-6 space-y-3 text-left">
                    <div className="text-xs font-bold tracking-widest text-gray-500">MATCHES FOR NEXT WEEK</div>
                    {matchRecipes.slice(0, 6).map(recipe => (
                      <button
                        key={recipe.id}
                        onClick={() => {
                          onOpenChange(false);
                          navigate("/my-recipes/" + recipe.id);
                        }}
                        className="flex w-full items-center gap-3 border-b border-gray-200 bg-white p-3 text-left transition hover:bg-gray-50"
                      >
                        {recipe.image_thumbnail || recipe.image ? (
                          <img src={recipe.image_thumbnail || recipe.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#f2eee9]">🍽️</div>
                        )}
                        <span className="font-bold text-gray-900">{recipe.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {current && (
            <div className="border-t border-gray-200 bg-white px-5 pb-5 pt-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-gray-300 bg-white px-5 text-gray-700 hover:bg-gray-50"
                  onClick={() => handleSwipe("no")}
                  disabled={isSaving}
                >
                  <X className="mr-2 h-4 w-4" />
                  Skip
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-gray-300 bg-white px-5 text-gray-700 hover:bg-gray-50"
                  onClick={goToRecipe}
                >
                  View recipe
                </Button>
                <Button
                  className="h-12 rounded-full bg-terracotta px-5 text-white hover:bg-terracotta/90"
                  onClick={() => handleSwipe("yes")}
                  disabled={isSaving}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Fancy it
                </Button>
              </div>
              <div className="mt-3 flex justify-center gap-1 text-xs text-gray-400">
                <span>Drag the card left or right</span>
                <ArrowLeft className="h-3 w-3" />
                <ArrowRight className="h-3 w-3" />
              </div>
              {!dbAvailable && (
                <p className="mt-3 text-center text-xs text-amber-600">
                  Your swipe couldn't be synced yet. Please try again.
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}