import { useAuth } from "@/contexts/AuthContext";
import { Lightbulb, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const dailyTips = [
  "Prep ingredients the night before to save time during busy weekdays",
  "Double your recipes and freeze half for quick future meals",
  "Use meal planning to reduce food waste and save money",
  "Try batch cooking on weekends for stress-free weeknight dinners",
  "Keep a well-stocked pantry with versatile basics",
  "Season your food in layers throughout cooking for best flavor",
  "Let meat rest after cooking for juicier results",
  "Mise en place: prep all ingredients before you start cooking",
];

export const WelcomeHeader = () => {
  const { user } = useAuth();
  const [dailyTip, setDailyTip] = useState("");
  
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

  // Get daily tip based on day of year
  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const tipIndex = dayOfYear % dailyTips.length;
    setDailyTip(dailyTips[tipIndex]);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 p-6 shadow-lg">
      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 opacity-10">
        <Sparkles className="h-32 w-32 text-orange-500" />
      </div>
      
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {getTimeBasedGreeting()}, {getDisplayName()}!
        </h1>
        
        {/* Daily Tip Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center animate-pulse-glow">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                  Tip of the Day
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {dailyTip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};