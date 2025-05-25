
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User, UtensilsCrossed, CalendarDays, Book, ListChecks, Users, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const Header = () => {
  const { user, signOut } = useAuth();
  const { currentHousehold } = useHousehold();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { to: "/recipes", icon: Book, label: "Recipes" },
    { to: "/meal-planner", icon: CalendarDays, label: "Meal Planner" },
    { to: "/shopping-list", icon: ListChecks, label: "Shopping List" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#FEC6A1] shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center space-x-2">
          <UtensilsCrossed className="h-6 w-6 text-terracotta" />
          <span className="text-xl font-bold text-navy">RealiMeali</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center space-x-1 text-navy hover:text-terracotta transition-colors"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          {/* Household Selector */}
          {user && currentHousehold && (
            <div className="hidden sm:flex items-center text-navy text-sm font-medium">
              <Users className="h-4 w-4 mr-1" />
              <span className="truncate max-w-32">{currentHousehold.name}</span>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden p-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center space-x-2 text-navy hover:text-terracotta transition-colors p-2 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                {user && (
                  <>
                    <hr className="my-2" />
                    <Link
                      to="/account"
                      className="flex items-center space-x-2 text-navy hover:text-terracotta transition-colors p-2 rounded"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Manage Account</span>
                    </Link>
                    <Link
                      to="/household"
                      className="flex items-center space-x-2 text-navy hover:text-terracotta transition-colors p-2 rounded"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      <span>Manage Household</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-navy hover:text-terracotta transition-colors p-2 rounded text-left w-full"
                    >
                      <span>Logout</span>
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 p-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email || "User"} />
                    <AvatarFallback>{(user.user_metadata?.full_name || user.email)?.[0].toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
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
                <span className="hidden sm:inline">Login</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
