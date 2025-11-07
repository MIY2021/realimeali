import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const WelcomeHeader = () => {
  const { user } = useAuth();
  
  // Calculate day of year (1-365)
  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  // Fetch daily tip from database
  const { data: dailyTip, isLoading } = useQuery({
    queryKey: ['daily-tip', getDayOfYear()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_cooking_tips')
        .select('tip')
        .eq('day_of_year', getDayOfYear())
        .single();
      
      if (error) throw error;
      return data?.tip || "Plan your meals ahead for a stress-free week";
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  });
  
  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Get user's first name or fall back to email
  const getDisplayName = () => {
    if (!user) return 'there';
    
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
  return 'there';
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#FFE5B4] to-[#FFDAB9] p-5 shadow-md h-24 flex flex-col justify-center overflow-hidden">
      <h1 className="text-2xl font-bold text-[#654321] mb-1 line-clamp-1">
        {getTimeBasedGreeting()}, {getDisplayName()}!
      </h1>
      <p className="text-sm text-[#654321] line-clamp-2">
        {!isLoading && dailyTip && (
          <span className="animate-fade-in inline">
            <span className="font-semibold">Top Tip:</span> {dailyTip}
          </span>
        )}
      </p>
    </div>
  );
};