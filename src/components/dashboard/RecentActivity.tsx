import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { 
  Clock, 
  Heart, 
  UtensilsCrossed, 
  CalendarDays, 
  ChevronDown,
  Check,
  Edit,
  FileText,
  User,
  Trash2,
  RotateCcw,
  Star,
  X
} from "lucide-react";
import { useState } from "react";
import { useHouseholdActivity, type HouseholdActivity } from "@/hooks/useHouseholdActivity";

interface RecentActivityProps {
  isLoading?: boolean;
}

export const RecentActivity = ({ isLoading: externalLoading }: RecentActivityProps) => {
  const { activities, isLoading: activityLoading } = useHouseholdActivity();
  const [showMore, setShowMore] = useState(false);
  
  const isLoading = externalLoading || activityLoading;

  const getActivityIcon = (type: HouseholdActivity['type']) => {
    switch (type) {
      case 'recipe-added':
        return <UtensilsCrossed className="h-5 w-5 text-emerald-600" />;
      case 'recipe-edited':
        return <Edit className="h-5 w-5 text-blue-600" />;
      case 'recipe-favorited':
        return <Star className="h-5 w-5 text-amber-500" />;
      case 'recipe-unfavorited':
        return <X className="h-5 w-5 text-gray-500" />;
      case 'recipe-cooked':
        return <Check className="h-5 w-5 text-orange-600" />;
      case 'recipe-uncooked':
        return <Check className="h-5 w-5 text-gray-500" />;
      case 'meal-plan-added':
        return <CalendarDays className="h-5 w-5 text-sage" />;
      case 'custom-meal-added':
        return <UtensilsCrossed className="h-5 w-5 text-amber-600" />;
      case 'leftover-meal-added':
        return <UtensilsCrossed className="h-5 w-5 text-purple-600" />;
      case 'recipe-note-added':
        return <FileText className="h-5 w-5 text-indigo-600" />;
      case 'member-joined':
        return <User className="h-5 w-5 text-green-600" />;
      case 'recipe-deleted':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      case 'recipe-restored':
        return <RotateCcw className="h-5 w-5 text-green-500" />;
      default:
        return <UtensilsCrossed className="h-5 w-5 text-terracotta" />;
    }
  };

  const getActivityBgColor = (type: HouseholdActivity['type']) => {
    switch (type) {
      case 'recipe-added':
        return 'bg-emerald-500/10';
      case 'recipe-edited':
        return 'bg-blue-500/10';
      case 'recipe-favorited':
        return 'bg-amber-500/10';
      case 'recipe-unfavorited':
        return 'bg-gray-500/10';
      case 'recipe-cooked':
        return 'bg-orange-500/10';
      case 'recipe-uncooked':
        return 'bg-gray-500/10';
      case 'meal-plan-added':
        return 'bg-sage/10';
      case 'custom-meal-added':
        return 'bg-amber-500/10';
      case 'leftover-meal-added':
        return 'bg-purple-500/10';
      case 'recipe-note-added':
        return 'bg-indigo-500/10';
      case 'member-joined':
        return 'bg-green-500/10';
      case 'recipe-deleted':
        return 'bg-red-500/10';
      case 'recipe-restored':
        return 'bg-green-500/10';
      default:
        return 'bg-terracotta/10';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-sage" />
            Recent Household Activity
          </h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayActivities = activities.slice(0, showMore ? 20 : 6);

  if (activities.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-sage" />
            Recent Household Activity
          </h2>
        </div>
        <div className="text-center py-8">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
      <div className="space-y-3">
        {displayActivities.slice(0, 3).map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-start gap-3"
          >
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className={`${getActivityBgColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{activity.user}</span> {activity.description}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {format(new Date(activity.timestamp), 'MMM d')}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {activities.length > 3 && (
        <div className="mt-4 text-center">
          <button className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
            View More
          </button>
        </div>
      )}
    </div>
  );
};