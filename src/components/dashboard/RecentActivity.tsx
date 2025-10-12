import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
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
import { useNavigate, Link } from "react-router-dom";
import { useHouseholdActivity, type HouseholdActivity } from "@/hooks/useHouseholdActivity";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipes } from "@/contexts/RecipesContext";

interface RecentActivityProps {
  isLoading?: boolean;
}

export const RecentActivity = ({ isLoading: externalLoading }: RecentActivityProps) => {
  const { activities, isLoading: activityLoading } = useHouseholdActivity();
  const { householdMembers } = useHousehold();
  const { recipes } = useRecipes();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);
  
  const isLoading = externalLoading || activityLoading;

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
          <h2 className="text-xl font-extrabold">
            Recent Household Activity
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

  const displayActivities = activities.slice(0, showMore ? 20 : 3);

  if (activities.length === 0) {
    return (
      <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-extrabold">
          Recent Household Activity
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
        <h2 className="text-xl font-extrabold">
          Recent Household Activity
        </h2>
      </div>
      <div className="space-y-2">
        {displayActivities.map((activity) => {
          const avatarUrl = getUserAvatar(activity.metadata?.userId || '');
          const recipeId = activity.metadata?.recipeId;
          const recipe = recipeId ? recipes.find(r => r.id === recipeId) : undefined;
          const recipeSlug = recipe?.slug;
          
          // Parse the description to extract action and recipe name
          const descriptionText = activity.description.replace(/"/g, '').replace(/ for .*$/, '').replace(/ on .*$/, '').replace(/ as .*$/, '');
          const recipeName = activity.title;
          
          // Extract action (e.g., "planned", "added recipe", etc.)
          const action = descriptionText.replace(recipeName, '').trim();

          return (
            <div 
              key={activity.id} 
              className="bg-white rounded-3xl shadow-sm p-3"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={activity.user} />}
                  <AvatarFallback className={getActivityBgColor(activity.type)}>
                    {getActivityIcon(activity.type)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">
                    <span className="font-bold text-gray-900">
                      {activity.user.split(' ')[0]}
                    </span>
                    {' '}
                    <span className="text-gray-700">
                      {action}{' '}
                      {recipeId ? (
                        <Link 
                          to={`/my-recipes/${recipeSlug || recipeId}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {recipeName}
                        </Link>
                      ) : (
                        <span className="text-gray-900">{recipeName}</span>
                      )}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {activities.length > 3 && (
        <div className="mt-3 text-center">
          <button 
            onClick={() => setShowMore(!showMore)}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            {showMore ? 'View Less' : 'View More'}
          </button>
        </div>
      )}
    </div>
  );
};