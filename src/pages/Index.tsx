
import { 
  Book, 
  UtensilsCrossed, 
  ListChecks,
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
    <div className="min-h-screen bg-white">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <WelcomeHeader />
        </div>
        
        {/* Stats Cards Grid - 2x2 with enhanced shadows */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatsCard
            title="My Recipes"
            value={stats.totalRecipes}
            icon={Book}
            isLoading={isLoading}
            variant="primary"
            onClick={handleMyRecipesClick}
          />
          <StatsCard
            title="Recipes To Cook"
            value={stats.recipesToCook}
            icon={UtensilsCrossed}
            isLoading={isLoading}
            variant="secondary"
            onClick={handleRecipesToCookClick}
          />
          <StatsCard
            title="Shopping Items"
            value={stats.shoppingItemsCount}
            icon={ListChecks}
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

        {/* Quick Actions and Recent Activity with subtle background */}
        <div className="bg-gray-50/50 rounded-2xl py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <QuickActions />
            </div>
            <div>
              <RecentActivity
                recentRecipes={stats.recentRecipes}
                recentMealPlans={stats.recentMealPlans}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
