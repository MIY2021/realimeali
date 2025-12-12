import { Book, UtensilsCrossed, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { LoginPromptDialog } from "@/components/auth/LoginPromptDialog";
import { useLoginPrompt } from "@/hooks/useLoginPrompt";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats } from "@/hooks/useUserStats";
import { useAchievements } from "@/hooks/useAchievements";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LatestRecipesInspiration } from "@/components/dashboard/LatestRecipesInspiration";
import { HomeOverflowMenu } from "@/components/layout/HomeOverflowMenu";
import { WelcomeSlidesDialog } from "@/components/onboarding/WelcomeSlidesDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  useDocumentTitle("RealiMeali | Dashboard");
  const { showPrompt, promptTrigger, triggerPromptOnFeatureClick, closePrompt } = useLoginPrompt();
  const { user, isLoading: authLoading } = useAuth();
  const { stats, isLoading, hasData } = useUserStats();
  const { achievements, isLoading: achievementsLoading } = useAchievements();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWelcomeSlides, setShowWelcomeSlides] = useState(false);
  const [isCheckingWelcome, setIsCheckingWelcome] = useState(true);

  // Calculate achievements count
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const achievementsDisplay = totalCount > 0 ? `${unlockedCount}/${totalCount}` : "0/0";

  // Auto-show welcome slides for first-time users
  useEffect(() => {
    const checkWelcomeStatus = async () => {
      if (!user) {
        setIsCheckingWelcome(false);
        return;
      }

      const storageKey = `hasSeenWelcome_${user.id}`;
      const cachedValue = localStorage.getItem(storageKey);

      // Fast path: If localStorage says "seen", trust it (but verify in background)
      if (cachedValue === "true") {
        setIsCheckingWelcome(false);
        
        // Optional: Verify with database in background (non-blocking)
        verifyWithDatabase(user.id, storageKey);
        return;
      }

      // Slow path: localStorage is empty (new device) - MUST check database
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('has_seen_welcome')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking welcome status:', error);
          // If DB check fails, default to showing welcome (safe default)
          setIsCheckingWelcome(false);
          return;
        }

        const hasSeenWelcome = data?.has_seen_welcome ?? false;
        
        // Update localStorage cache based on database result
        if (hasSeenWelcome) {
          localStorage.setItem(storageKey, "true");
        }

        // Show welcome slides if user hasn't seen them
        if (!hasSeenWelcome) {
          const timer = setTimeout(() => {
            setShowWelcomeSlides(true);
          }, 500);
          setIsCheckingWelcome(false);
          return () => clearTimeout(timer);
        }

        setIsCheckingWelcome(false);
      } catch (error) {
        console.error('Error checking welcome status:', error);
        setIsCheckingWelcome(false);
      }
    };

    checkWelcomeStatus();
  }, [user]);

  const handleWelcomeSlidesComplete = async () => {
    if (user) {
      const storageKey = `hasSeenWelcome_${user.id}`;
      
      // Update localStorage immediately (optimistic update)
      localStorage.setItem(storageKey, "true");
      
      // Update database (critical for cross-device sync)
      try {
        await supabase
          .from('profiles')
          .update({ has_seen_welcome: true })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating welcome status:', error);
        // Don't fail silently - maybe show a toast or retry?
      }
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

// Helper function to verify localStorage with database (non-blocking)
async function verifyWithDatabase(userId: string, storageKey: string) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('has_seen_welcome')
      .eq('id', userId)
      .single();

    // If database says not seen, but localStorage says seen, fix localStorage
    if (data && !data.has_seen_welcome) {
      localStorage.removeItem(storageKey);
    }
    // If database says seen, ensure localStorage is set (in case it was cleared)
    else if (data?.has_seen_welcome) {
      localStorage.setItem(storageKey, "true");
    }
  } catch (error) {
    // Non-critical, don't log or throw
  }
}
