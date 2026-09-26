import { Skeleton } from "@/components/ui/skeleton";
import { EnhancedAvatar } from "@/components/ui/enhanced-avatar";
import { format, startOfWeek } from "date-fns";
import { getISOWeekKey } from "@/utils/weekUtils";
import { Clock3, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHouseholdActivity } from "@/hooks/useHouseholdActivity";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  avatarTypeUiFromProfile,
  resolveProfilePhotoUrl,
} from "@/utils/resolveProfilePhotoUrl";

interface RecentActivityProps {
  isLoading?: boolean;
}

const WEEK_STORAGE_KEY = "meal-planner-current-week";

export const RecentActivity = ({ isLoading: externalLoading }: RecentActivityProps) => {
  const { user } = useAuth();
  const { activities, isLoading: activityLoading } = useHouseholdActivity();
  const { householdMembers } = useHousehold();
  const { recipes } = useRecipes();
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(3);
  
  const isLoading = externalLoading || activityLoading;

  const navigateToWeek = (plannedDate: string) => {
    const weekKey = getISOWeekKey(new Date(plannedDate));
    localStorage.setItem(WEEK_STORAGE_KEY, weekKey);
    window.scrollTo({ top: 0, behavior: 'instant' });
    navigate('/meal-planner');
  };

  const getMemberProfile = (userId: string) =>
    householdMembers.find((m) => m.user_id === userId)?.profile;

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Recent Activity
          </h2>
          <p className="text-sm text-gray-600">
            See what&apos;s been happening in your household
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
          <Clock3 className="h-5 w-5 text-terracotta" />
        </div>
      </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-sm p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayActivities = activities.slice(0, visibleCount);

  if (activities.length === 0) {
    return (
      <div className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Recent Activity
          </h2>
          <p className="text-sm text-gray-600">
            See what&apos;s been happening in your household
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
          <Clock3 className="h-5 w-5 text-terracotta" />
        </div>
      </div>
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No recent activity</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start by adding a recipe or planning a meal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Recent Activity
          </h2>
          <p className="text-sm text-gray-600">
            See what&apos;s been happening in your household
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
          <Clock3 className="h-5 w-5 text-terracotta" />
        </div>
      </div>
      <div className="space-y-3">
        {displayActivities.map((activity) => {
          const recipeId = activity.metadata?.recipeId;
          const recipe = recipeId ? recipes.find(r => r.id === recipeId) : undefined;
          const recipeSlug = recipe?.slug;
          const actorId = activity.metadata?.userId || "";
          const actorProfile = getMemberProfile(actorId);
          const authForResolve = actorId && user?.id === actorId ? user : null;
          const avatarSrc =
            resolveProfilePhotoUrl(actorProfile ?? null, authForResolve) ?? undefined;
          const avatarTypeUi = avatarTypeUiFromProfile(actorProfile ?? null);
          
          // Parse the description to extract action and recipe name
          const descriptionText = activity.description.replace(/"/g, '').replace(/ for .*$/, '').replace(/ on .*$/, '').replace(/ as .*$/, '');
          const recipeName = activity.title;
          
          // Extract action (e.g., "planned", "added recipe", etc.)
          const action = descriptionText.replace(recipeName, '').trim();

          const recipeImage = recipe?.image_thumbnail || recipe?.image;

          return (
            <div 
              key={activity.id} 
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 h-24"
            >
              <div className="flex h-full">
                {/* Content side */}
                <div className="flex-1 p-3 flex items-center gap-3 min-w-0">
                  {/* Profile picture — same rules as Settings / header (type + resolve, not raw avatar_url) */}
                  <EnhancedAvatar
                    size="sm"
                    className="h-10 w-10 flex-shrink-0 ring-2 ring-white shadow-sm"
                    src={avatarSrc}
                    avatarType={avatarTypeUi}
                    avatarData={actorProfile?.avatar_data}
                    fallbackText={activity.user}
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold text-gray-900">
                        {activity.user.split(' ')[0]}
                      </span>
                      {' '}
                      <span className="text-gray-600">
                        {action}
                      </span>
                    </p>
                    {recipeId ? (
                      <Link 
                        to={`/my-recipes/${recipeSlug || recipeId}`}
                        className="text-sm font-medium text-gray-900 hover:text-sage transition-colors line-clamp-2"
                      >
                        {recipeName}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{recipeName}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(activity.timestamp), 'd MMM')}
                      {activity.type === 'meal-plan-added' && activity.metadata?.plannedDate && (
                        <>
                          {' · '}
                          <button
                            onClick={() => navigateToWeek(activity.metadata.plannedDate)}
                            className="text-sage hover:text-sage/80 hover:underline transition-colors"
                          >
                            Week of {format(startOfWeek(new Date(activity.metadata.plannedDate), { weekStartsOn: 1 }), 'd MMM')}
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {/* Recipe image */}
                {recipeImage && (
                  <Link 
                    to={`/my-recipes/${recipeSlug || recipeId}`}
                    className="flex-shrink-0 w-24 relative group"
                  >
                    <img 
                      src={recipeImage} 
                      alt={recipeName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {(activities.length > 3 || visibleCount > 3) && (
        <div className="mt-3 flex items-center justify-center gap-3">
          {visibleCount > 3 && (
            <button 
              onClick={() => setVisibleCount(3)}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              View Less
            </button>
          )}
          {visibleCount > 3 && activities.length > visibleCount && (
            <span className="text-gray-300">·</span>
          )}
          {activities.length > visibleCount && (
            <button 
              onClick={() => setVisibleCount(prev => prev + 5)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              View More
            </button>
          )}
        </div>
      )}
    </div>
  );
};