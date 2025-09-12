import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Recipe, MealPlan } from "@/types";
import { format } from "date-fns";
import { Clock, Heart, UtensilsCrossed, CalendarDays } from "lucide-react";

interface RecentActivityProps {
  recentRecipes: (Recipe & { creatorName: string })[];
  recentMealPlans: (MealPlan & { creatorName: string })[];
  isLoading: boolean;
}

export const RecentActivity = ({ 
  recentRecipes, 
  recentMealPlans, 
  isLoading 
}: RecentActivityProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    );
  }

  const activities = [
    ...recentRecipes.slice(0, 3).map(recipe => ({
      id: recipe.id,
      type: 'recipe' as const,
      title: recipe.title,
      time: recipe.created_at,
      isFavorite: recipe.is_favorite,
      action: 'added',
      user: recipe.creatorName,
    })),
    ...recentMealPlans.slice(0, 2).map(plan => ({
      id: plan.id,
      type: 'meal' as const,
      title: plan.meal_name || 'Meal Plan',
      time: plan.created_at || '',
      day: new Date(plan.date).toLocaleDateString('en-US', { weekday: 'short' }),
      action: 'planned',
      user: plan.creatorName,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start by adding a recipe or planning a meal
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {activity.type === 'recipe' ? (
                  <div className="h-10 w-10 rounded-full bg-terracotta/10 flex items-center justify-center">
                    <UtensilsCrossed className="h-5 w-5 text-terracotta" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-sage/10 flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-sage" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  {activity.type === 'recipe' && activity.isFavorite && (
                    <Heart className="h-3 w-3 text-terracotta fill-current" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {activity.action} by {activity.user} • {format(new Date(activity.time), 'MMM d')}
                  </p>
                  {activity.type === 'meal' && activity.day && (
                    <Badge variant="secondary" className="text-xs">
                      {activity.day}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};