
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User, UtensilsCrossed, CalendarDays, Book, ListChecks, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#FEC6A1] shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <UtensilsCrossed className="h-6 w-6 text-terracotta" />
          <span className="text-xl font-bold text-navy">RealiMeali</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/recipes" className="flex items-center space-x-1 text-navy hover:text-terracotta transition-colors">
            <Book className="h-4 w-4" />
            <span>Recipes</span>
          </Link>
          <Link to="/meal-planner" className="flex items-center space-x-1 text-navy hover:text-terracotta transition-colors">
            <CalendarDays className="h-4 w-4" />
            <span>Meal Planner</span>
          </Link>
          <Link to="/shopping-list" className="flex items-center space-x-1 text-navy hover:text-terracotta transition-colors">
            <ListChecks className="h-4 w-4" />
            <span>Shopping List</span>
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <span className="text-sm text-navy hidden md:inline-block">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login" className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
