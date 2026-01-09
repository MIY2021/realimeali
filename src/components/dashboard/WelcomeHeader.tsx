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
    <div className="relative rounded-3xl bg-gradient-to-br from-[#FFE5B4] via-[#FFDAB9] to-[#FFC8A4] p-6 shadow-lg border border-white/30 overflow-hidden h-auto min-h-[120px] flex flex-col justify-center">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#654321] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#654321] rounded-full blur-2xl" />
      </div>
      
      {/* Three-dot menu button - absolutely positioned with larger touch target */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="absolute top-3 right-3 h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:bg-[#654321]/20 active:bg-[#654321]/30 backdrop-blur-sm transition-all z-20 touch-manipulation"
        aria-label="Open menu"
      >
        <MoreHorizontal className="h-6 w-6 sm:h-7 sm:w-7 text-[#654321]" strokeWidth={2.5} />
      </Button>

      <div className="relative z-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#654321] mb-2 animate-[fade-in_1s_ease-out] whitespace-nowrap overflow-hidden text-ellipsis pr-12 sm:pr-14">
          {getTimeBasedGreeting()}, {getDisplayName()}! 👋
        </h1>
        <p className="text-sm sm:text-base text-[#654321]/90 leading-relaxed pr-8 sm:pr-10">
          {!isLoading && dailyTip && (
            <span className="animate-[fade-in_1.2s_ease-out] inline-block">
              <span className="font-bold">💡 Tip of the Day:</span> {dailyTip}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};