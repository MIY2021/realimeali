
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Book, Clock, Check, Eye, Save } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalRecipes: number;
  pendingCommunityRecipes: number;
  approvedCommunityRecipes: number;
  totalViews: number;
  totalSaves: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRecipes: 0,
    pendingCommunityRecipes: 0,
    approvedCommunityRecipes: 0,
    totalViews: 0,
    totalSaves: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users (from profiles table since auth.users is not accessible)
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch total recipes
        const { count: totalRecipes } = await supabase
          .from('recipes')
          .select('*', { count: 'exact', head: true });

        // Fetch pending community recipes
        const { count: pendingCommunityRecipes } = await supabase
          .from('community_recipes')
          .select('*', { count: 'exact', head: true })
          .eq('is_approved', false)
          .eq('is_active', true);

        // Fetch approved community recipes
        const { count: approvedCommunityRecipes } = await supabase
          .from('community_recipes')
          .select('*', { count: 'exact', head: true })
          .eq('is_approved', true)
          .eq('is_active', true);

        // Fetch total views and saves from community recipes
        const { data: communityStats } = await supabase
          .from('community_recipes')
          .select('view_count, save_count');

        const totalViews = communityStats?.reduce((sum, recipe) => sum + (recipe.view_count || 0), 0) || 0;
        const totalSaves = communityStats?.reduce((sum, recipe) => sum + (recipe.save_count || 0), 0) || 0;

        setStats({
          totalUsers: totalUsers || 0,
          totalRecipes: totalRecipes || 0,
          pendingCommunityRecipes: pendingCommunityRecipes || 0,
          approvedCommunityRecipes: approvedCommunityRecipes || 0,
          totalViews,
          totalSaves,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, description }: {
    title: string;
    value: number;
    icon: any;
    description: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isLoading ? '...' : value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        icon={Users}
        description="Registered platform users"
      />
      <StatCard
        title="Total Recipes"
        value={stats.totalRecipes}
        icon={Book}
        description="User-created recipes"
      />
      <StatCard
        title="Pending Reviews"
        value={stats.pendingCommunityRecipes}
        icon={Clock}
        description="Community recipes awaiting approval"
      />
      <StatCard
        title="Approved Recipes"
        value={stats.approvedCommunityRecipes}
        icon={Check}
        description="Published community recipes"
      />
      <StatCard
        title="Total Views"
        value={stats.totalViews}
        icon={Eye}
        description="Community recipe views"
      />
      <StatCard
        title="Total Saves"
        value={stats.totalSaves}
        icon={Save}
        description="Community recipe saves"
      />
    </div>
  );
}
