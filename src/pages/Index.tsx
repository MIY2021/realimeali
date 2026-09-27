import { ArrowRight, CalendarDays, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { LoginPromptDialog } from "@/components/auth/LoginPromptDialog";
import { useLoginPrompt } from "@/hooks/useLoginPrompt";
import { useAuth } from "@/contexts/AuthContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { getCurrentWeekKey } from "@/utils/weekUtils";
import { SwipeToChoose } from "@/components/dashboard/SwipeToChoose";
import { LatestRecipesInspiration } from "@/components/dashboard/LatestRecipesInspiration";
import { HomeOverflowMenu } from "@/components/layout/HomeOverflowMenu";
import { RecipeCardIcon, MealIcon, ShoppingBasketIcon } from "@/components/icons/RealiMealiIcons";
import { WelcomeSlidesDialog } from "@/components/onboarding/WelcomeSlidesDialog";
import { sessionProfileQueryKey, useSessionProfile } from "@/hooks/useSessionProfile";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  useDocumentTitle("RealiMeali | Home");
  const { showPrompt, promptTrigger, triggerPromptOnFeatureClick, closePrompt } = useLoginPrompt();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { data: sessionProfile, isPending: sessionProfilePending, isError: sessionProfileError } = useSessionProfile();
  const { getMealPlansForWeek, getRecipeForMealPlan, isLoading: mealPlansLoading } = useMealPlan();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWelcomeSlides, setShowWelcomeSlides] = useState(false);

  const isCheckingWelcome = authLoading || (!!user && sessionProfilePending);
  const currentWeekKey = useMemo(() => getCurrentWeekKey(), []);

  const currentWeekMealPlans = useMemo(() => {
    return getMealPlansForWeek(currentWeekKey)
      .filter(plan => plan.meal_type === "breakfast" || plan.meal_type === "lunch" || plan.meal_type === "dinner")
      .sort((a, b) => {
        const dateCompare = String(a.date).localeCompare(String(b.date));
        if (dateCompare !== 0) return dateCompare;
        return (a.slot_index ?? 0) - (b.slot_index ?? 0);
      });
  }, [getMealPlansForWeek, currentWeekKey]);

  const persistWelcomeDismissed = useCallback(async () => {
    if (!user) return;
    const storageKey = `hasSeenWelcome_${user.id}`;
    localStorage.setItem(storageKey, "true");
    const { error } = await supabase.from("profiles")
      .update({ has_seen_welcome: true, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) {
      console.error("Failed to persist has_seen_welcome:", error);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: sessionProfileQueryKey(user.id) });
  }, [user, queryClient]);

  const handleWelcomeSlidesOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setShowWelcomeSlides(wasOpen => {
        if (wasOpen && user) void persistWelcomeDismissed();
        return false;
      });
      return;
    }
    setShowWelcomeSlides(true);
  }, [user, persistWelcomeDismissed]);

  useEffect(() => {
    if (!user || sessionProfilePending) return;
    const storageKey = `hasSeenWelcome_${user.id}`;
    const fromStorage = localStorage.getItem(storageKey) === "true";

    if (!sessionProfileError && sessionProfile?.has_seen_welcome === true) return;

    if (!sessionProfileError && sessionProfile && !sessionProfile.has_seen_welcome && fromStorage) {
      void (async () => {
        const { error } = await supabase.from("profiles")
          .update({ has_seen_welcome: true, updated_at: new Date().toISOString() })
          .eq("id", user.id);
        if (error) console.error("Failed to backfill has_seen_welcome:", error);
        else await queryClient.invalidateQueries({ queryKey: sessionProfileQueryKey(user.id) });
      })();
      return;
    }

    if (sessionProfileError && fromStorage) return;
    const timer = setTimeout(() => setShowWelcomeSlides(true), 500);
    return () => clearTimeout(timer);
  }, [user, sessionProfilePending, sessionProfileError, sessionProfile, queryClient]);

  if (authLoading || isCheckingWelcome) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="h-16 w-full bg-muted animate-pulse rounded-2xl" />
        <div className="h-36 w-full bg-muted animate-pulse rounded-2xl" />
        <div className="h-20 w-full bg-muted animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Welcome to RealiMeali</h1>
          <p className="text-muted-foreground text-lg mb-8">Your all-in-one meal planning and recipe management system</p>
          <button
            onClick={() => triggerPromptOnFeatureClick()}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Get Started
          </button>
        </div>
        <LoginPromptDialog isOpen={showPrompt} onClose={closePrompt} trigger={promptTrigger} />
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";
  const mealCount = currentWeekMealPlans.length;
  const previewMeals = currentWeekMealPlans.slice(0, 5);
  const mealTypeLabel = (type: string) => type === "breakfast" ? "Breakfast" : type === "lunch" ? "Lunch" : "Dinner";

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="container max-w-2xl mx-auto px-4 py-5 pb-10">
        <HomeOverflowMenu isOpen={menuOpen} onOpenChange={setMenuOpen} onOpenWelcomeSlides={() => setShowWelcomeSlides(true)} />
        <WelcomeSlidesDialog open={showWelcomeSlides} onOpenChange={handleWelcomeSlidesOpenChange} onComplete={() => {}} />

        <header className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <ChefHat className="h-11 w-11 shrink-0 text-[#b85f49]" strokeWidth={2.2} aria-label="RealiMeali" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">What are we cooking, {displayName}?</h1>
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl leading-none">⋯</span>
          </button>
        </header>

        <section aria-labelledby="your-week-heading" className="mb-7">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b85f49]">Your week</p>
              <h2 id="your-week-heading" className="mt-1 text-xl font-bold text-gray-900">{mealCount} {mealCount === 1 ? "meal" : "meals"} planned</h2>
            </div>
            <button
              onClick={() => {
                localStorage.setItem("meal-planner-current-week", currentWeekKey);
                navigate("/meal-planner");
              }}
              className="text-sm font-semibold text-gray-700 hover:text-[#b85f49] inline-flex items-center gap-1"
            >
              View meal plan <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {mealPlansLoading ? (
            <div className="h-24 rounded-2xl bg-white border border-gray-200 animate-pulse" />
          ) : previewMeals.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {previewMeals.map(plan => {
                const recipe = getRecipeForMealPlan(plan);
                const image = recipe?.image_thumbnail || recipe?.image;
                return (
                  <button key={plan.id} onClick={() => {
                    localStorage.setItem("meal-planner-current-week", currentWeekKey);
                    navigate("/meal-planner");
                  }} className="shrink-0 w-[112px] text-left group">
                    <div className="h-24 rounded-xl overflow-hidden bg-[#eeeae5] border border-gray-200">
                      {image ? <img src={image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" /> :
                        <div className="h-full flex items-center justify-center text-[#b85f49]"><CalendarDays className="h-6 w-6" /></div>}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-900 truncate">{recipe?.title || "Planned meal"}</p>
                    <p className="text-xs text-gray-500">{mealTypeLabel(plan.meal_type)}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <button onClick={() => navigate("/meal-planner")} className="w-full rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-left hover:border-[#b85f49] transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-[#f4e4df] flex items-center justify-center text-[#b85f49]"><CalendarDays className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold text-gray-900">Your week is empty</p>
                  <p className="text-sm text-gray-500">Start planning some meals →</p>
                </div>
              </div>
            </button>
          )}
        </section>

        <section aria-labelledby="quick-actions-heading" className="mb-8">
          <h2 id="quick-actions-heading" className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500 mb-3">Quick actions</h2>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => navigate("/my-recipes/new")} className="min-h-[74px] rounded-xl border border-gray-200 bg-white px-3 py-3 text-left hover:border-[#b85f49] transition-colors">
              <RecipeCardIcon className="h-5 w-5 text-[#b85f49] mb-2" />
              <span className="block text-sm font-semibold text-gray-900">Add recipe</span>
            </button>
            <button onClick={() => document.getElementById("meal-picker")?.scrollIntoView({ behavior: "smooth" })} className="min-h-[74px] rounded-xl border border-gray-200 bg-white px-3 py-3 text-left hover:border-[#b85f49] transition-colors">
              <MealIcon className="h-5 w-5 text-[#b85f49] mb-2" />
              <span className="block text-sm font-semibold text-gray-900">Pick meals</span>
            </button>
            <button onClick={() => navigate("/shopping-list")} className="min-h-[74px] rounded-xl border border-gray-200 bg-white px-3 py-3 text-left hover:border-[#b85f49] transition-colors">
              <ShoppingBasketIcon className="h-5 w-5 text-[#b85f49] mb-2" />
              <span className="block text-sm font-semibold text-gray-900">Shopping list</span>
            </button>
          </div>
        </section>

        <section className="border-t border-gray-200 pt-7 mb-8" aria-labelledby="inspiration-heading">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b85f49]">Need some inspiration?</p>
            <h2 id="inspiration-heading" className="mt-1 text-xl font-bold text-gray-900">Fancy this?</h2>
          </div>
          <LatestRecipesInspiration />
        </section>

        <section id="meal-picker" className="border-t border-gray-200 pt-7" aria-labelledby="picker-heading">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b85f49]">Fancy something different?</p>
            <h2 id="picker-heading" className="mt-1 text-xl font-bold text-gray-900">Pick your meals</h2>
          </div>
          <SwipeToChoose />
        </section>
      </div>
    </div>
  );
}
