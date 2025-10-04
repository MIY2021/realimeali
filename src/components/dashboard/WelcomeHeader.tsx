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
    <div className="rounded-2xl bg-[#FFDD6B] p-5 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {getTimeBasedGreeting()}, {getDisplayName()}!
      </h1>
      <p className="text-sm text-gray-700">
        <span className="font-semibold">Top Tip:</span> {dailyTip}
      </p>
    </div>
  );
};