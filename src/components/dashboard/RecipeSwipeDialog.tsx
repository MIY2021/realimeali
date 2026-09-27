import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Heart, Sparkles } from "lucide-react";
import { MealType, Recipe } from "@/types";
import { useRecipeSwipe } from "@/hooks/useRecipeSwipe";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getCurrentWeekKey, getNextWeek, formatWeekRange, parseISOWeekKey } from "@/utils/weekUtils";

interface RecipeSwipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: Recipe[];
}

export function RecipeSwipeDialog({ open, onOpenChange, recipes }: RecipeSwipeDialogProps) {
  const navigate = useNavigate();
  const {
    weekKey,
    setWeekKey,
    mealType,
    setMealType,
    remainingRecipes,
    plannedMealCount,
    isLoading,
    isSaving,
    dbAvailable,
    swipe,
  } = useRecipeSwipe(recipes);

  const [weekChosen, setWeekChosen] = useState(false);
  const [swipingStarted, setSwipingStarted] = useState(false);
  const [anotherWeekOpen, setAnotherWeekOpen] = useState(false);
  const [sessionYesCount, setSessionYesCount] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const current = remainingRecipes[0];
  const next = remainingRecipes[1];

  useEffect(() => {
    if (!open) {
      setWeekChosen(false);
      setSwipingStarted(false);
      setAnotherWeekOpen(false);
      setSessionYesCount(0);
      setDragX(0);
      setDragging(false);
    }
  }, [open]);

  // Reset the card position whenever the active recipe changes.
  // This prevents the next card inheriting the previous card's swipe transform.
  useEffect(() => {
    setDragX(0);
    setDragging(false);
  }, [current?.id]);

  const selectedWeekLabel = useMemo(() => {
    const { year, week } = parseISOWeekKey(weekKey);
    return formatWeekRange(year, week);
  }, [weekKey]);

  const thisWeek = getCurrentWeekKey();
  const nextWeek = getNextWeek(thisWeek);

  const thisWeekLabel = formatWeekRange(
    parseISOWeekKey(thisWeek).year,
    parseISOWeekKey(thisWeek).week
  );
  const nextWeekLabel = formatWeekRange(
    parseISOWeekKey(nextWeek).year,
    parseISOWeekKey(nextWeek).week
  );

  const finishMessage = "Your picks have been added to the meal plan.";
 
  const handleSwipe = async (decision: "yes" | "no") => {
    if (!current || isSaving) return;
    setDragX(decision === "yes" ? 420 : -420);
    window.setTimeout(async () => {
      const saved = await swipe(current, decision);
      if (saved && decision === "yes") {
        setSessionYesCount(count => count + 1);
      }
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
      <DialogContent className="max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-0 text-gray-900 shadow-2xl">
        <div className="flex min-h-[78vh] flex-col">
          <div className="border-b border-gray-200 bg-white px-5 py-4">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-700">
              <Sparkles className="h-4 w-4" />
              PICK YOUR MEALS
            </div>
            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {weekChosen ? "What do you fancy?" : "Choose your week"}
            </h2>
            {weekChosen ? (
              <div className="mt-1 text-sm text-gray-500">{selectedWeekLabel}</div>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                Pick a week before you start swiping.
              </p>
            )}

            {weekChosen ? (
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setWeekChosen(false)}
                  className="text-sm font-medium text-gray-600 underline underline-offset-2"
                >
                  Change week
                </button>
                <div className="text-xs text-gray-500">
                  ♥ {sessionYesCount} added · {plannedMealCount} planned
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-6">
            {!swipingStarted ? (
              <div className="w-full max-w-sm text-center">
                <h3 className="text-3xl font-bold text-gray-900">Choose a week</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Pick a week, then start swiping.
                </p>

                <div className="mt-8 space-y-3">
                  <Button
                    variant="outline"
                    className={"h-12 w-full justify-center rounded-xl text-base font-semibold " + (weekChosen && weekKey === thisWeek ? "border-terracotta bg-[#fff8f5] text-gray-900" : "border-gray-300 bg-white")}
                    onClick={() => {
                      setWeekKey(thisWeek);
                      setAnotherWeekOpen(false);
                      setWeekChosen(true);
                    }}
                  >
                    <span>This week</span>
                    <span className="ml-2 text-sm font-normal text-gray-500">{thisWeekLabel}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={"h-12 w-full justify-center rounded-xl text-base font-semibold " + (weekChosen && weekKey === nextWeek ? "border-terracotta bg-[#fff8f5] text-gray-900" : "border-gray-300 bg-white")}
                    onClick={() => {
                      setWeekKey(nextWeek);
                      setAnotherWeekOpen(false);
                      setWeekChosen(true);
                    }}
                  >
                    <span>Next week</span>
                    <span className="ml-2 text-sm font-normal text-gray-500">{nextWeekLabel}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 w-full justify-center rounded-xl border-gray-300 bg-white text-base font-semibold"
                    onClick={() => setAnotherWeekOpen(true)}
                  >
                    Another week
                  </Button>
                </div>

                {anotherWeekOpen && (
                  <div className="mt-4 text-left">
                    <label className="block text-sm font-semibold text-gray-700">
                      Select week
                      <input
                        type="week"
                        value={weekKey}
                        onChange={event => {
                          if (event.target.value) {
                            setWeekKey(event.target.value);
                            setWeekChosen(true);
                            setAnotherWeekOpen(false);
                          }
                        }}
                        className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700"
                      />
                    </label>
                  </div>
                )}

                <div className="mt-6 border-t border-gray-200 pt-5">
                  <div className="text-sm text-gray-500">
                    {weekChosen ? (
                      <>Selected: <span className="font-semibold text-gray-800">{selectedWeekLabel}</span></>
                    ) : (
                      "Select a week to continue"
                    )}
                  </div>
                  <Button
                    className="mt-3 h-12 w-full rounded-xl bg-terracotta text-base font-semibold text-white hover:bg-terracotta/90 disabled:opacity-50"
                    disabled={!weekChosen}
                    onClick={() => {
                      setSwipingStarted(true);
                      setAnotherWeekOpen(false);
                    }}
                  >
                    Start swiping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="text-center text-gray-500">Loading your choices…</div>
            ) : current ? (
              <div className="flex w-full max-w-sm flex-col">
                <div className="relative h-[54vh] w-full">
                  {next && (
                  <div className="absolute inset-x-3 top-3 bottom-0 rounded-2xl border border-gray-200 bg-white shadow-sm" />
                )}

                <div
                  key={current.id}
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
                  <div className="relative h-[58%] overflow-hidden bg-gray-100">
                    {image ? (
                      <img src={image} alt={current.title} className="h-full w-full object-cover" draggable={false} />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-5xl">🍽️</span>
                      </div>
                    )}

                    {dragX > 40 && (
                      <div className="absolute left-4 top-4 border-2 border-gray-800 bg-white px-3 py-1 text-sm font-bold uppercase tracking-widest text-terracotta shadow-sm">
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
                <div className="mt-3">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Meal type
                  </div>
                  <select
                    value={mealType}
                    onChange={event => setMealType(event.target.value as MealType)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                    aria-label="Meal type"
                  >
                    {([
                      ["breakfast", "Breakfast"],
                      ["lunch", "Lunch"],
                      ["dinner", "Dinner"],
                      ["snacks", "Snacks"],
                      ["sides", "Sides"],
                      ["desserts", "Desserts"],
                      ["drinks", "Drinks"],
                      ["appetizers", "Appetizers"],
                      ["sauce", "Sauce"],
                    ] as const satisfies ReadonlyArray<[MealType, string]>).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
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
                <p className="mt-2 text-sm font-semibold text-gray-700">♥ {sessionYesCount} {sessionYesCount === 1 ? "meal" : "meals"} added to your plan</p>
                <Button
                  className="mt-5 h-11 rounded-full bg-gray-900 px-5 text-white hover:bg-gray-800"
                  onClick={() => {
                    onOpenChange(false);
                    navigate("/meal-planner");
                  }}
                >
                  View meal plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}