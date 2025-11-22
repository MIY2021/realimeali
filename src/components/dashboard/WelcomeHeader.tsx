import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface WelcomeHeaderProps {
  onMenuClick: () => void;
}

export const WelcomeHeader = ({ onMenuClick }: WelcomeHeaderProps) => {
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
    <div className="relative rounded-3xl bg-gradient-to-br from-[#FFE5B4] to-[#FFDAB9] p-5 shadow-md h-28 flex flex-col justify-center">
      {/* Three-dot menu button - absolutely positioned inside yellow rectangle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="absolute top-4 right-4 h-10 w-10 rounded-full hover:bg-[#654321]/10"
      >
        <MoreHorizontal className="h-6 w-6 text-[#654321]" strokeWidth={3} />
        <span className="sr-only">Open menu</span>
      </Button>

      <h1 className="text-2xl font-bold text-[#654321] mb-1 animate-[fade-in_1s_ease-out] pr-14">
        {getTimeBasedGreeting()}, {getDisplayName()}!
      </h1>
      <p className="text-sm text-[#654321] leading-relaxed pr-14">
        {!isLoading && dailyTip && (
          <span className="animate-[fade-in_1.2s_ease-out] inline-block">
            <span className="font-semibold">Top Tip:</span> {dailyTip}
          </span>
        )}
      </p>
    </div>
  );
};