import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { 
  UtensilsCrossed
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHouseholdActivity, type HouseholdActivity } from "@/hooks/useHouseholdActivity";
import { useHousehold } from "@/contexts/HouseholdContext";

interface RecentActivityProps {
  isLoading?: boolean;
}

export const RecentActivity = ({ isLoading: externalLoading }: RecentActivityProps) => {
  const { activities, isLoading: activityLoading } = useHouseholdActivity();
  const { householdMembers } = useHousehold();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);
  
  const isLoading = externalLoading || activityLoading;

  const parseActivityDescription = (activity: HouseholdActivity) => {
    const { user, description, metadata } = activity;
    
    // Extract recipe name from description (usually after verbs like "added", "edited", "cooked", etc.)
    const verbs = ['added', 'edited', 'updated', 'favorited', 'unfavorited', 'cooked', 'uncooked', 'deleted', 'restored', 'added a note to'];
    let recipeName = '';
    let action = description;
    
    for (const verb of verbs) {
      if (description.includes(verb)) {
        const parts = description.split(verb);
        if (parts.length > 1) {
          recipeName = parts[1].trim();
          action = verb;
        }
        break;
      }
    }

    return { user, action, recipeName, recipeId: metadata?.recipeId };
  };

  const getUserAvatar = (userId: string) => {
    const member = householdMembers.find(m => m.user_id === userId);
    return member?.profile?.avatar_url;
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Recent Household Activity
          </h2>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4">
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
          <h2 className="text-lg font-semibold">
            Recent Household Activity
          </h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
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
        <h2 className="text-lg font-semibold">
          Recent Household Activity
        </h2>
      </div>
      <div className="space-y-2">
        {displayActivities.map((activity) => {
          const { user, action, recipeName, recipeId } = parseActivityDescription(activity);
          const avatarUrl = getUserAvatar(activity.metadata?.userId || '');

          return (
            <div 
              key={activity.id} 
              className="bg-white rounded-xl shadow-sm p-3"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={user} />}
                  <AvatarFallback className="bg-muted">
                    {user.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">
                    <span className="font-bold text-gray-900">{user}</span>
                    {' '}
                    <span className="text-gray-700">{action}</span>
                    {recipeName && recipeId && (
                      <>
                        {' '}
                        <button
                          onClick={() => navigate(`/recipes/${recipeId}`)}
                          className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                        >
                          {recipeName}
                        </button>
                      </>
                    )}
                    {recipeName && !recipeId && (
                      <>
                        {' '}
                        <span className="text-gray-900">{recipeName}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(activity.timestamp), 'MMM d, yyyy')}
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