import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { format } from "date-fns";

export const WelcomeHeader = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  
  const today = format(new Date(), 'EEEE, MMMM d');
  
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
    <div className="space-y-2">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {getDisplayName()}!
        </h1>
        <p className="text-muted-foreground text-lg">
          {today}
        </p>
      </div>
      
      {currentHousehold && (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-sage" />
          <span className="text-sm text-muted-foreground">
            Managing {currentHousehold.name}
          </span>
        </div>
      )}
    </div>
  );
};