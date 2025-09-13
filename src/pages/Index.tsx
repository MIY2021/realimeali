
import { 
  Book, 
  ListChecks,
  Heart,
  UtensilsCrossed
} from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { LoginPromptDialog } from "@/components/auth/LoginPromptDialog";
import { useLoginPrompt } from "@/hooks/useLoginPrompt";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats } from "@/hooks/useUserStats";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useNavigate } from "react-router-dom";

export default function Index() {
  useDocumentTitle("RealiMeali | Dashboard");
  const { showPrompt, promptTrigger, triggerPromptOnFeatureClick, closePrompt } = useLoginPrompt();
  const { user } = useAuth();
  const { stats, isLoading, hasData } = useUserStats();
  const navigate = useNavigate();

  const handleUncookedRecipesClick = () => {
    // Navigate to recipes page and set the showNotCookedOnly filter
    navigate('/my-recipes', { 
      state: { 
        filters: { 
          showNotCookedOnly: true 
        } 
      } 
    });
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
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-4">
        {/* Welcome Header */}
        <WelcomeHeader />
        
        {/* Stats Cards Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatsCard
            title="My Recipes"
            value={stats.totalRecipes}
            icon={Book}
            isLoading={isLoading}
            variant="primary"
          />
          <StatsCard
            title="Recipes To Cook"
            value={stats.uncookedRecipes}
            icon={UtensilsCrossed}
            isLoading={isLoading}
            variant="secondary"
            onClick={handleUncookedRecipesClick}
          />
          <StatsCard
            title="Shopping Items"
            value={stats.shoppingItemsCount}
            icon={ListChecks}
            isLoading={isLoading}
            variant="accent"
          />
          <StatsCard
            title="Favorites"
            value={stats.favoriteRecipes}
            icon={Heart}
            isLoading={isLoading}
            variant="muted"
          />
        </div>

        {/* Quick Actions and Recent Activity */}
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
  );
}
