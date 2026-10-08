import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dices, RefreshCw, Shuffle, Clock3, Heart } from "lucide-react";
import { MealType, Recipe } from "@/types";

export type MealPlanGenerationMode = "replace" | "add";
export interface GeneratedMeal { recipe: Recipe; mealType: MealType; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (meals: GeneratedMeal[], mode: MealPlanGenerationMode) => void;
  availableRecipes?: number;
  recipes: Recipe[];
  currentMealCount?: number;
}

const TYPES: { key: MealType; label: string; icon: string }[] = [
  { key: "dinner", label: "Dinners", icon: "🍝" },
  { key: "lunch", label: "Lunches", icon: "🥪" },
  { key: "breakfast", label: "Breakfasts", icon: "🍳" },
  { key: "snacks", label: "Snacks", icon: "🍿" },
  { key: "sides", label: "Sides", icon: "🥗" },
  { key: "desserts", label: "Desserts", icon: "🍰" },
  { key: "drinks", label: "Drinks", icon: "🥤" },
];
const defaults: Record<MealType, number> = { breakfast: 0, lunch: 0, dinner: 7, snacks: 0, sides: 0, desserts: 0, drinks: 0, appetizers: 0, sauce: 0 };
const typesOf = (r: Recipe): MealType[] => r.meal_types?.length ? r.meal_types : r.meal_type ? [r.meal_type] : [];

export function MealPlanQuantitiesDialog({ isOpen, onClose, onConfirm, availableRecipes = 0, recipes, currentMealCount = 0 }: Props) {
  const [quantities, setQuantities] = useState(defaults);
  const [favourites, setFavourites] = useState(true);
  const [newRecipes, setNewRecipes] = useState(true);
  const [varied, setVaried] = useState(true);
  const [quick, setQuick] = useState(false);
  const [step, setStep] = useState<"configure" | "preview">("configure");
  const [generated, setGenerated] = useState<GeneratedMeal[]>([]);
  const [mode, setMode] = useState<MealPlanGenerationMode>("add");

  const total = Object.values(quantities).reduce((a, b) => a + b, 0);
  const available = useMemo(() => Object.fromEntries(TYPES.map(t => [t.key, recipes.filter(r => typesOf(r).includes(t.key)).length])) as Record<MealType, number>, [recipes]);

  const generate = () => {
    const selected: GeneratedMeal[] = [];
    const used = new Set<string>();
    const cuisines = new Map<string, number>();

    for (const { key } of TYPES) {
      for (let i = 0; i < quantities[key]; i++) {
        const candidates = recipes.filter(r => typesOf(r).includes(key) && !used.has(r.id));
        if (!candidates.length) continue;
        const score = (r: Recipe) => {
          let s = Math.random() * 10;
          if (favourites && r.is_favorite) s += 30;
          if (newRecipes && !r.has_cooked) s += 20;
          const mins = (r.prep_time || 0) + (r.cook_time || 0);
          if (quick) s += mins <= 30 ? 25 : -25;
          const cuisine = r.cuisine_region || "";
          if (varied && cuisine) s += (cuisines.get(cuisine) || 0) === 0 ? 15 : (cuisines.get(cuisine)! >= 2 ? -15 : 0);
          return s;
        };
        const recipe = [...candidates].sort((a, b) => score(b) - score(a))[0];
        selected.push({ recipe, mealType: key });
        used.add(recipe.id);
        if (recipe.cuisine_region) cuisines.set(recipe.cuisine_region, (cuisines.get(recipe.cuisine_region) || 0) + 1);
      }
    }
    setGenerated(selected);
    setMode(currentMealCount ? "add" : "replace");
    setStep("preview");
  };

  const swap = (index: number) => {
    const meal = generated[index];
    if (!meal) return;
    const used = new Set(generated.map(m => m.recipe.id));
    const candidates = recipes.filter(r => typesOf(r).includes(meal.mealType) && !used.has(r.id));
    if (!candidates.length) return;
    const recipe = candidates[Math.floor(Math.random() * candidates.length)];
    setGenerated(prev => prev.map((m, i) => i === index ? { ...m, recipe } : m));
  };

  const reset = () => { setStep("configure"); setGenerated([]); };
  const close = () => { reset(); onClose(); };
  const update = (key: MealType, delta: number) => setQuantities(q => ({ ...q, [key]: Math.max(0, Math.min(10, q[key] + delta)) }));

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && close()}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader><DialogTitle className="text-xl">{step === "configure" ? "Generate your plan" : "Here's your plan"}</DialogTitle></DialogHeader>
        {step === "configure" ? (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">Choose how many meals you want. RealiMeali will build a varied selection from your recipes.</p>
            <div className="rounded-2xl border overflow-hidden">
              {TYPES.map(({ key, label, icon }) => (
                <div key={key} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3"><span className="text-lg">{icon}</span><div><Label>{label}</Label><p className="text-xs text-muted-foreground">{available[key] || 0} available</p></div></div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => update(key, -1)} disabled={!quantities[key]}>−</Button>
                    <span className="w-5 text-center text-sm font-semibold">{quantities[key]}</span>
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => update(key, 1)} disabled={quantities[key] >= 10}>+</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-muted/50 p-4 space-y-3">
              <p className="text-sm font-semibold">Make it smarter</p>
              {[
                ["Use favourites", "Give your favourites a boost", favourites, setFavourites],
                ["Prefer new recipes", "Prioritise meals you haven't cooked", newRecipes, setNewRecipes],
                ["Keep it varied", "Avoid repeating cuisines and recipes", varied, setVaried],
                ["Quick meals", "Prefer meals ready within 30 minutes", quick, setQuick],
              ].map(([title, desc, value, setter]) => (
                <div key={title as string} className="flex items-center justify-between">
                  <div><p className="text-sm">{title as string}</p><p className="text-xs text-muted-foreground">{desc as string}</p></div>
                  <Switch checked={value as boolean} onCheckedChange={setter as (v: boolean) => void} />
                </div>
              ))}
            </div>
            <Button className="w-full h-12 rounded-xl text-base" onClick={generate} disabled={!total || !availableRecipes}>
              <Dices className="h-4 w-4 mr-2" />Generate {total} {total === 1 ? "meal" : "meals"}
            </Button>
            {!availableRecipes && <p className="text-xs text-destructive text-center">No recipes available. Add some recipes first.</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-muted/30 p-4"><p className="text-sm font-semibold">{generated.length} meals selected</p><p className="text-xs text-muted-foreground mt-1">Nothing is added until you confirm.</p></div>
            {TYPES.map(({ key, label, icon }) => {
              const meals = generated.map((m, index) => ({ ...m, index })).filter(m => m.mealType === key);
              if (!meals.length) return null;
              return <section key={key} className="space-y-2"><h3 className="font-semibold flex items-center gap-2"><span>{icon}</span>{label}<span className="text-xs font-normal text-muted-foreground">({meals.length})</span></h3>
                {meals.map(({ recipe, index }) => <div key={recipe.id} className="flex items-center gap-3 rounded-xl border p-2.5">
                  <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-muted">{recipe.image_thumbnail || recipe.image ? <img src={recipe.image_thumbnail || recipe.image} alt="" className="h-full w-full object-cover" /> : <div className="h-full flex items-center justify-center">🍽️</div>}</div>
                  <div className="min-w-0 flex-1"><p className="font-medium text-sm truncate">{recipe.title}</p><p className="text-xs text-muted-foreground flex items-center gap-1"><Clock3 className="h-3 w-3" />{(recipe.prep_time || 0) + (recipe.cook_time || 0)} mins{recipe.is_favorite && <Heart className="h-3 w-3 fill-current ml-1" />}</p></div>
                  <Button variant="outline" size="sm" className="shrink-0" onClick={() => swap(index)}><Shuffle className="h-3.5 w-3.5 mr-1.5" />Swap</Button>
                </div>)}
              </section>;
            })}
            {generated.length < total && <p className="text-xs text-muted-foreground">Only {generated.length} suitable recipes were available.</p>}
            {currentMealCount > 0 && <div className="rounded-2xl border p-3"><p className="text-sm font-semibold mb-2">What should happen to your current plan?</p><div className="grid grid-cols-2 gap-2"><Button variant={mode === "add" ? "default" : "outline"} onClick={() => setMode("add")}>Add to plan</Button><Button variant={mode === "replace" ? "default" : "outline"} onClick={() => setMode("replace")}>Replace plan</Button></div></div>}
            <div className="flex gap-2 pt-2"><Button variant="outline" className="flex-1" onClick={reset}><RefreshCw className="h-4 w-4 mr-2" />Start again</Button><Button className="flex-1" onClick={() => onConfirm(generated, mode)} disabled={!generated.length}>Add to meal plan</Button></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
