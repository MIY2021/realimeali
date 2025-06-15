
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
      setTimeout(() => setFlashMealPlan(false), 2000);
    };

    window.addEventListener('flash-meal-plan', handleFlashMealPlan);
    return () => window.removeEventListener('flash-meal-plan', handleFlashMealPlan);
  }, []);

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  const handleNavClick = () => {
    // Scroll to top when navigation item is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Floating particles component
  const FloatingParticles = () => {
    const particles = Array.from({ length: 8 }, (_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 rounded-full opacity-80"
        style={{
          backgroundColor: ['#E07A5F', '#81B29A', '#F2CC8F'][i % 3],
          left: `${30 + (i % 4) * 15}%`,
          top: '60%',
          animation: `float-up 2s ease-out ${i * 0.2}s forwards`,
        }}
      />
    ));
    return <>{particles}</>;
  };

  return (
    <>
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-30px) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 5px rgba(224, 122, 95, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(224, 122, 95, 0.6), 0 0 30px rgba(224, 122, 95, 0.4);
          }
        }
      `}</style>
      
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
                    : "text-gray-500 hover:text-gray-700"
                )}
                style={{
                  animation: isMealPlan && flashMealPlan ? 'glow-pulse 2s ease-in-out' : 'none',
                }}
              >
                {/* Floating particles effect for meal plan */}
                {isMealPlan && flashMealPlan && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <FloatingParticles />
                  </div>
                )}
                
                <item.icon 
                  className={cn(
                    "h-5 w-5 mb-1 transition-all duration-300",
                    active ? "text-sage" : "text-gray-500",
                    isMealPlan && flashMealPlan && "text-terracotta"
                  )} 
                />
                <span className={cn(
                  "text-xs font-medium truncate transition-all duration-300",
                  active ? "text-sage" : "text-gray-500",
                  isMealPlan && flashMealPlan && "text-terracotta font-semibold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNavigation;
