import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, startOfWeek } from "date-fns";
import { getISOWeekKey } from "@/utils/weekUtils";
import { 
  UtensilsCrossed,
  Edit,
  Star,
  X,
  Check,
  CalendarDays,
  FileText,
  User,
  Trash2,
  RotateCcw
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHouseholdActivity, type HouseholdActivity } from "@/hooks/useHouseholdActivity";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";

interface RecentActivityProps {
  isLoading?: boolean;
}

const WEEK_STORAGE_KEY = "meal-planner-current-week";

export const RecentActivity = ({ isLoading: externalLoading }: RecentActivityProps) => {
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

  const getUserAvatar = (userId: string) => {
    const member = householdMembers.find(m => m.user_id === userId);
    return member?.profile?.avatar_url;
  };

  const getActivityIcon = (type: HouseholdActivity['type']) => {
    switch (type) {
      case 'recipe-added':
        return <UtensilsCrossed className="h-4 w-4 text-emerald-600" />;
      case 'recipe-edited':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'recipe-favorited':
        return <Star className="h-4 w-4 text-amber-500" />;
      case 'recipe-unfavorited':
        return <X className="h-4 w-4 text-gray-500" />;
      case 'recipe-cooked':
        return <Check className="h-4 w-4 text-orange-600" />;
      case 'recipe-uncooked':
        return <Check className="h-4 w-4 text-gray-500" />;
      case 'meal-plan-added':
        return <CalendarDays className="h-4 w-4 text-sage" />;
      case 'custom-meal-added':
        return <UtensilsCrossed className="h-4 w-4 text-amber-600" />;
      case 'leftover-meal-added':
        return <UtensilsCrossed className="h-4 w-4 text-purple-600" />;
      case 'recipe-note-added':
        return <FileText className="h-4 w-4 text-indigo-600" />;
      case 'member-joined':
        return <User className="h-4 w-4 text-green-600" />;
      case 'recipe-deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'recipe-restored':
        return <RotateCcw className="h-4 w-4 text-green-500" />;
      default:
        return <UtensilsCrossed className="h-4 w-4 text-terracotta" />;
    }
  };

  const getActivityBgColor = (type: HouseholdActivity['type']) => {
    switch (type) {
      case 'recipe-added':
        return 'bg-emerald-50';
      case 'recipe-edited':
        return 'bg-blue-50';
      case 'recipe-favorited':
        return 'bg-amber-50';
      case 'recipe-unfavorited':
        return 'bg-gray-50';
      case 'recipe-cooked':
        return 'bg-orange-50';
      case 'recipe-uncooked':
        return 'bg-gray-50';
      case 'meal-plan-added':
        return 'bg-sage/10';
      case 'custom-meal-added':
        return 'bg-amber-50';
      case 'leftover-meal-added':
        return 'bg-purple-50';
      case 'recipe-note-added':
        return 'bg-indigo-50';
      case 'member-joined':
        return 'bg-green-50';
      case 'recipe-deleted':
        return 'bg-red-50';
      case 'recipe-restored':
        return 'bg-green-50';
      default:
        return 'bg-terracotta/10';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            Recent Activity
          </h2>
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
      <div className="mb-4">
        <h2 className="text-xl font-extrabold">
          Recent Activity
        </h2>
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
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Recent Activity
        </h2>
      </div>
      <div className="space-y-3">
        {displayActivities.map((activity) => {
          const recipeId = activity.metadata?.recipeId;
          const recipe = recipeId ? recipes.find(r => r.id === recipeId) : undefined;
          const recipeSlug = recipe?.slug;
          const avatarUrl = getUserAvatar(activity.metadata?.userId || '');
          
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
                  {/* Profile picture */}
                  <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-white shadow-sm">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={activity.user} />}
                    <AvatarFallback className={`${getActivityBgColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </AvatarFallback>
                  </Avatar>
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