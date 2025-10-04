
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User, UtensilsCrossed, CalendarDays, Book, ListChecks, AlignJustify, Search, User as UserIcon, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HouseholdMembersDropdown } from "@/components/household/HouseholdMembersDropdown";
import { NotificationBell } from "@/components/layout/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { user, signOut, isLoading } = useAuth();
  const { currentHousehold } = useHousehold();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const isMobile = useIsMobile();

  // Add admin check
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        setIsAdmin(!!data);
      } catch (error) {
        // User is not admin or error occurred
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const navigationItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/my-recipes", icon: Book, label: "My Recipes" },
    { to: "/discover-recipes", icon: Search, label: "Discover Recipes" },
    { to: "/meal-planner", icon: CalendarDays, label: "Meal Planner" },
    { to: "/shopping-list", icon: ListChecks, label: "Shopping List" },
  ];

  const handleAvatarError = () => {
    console.error('Header avatar failed to load:', {
      userId: user?.id,
      avatarUrl: user?.user_metadata?.avatar_url,
      userMetadata: user?.user_metadata,
      timestamp: new Date().toISOString()
    });
    setAvatarError(true);
  };

  const handleAvatarLoad = () => {
    console.log('Header avatar loaded successfully:', {
      userId: user?.id,
      avatarUrl: user?.user_metadata?.avatar_url,
      timestamp: new Date().toISOString()
    });
    setAvatarError(false);
  };

  // Log authentication state for debugging
  useEffect(() => {
    console.log('🔐 Header Auth State:', {
      isLoading,
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      userMetadata: user?.user_metadata,
      avatarUrl: user?.user_metadata?.avatar_url,
      fullName: user?.user_metadata?.full_name,
      timestamp: new Date().toISOString()
    });
  }, [user, isLoading]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-[#fdc8a4]/95 backdrop-blur-sm shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center space-x-2">
            <UtensilsCrossed className="h-6 w-6 text-terracotta" />
            <span className="text-xl font-bold text-navy">RealiMeali</span>
          </Link>
          
          {/* Desktop Navigation */}
          {!isLoading && (
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
          )}

          <div className="flex items-center space-x-3">
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden p-2">
                  <AlignJustify className="h-5 w-5" />
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
                        to="/settings"
                        className="flex items-center space-x-2 text-navy hover:text-terracotta transition-colors p-2 rounded"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 text-terracotta hover:text-red-600 transition-colors p-2 rounded font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserIcon className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
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

            {/* Notification Bell - Only show when logged in */}
            {!isLoading && user && <NotificationBell />}

            {/* User Menu */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 p-1">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user.user_metadata?.avatar_url} 
                          alt={user.user_metadata?.full_name || user.email || "User"}
                          onError={handleAvatarError}
                          onLoad={handleAvatarLoad}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {(user.user_metadata?.full_name || user.email)?.[0].toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {avatarError && user.user_metadata?.avatar_url && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" 
                             title="Avatar failed to load" />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center text-terracotta font-medium">
                          <UserIcon className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
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
    </>
  );
};

export default Header;
