
import { Link, useLocation } from "react-router-dom";
import { Book, Search, CalendarDays, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const location = useLocation();
  
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

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  const handleNavClick = () => {
    // Scroll to top when navigation item is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => {
          const active = isActive(item.activePattern);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-colors",
                active 
                  ? "text-sage" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 mb-1",
                  active ? "text-sage" : "text-gray-500"
                )} 
              />
              <span className={cn(
                "text-xs font-medium truncate",
                active ? "text-sage" : "text-gray-500"
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
