import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";

export const WelcomeHeader = () => {
  const { user } = useAuth();
  
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
    <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-3xl p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-amber-900 mb-2">
        {getTimeBasedGreeting()}, {getDisplayName()}!
      </h1>
      <p className="text-sm text-amber-800">
        <span className="font-semibold">Top Tip:</span> Soak your cashews to make the creamiest sauces.
      </p>
    </div>
  );
};