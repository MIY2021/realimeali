
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Book } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalRecipes: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRecipes: 0,
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

        setStats({
          totalUsers: totalUsers || 0,
          totalRecipes: totalRecipes || 0,
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
    <div className="grid gap-6 md:grid-cols-2">
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
    </div>
  );
}
