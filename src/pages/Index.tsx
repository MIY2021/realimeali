import { Book, UtensilsCrossed, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { LoginPromptDialog } from "@/components/auth/LoginPromptDialog";
import { useLoginPrompt } from "@/hooks/useLoginPrompt";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats } from "@/hooks/useUserStats";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LatestRecipesInspiration } from "@/components/dashboard/LatestRecipesInspiration";
import { HomeOverflowMenu } from "@/components/layout/HomeOverflowMenu";
import { WelcomeSlidesDialog } from "@/components/onboarding/WelcomeSlidesDialog";
import { useState, useEffect } from "react";

export default function Index() {
  useDocumentTitle("RealiMeali | Dashboard");
  const { showPrompt, promptTrigger, triggerPromptOnFeatureClick, closePrompt } = useLoginPrompt();
  const { user, isLoading: authLoading } = useAuth();
  const { stats, isLoading, hasData } = useUserStats();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWelcomeSlides, setShowWelcomeSlides] = useState(false);

  // Auto-show welcome slides for first-time users
  useEffect(() => {
    if (user) {
      const hasSeenWelcomeKey = `hasSeenWelcome_${user.id}`;
      if (!localStorage.getItem(hasSeenWelcomeKey)) {
        // Small delay to let the page load first
        const timer = setTimeout(() => {
          setShowWelcomeSlides(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleWelcomeSlidesComplete = () => {
    if (user) {
      const hasSeenWelcomeKey = `hasSeenWelcome_${user.id}`;
      localStorage.setItem(hasSeenWelcomeKey, "true");
    }
    setShowWelcomeSlides(false);
  };

  const handleRecipesToCookClick = () => {
    navigate("/my-recipes?filter=not-cooked");
  };

  const handleMyRecipesClick = () => {
    navigate("/my-recipes");
  };

  const handleFavouritesClick = () => {
    navigate("/my-recipes?filter=favourites");
  };

  const handleAchievementsClick = () => {
    navigate("/achievements");
  };

  // Show loading state while checking authentication
  if (authLoading) {
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
    <div className="min-h-screen">
      <div className="container max-w-2xl mx-auto px-4 py-4 space-y-5">
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

        {/* Stats Cards Grid - 2x2 with white backgrounds */}
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            title="My Recipes"
            value={stats.totalRecipes}
            icon={Book}
            isLoading={isLoading}
            variant="primary"
            onClick={handleMyRecipesClick}
          />
          <StatsCard
            title="Not Cooked"
            value={stats.recipesToCook}
            icon={UtensilsCrossed}
            isLoading={isLoading}
            variant="secondary"
            onClick={handleRecipesToCookClick}
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
            value="0/45"
            icon={Star}
            isLoading={false}
            variant="accent"
            onClick={handleAchievementsClick}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity */}
        <RecentActivity isLoading={isLoading} />

        {/* Latest Recipes Inspiration */}
        <LatestRecipesInspiration />
      </div>
    </div>
  );
}
