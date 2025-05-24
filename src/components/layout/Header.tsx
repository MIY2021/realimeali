
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User, UtensilsCrossed, CalendarDays, Book, ListChecks, Settings, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email || "User"} />
                    <AvatarFallback>{(user.user_metadata?.full_name || user.email)?.[0].toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/household" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Household
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
