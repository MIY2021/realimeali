
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
import { LatestRecipesInspiration } from "@/components/dashboard/LatestRecipesInspiration";

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
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="mb-6">
          <WelcomeHeader />
        </div>
        
        {/* Quick Actions - 2x2 grid matching design */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <RecentActivity isLoading={isLoading} />
        </div>

        {/* Latest Recipes Inspiration */}
        <div className="mt-8">
          <LatestRecipesInspiration />
        </div>
      </div>
    </div>
  );
}
