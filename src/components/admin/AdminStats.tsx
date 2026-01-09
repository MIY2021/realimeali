
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Book, Calendar, Home, Mail } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminStatsData {
  totalUsers: number;
  totalRecipes: number;
  totalMealPlans: number;
  totalHouseholds: number;
  totalFeedback: number;
}

export function AdminStats() {
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<AdminStatsData>({
    totalUsers: 0,
    totalRecipes: 0,
    totalMealPlans: 0,
    totalHouseholds: 0,
    totalFeedback: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all stats in parallel
        const [
          { count: totalUsers },
          { count: totalRecipes },
          { count: totalMealPlans },
          { count: totalHouseholds },
          { count: totalFeedback }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('recipes').select('*', { count: 'exact', head: true }),
          supabase.from('household_meal_plans').select('*', { count: 'exact', head: true }),
          supabase.from('households').select('*', { count: 'exact', head: true }),
          supabase.from('feedback_suggestions').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          totalUsers: totalUsers || 0,
          totalRecipes: totalRecipes || 0,
          totalMealPlans: totalMealPlans || 0,
          totalHouseholds: totalHouseholds || 0,
          totalFeedback: totalFeedback || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  return (
    <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
      <Card className={isMobile ? "shadow-sm" : ""}>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? "pb-2 px-3 pt-3" : "pb-2"}`}>
          <CardTitle className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Total Users</CardTitle>
          <Users className={`text-muted-foreground ${isMobile ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
        </CardHeader>
        <CardContent className={isMobile ? "px-3 pb-3" : ""}>
          <div className={`font-bold ${isMobile ? "text-xl" : "text-2xl"}`}>{stats.totalUsers.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className={isMobile ? "shadow-sm" : ""}>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? "pb-2 px-3 pt-3" : "pb-2"}`}>
          <CardTitle className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Total Recipes</CardTitle>
          <Book className={`text-muted-foreground ${isMobile ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
        </CardHeader>
        <CardContent className={isMobile ? "px-3 pb-3" : ""}>
          <div className={`font-bold ${isMobile ? "text-xl" : "text-2xl"}`}>{stats.totalRecipes.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className={isMobile ? "shadow-sm" : ""}>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? "pb-2 px-3 pt-3" : "pb-2"}`}>
          <CardTitle className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Total Meal Plans</CardTitle>
          <Calendar className={`text-muted-foreground ${isMobile ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
        </CardHeader>
        <CardContent className={isMobile ? "px-3 pb-3" : ""}>
          <div className={`font-bold ${isMobile ? "text-xl" : "text-2xl"}`}>{stats.totalMealPlans.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className={isMobile ? "shadow-sm" : ""}>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? "pb-2 px-3 pt-3" : "pb-2"}`}>
          <CardTitle className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Total Households</CardTitle>
          <Home className={`text-muted-foreground ${isMobile ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
        </CardHeader>
        <CardContent className={isMobile ? "px-3 pb-3" : ""}>
          <div className={`font-bold ${isMobile ? "text-xl" : "text-2xl"}`}>{stats.totalHouseholds.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className={isMobile ? "shadow-sm" : ""}>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? "pb-2 px-3 pt-3" : "pb-2"}`}>
          <CardTitle className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Total Feedback</CardTitle>
          <Mail className={`text-muted-foreground ${isMobile ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
        </CardHeader>
        <CardContent className={isMobile ? "px-3 pb-3" : ""}>
          <div className={`font-bold ${isMobile ? "text-xl" : "text-2xl"}`}>{stats.totalFeedback.toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  );
}
