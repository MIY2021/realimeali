import { Book, Calendar, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { LoginPromptDialog } from "@/components/auth/LoginPromptDialog";
import { useLoginPrompt } from "@/hooks/useLoginPrompt";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats } from "@/hooks/useUserStats";
import { useAchievements } from "@/hooks/useAchievements";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { getCurrentWeekKey } from "@/utils/weekUtils";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LatestRecipesInspiration } from "@/components/dashboard/LatestRecipesInspiration";
import { HomeOverflowMenu } from "@/components/layout/HomeOverflowMenu";
import { WelcomeSlidesDialog } from "@/components/onboarding/WelcomeSlidesDialog";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  useDocumentTitle("RealiMeali | Dashboard");
  const { showPrompt, promptTrigger, triggerPromptOnFeatureClick, closePrompt } = useLoginPrompt();
  const { user, isLoading: authLoading } = useAuth();
  const { stats, isLoading, hasData } = useUserStats();
  const { achievements, isLoading: achievementsLoading } = useAchievements();
  const { getMealPlansForWeek, isLoading: mealPlansLoading } = useMealPlan();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWelcomeSlides, setShowWelcomeSlides] = useState(false);
  const [isCheckingWelcome, setIsCheckingWelcome] = useState(true);

  // Calculate achievements count
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const achievementsDisplay = totalCount > 0 ? `${unlockedCount}/${totalCount}` : "0/0";

  // Get current week's meal plan count (only breakfast, lunch, and dinner)
  const currentWeekKey = useMemo(() => getCurrentWeekKey(), []);
  const currentWeekMealPlans = useMemo(() => {
    return getMealPlansForWeek(currentWeekKey);
  }, [getMealPlansForWeek, currentWeekKey]);
  const currentWeekMealCount = useMemo(() => {
    return currentWeekMealPlans.filter(
      plan => plan.meal_type === "breakfast" || 
              plan.meal_type === "lunch" || 
              plan.meal_type === "dinner"
    ).length;
  }, [currentWeekMealPlans]);

  // Auto-show welcome slides for first-time users (localStorage only)
  useEffect(() => {
    if (!user) {
      setIsCheckingWelcome(false);
      return;
    }

    const storageKey = `hasSeenWelcome_${user.id}`;
    const hasSeenWelcome = localStorage.getItem(storageKey) === "true";

    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcomeSlides(true);
      }, 500);
      setIsCheckingWelcome(false);
      return () => clearTimeout(timer);
    }

    setIsCheckingWelcome(false);
  }, [user]);

  const handleWelcomeSlidesComplete = () => {
    if (user) {
      const storageKey = `hasSeenWelcome_${user.id}`;
      localStorage.setItem(storageKey, "true");
    }
    setShowWelcomeSlides(false);
  };

  const handleMyRecipesClick = () => {
    navigate("/my-recipes");
  };

  const handleThisWeekMealPlanClick = () => {
    // Set the current week in localStorage so meal planner opens to this week
    localStorage.setItem("meal-planner-current-week", currentWeekKey);
    navigate("/meal-planner");
  };

  const handleFavouritesClick = () => {
    navigate("/my-recipes?filter=favourites");
  };

  const handleAchievementsClick = () => {
    navigate("/achievements");
  };

  // Show loading state while checking authentication or welcome status
  if (authLoading || isCheckingWelcome) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-4 space-y-5">
        <div className="h-28 w-full bg-muted animate-pulse rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to RealiMeali</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Your all-in-one meal planning and recipe management system
          </p>
          <div className="space-y-4">
            <button
              onClick={() => triggerPromptOnFeatureClick()}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>

        <LoginPromptDialog isOpen={showPrompt} onClose={closePrompt} trigger={promptTrigger} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Header with Daily Tip and Menu Button */}
        <WelcomeHeader onMenuClick={() => setMenuOpen(true)} />

        {/* Overflow Menu Drawer - controlled from WelcomeHeader button */}
        <HomeOverflowMenu
          isOpen={menuOpen}
          onOpenChange={setMenuOpen}
          onOpenWelcomeSlides={() => setShowWelcomeSlides(true)}
        />

        {/* Welcome Slides Dialog */}
        <WelcomeSlidesDialog
          open={showWelcomeSlides}
          onOpenChange={setShowWelcomeSlides}
          onComplete={handleWelcomeSlidesComplete}
        />

        {/* Stats Cards Grid - Enhanced with gradients and better visuals */}
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="My Recipes"
            value={stats.totalRecipes}
            icon={Book}
            isLoading={isLoading}
            variant="primary"
            onClick={handleMyRecipesClick}
          />
          <StatsCard
            title="This Week"
            value={`${currentWeekMealCount}|meals`}
            icon={Calendar}
            isLoading={mealPlansLoading}
            variant="secondary"
            onClick={handleThisWeekMealPlanClick}
          />
          <StatsCard
            title="Favourites"
            value={stats.favoriteRecipes}
            icon={Heart}
            isLoading={isLoading}
            variant="muted"
            onClick={handleFavouritesClick}
          />
          <StatsCard
            title="Achievements"
            value={achievementsDisplay}
            icon={Star}
            isLoading={achievementsLoading}
            variant="accent"
            onClick={handleAchievementsClick}
          />
        </div>

        {/* Recipe of the Day - Prominent Section */}
        <LatestRecipesInspiration />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity */}
        <RecentActivity isLoading={isLoading} />
      </div>
    </div>
  );
}
