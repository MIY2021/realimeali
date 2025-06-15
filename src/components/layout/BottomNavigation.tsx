
import { Link, useLocation } from "react-router-dom";
import { Book, Search, CalendarDays, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const BottomNavigation = () => {
  const location = useLocation();
  const [flashMealPlan, setFlashMealPlan] = useState(false);
  
  const navigationItems = [
    { 
      to: "/my-recipes", 
      icon: Book, 
      label: "My Recipes",
      activePattern: /^\/my-recipes/
    },
    { 
      to: "/find-recipes", 
      icon: Search, 
      label: "Find Recipes",
      activePattern: /^\/find-recipes/
    },
    { 
      to: "/meal-planner", 
      icon: CalendarDays, 
      label: "Meal Plan",
      activePattern: /^\/meal-planner/
    },
    { 
      to: "/shopping-list", 
      icon: ListChecks, 
      label: "Shopping List",
      activePattern: /^\/shopping-list/
    },
  ];

  // Listen for meal plan flash events
  useEffect(() => {
    const handleFlashMealPlan = () => {
      setFlashMealPlan(true);
      setTimeout(() => setFlashMealPlan(false), 2000); // Extended to 2 seconds
    };

    window.addEventListener('flash-meal-plan', handleFlashMealPlan);
    return () => window.removeEventListener('flash-meal-plan', handleFlashMealPlan);
  }, []);

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  const handleNavClick = () => {
    // Scroll to top when navigation item is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Confetti component
  const Confetti = () => {
    const confettiPieces = Array.from({ length: 12 }, (_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 rounded-full animate-ping"
        style={{
          backgroundColor: ['#E07A5F', '#81B29A', '#F2CC8F', '#3D405B'][i % 4],
          left: `${20 + (i % 3) * 20}%`,
          top: `${10 + (i % 4) * 15}%`,
          animationDelay: `${i * 0.1}s`,
          animationDuration: '1.5s',
        }}
      />
    ));
    return <>{confettiPieces}</>;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => {
          const active = isActive(item.activePattern);
          const isMealPlan = item.to === "/meal-planner";
          
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-all duration-300 relative",
                active 
                  ? "text-sage" 
                  : "text-gray-500 hover:text-gray-700",
                isMealPlan && flashMealPlan && "animate-bounce"
              )}
              style={{
                transform: isMealPlan && flashMealPlan ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              {/* Confetti effect for meal plan */}
              {isMealPlan && flashMealPlan && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <Confetti />
                </div>
              )}
              
              <item.icon 
                className={cn(
                  "h-5 w-5 mb-1 transition-all duration-300",
                  active ? "text-sage" : "text-gray-500",
                  isMealPlan && flashMealPlan && "text-terracotta scale-125 drop-shadow-lg"
                )} 
              />
              <span className={cn(
                "text-xs font-medium truncate transition-all duration-300",
                active ? "text-sage" : "text-gray-500",
                isMealPlan && flashMealPlan && "text-terracotta font-bold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
