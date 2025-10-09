
import { 
  Book, 
  UtensilsCrossed, 
  ShoppingCart,
  Heart,
  Calendar
} from "lucide-react";
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
import { AchievementsBadges } from "@/components/dashboard/AchievementsBadges";
import { HomeOverflowMenu } from "@/components/layout/HomeOverflowMenu";

export default function Index() {
  useDocumentTitle("RealiMeali | Dashboard");
  const { showPrompt, promptTrigger, triggerPromptOnFeatureClick, closePrompt } = useLoginPrompt();
  const { user } = useAuth();
  const { stats, isLoading, hasData } = useUserStats();
  const navigate = useNavigate();

  const handleRecipesToCookClick = () => {
    navigate("/my-recipes?filter=not-cooked");
  };

  const handleMyRecipesClick = () => {
    navigate("/my-recipes");
  };

  const handleShoppingItemsClick = () => {
    navigate("/shopping-list");
  };

  const handleFavouritesClick = () => {
    navigate("/my-recipes?filter=favourites");
  };

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to RealiMeali
          </h1>
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
        
        <LoginPromptDialog 
          isOpen={showPrompt}
          onClose={closePrompt}
          trigger={promptTrigger}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fef7ef' }}>
      {/* Overflow Menu - Only on Home page */}
      <HomeOverflowMenu />
      
      <div className="container max-w-2xl mx-auto px-4 py-4 space-y-5">
        {/* Welcome Header with Daily Tip */}
        <WelcomeHeader />
        
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
            title="Shopping"
            value={stats.shoppingItemsCount}
            icon={ShoppingCart}
            isLoading={isLoading}
            variant="accent"
            onClick={handleShoppingItemsClick}
          />
          <StatsCard
            title="Favourites"
            value={stats.favoriteRecipes}
            icon={Heart}
            isLoading={isLoading}
            variant="muted"
            onClick={handleFavouritesClick}
          />
        </div>

        {/* Achievements Section */}
        <AchievementsBadges />

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
