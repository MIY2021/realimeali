import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User, AlignJustify, User as UserIcon, Home } from "lucide-react";
import { RecipeCardIcon, DiscoverRecipeIcon, MealPlanIcon, ShoppingBasketIcon } from "@/components/icons/RealiMealiIcons";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HouseholdMembersDropdown } from "@/components/household/HouseholdMembersDropdown";
import { useSessionProfile } from "@/hooks/useSessionProfile";
import {
  profileImageReferrerPolicy,
  resolveProfilePhotoUrl,
} from "@/utils/resolveProfilePhotoUrl";
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

const realimealiLogo = "data:image/jpeg;base64,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";

const Header = () => {
  const { user, signOut, isLoading } = useAuth();
  const { data: profileRow } = useSessionProfile();
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
    { to: "/my-recipes", icon: RecipeCardIcon, label: "My Recipes" },
    { to: "/discover-recipes", icon: DiscoverRecipeIcon, label: "Discover Recipes" },
    { to: "/meal-planner", icon: MealPlanIcon, label: "Meal Planner" },
    { to: "/shopping-list", icon: ShoppingBasketIcon, label: "Shopping List" },
  ];

  const headerAvatarUrl = user ? resolveProfilePhotoUrl(profileRow, user) : null;

  const handleAvatarError = () => {
    console.error("Header avatar failed to load:", {
      userId: user?.id,
      avatarUrl: headerAvatarUrl,
      timestamp: new Date().toISOString(),
    });
    setAvatarError(true);
  };

  const handleAvatarLoad = () => {
    setAvatarError(false);
  };

  useEffect(() => {
    setAvatarError(false);
  }, [headerAvatarUrl]);

  // Log authentication state for debugging
  useEffect(() => {
    console.log('🔐 Header Auth State:', {
      isLoading,
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      userMetadata: user?.user_metadata,
      avatarUrl: headerAvatarUrl,
      fullName: user?.user_metadata?.full_name,
      timestamp: new Date().toISOString()
    });
  }, [user, isLoading]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-[#fdc8a4]/95 backdrop-blur-sm shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center space-x-2">
            <img src={realimealiLogo} alt="RealiMeali" className="h-9 w-9 object-contain rounded-[10%]" />
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

            {/* Household Members - Only show when logged in */}
            {!isLoading && user && <HouseholdMembersDropdown />}

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
                          src={headerAvatarUrl ?? undefined}
                          alt={user.user_metadata?.full_name || user.email || "User"}
                          onError={handleAvatarError}
                          onLoad={handleAvatarLoad}
                          className="object-cover"
                          referrerPolicy={profileImageReferrerPolicy(headerAvatarUrl)}
                        />
                        <AvatarFallback
                          className={
                            profileRow?.avatar_type === "fruit" && profileRow.avatar_data
                              ? "bg-terracotta/20 text-lg"
                              : "bg-terracotta/20 text-terracotta"
                          }
                        >
                          {profileRow?.avatar_type === "fruit" && profileRow.avatar_data
                            ? profileRow.avatar_data
                            : (user.user_metadata?.full_name || user.email)?.[0].toUpperCase() ||
                              "U"}
                        </AvatarFallback>
                      </Avatar>
                      {avatarError && headerAvatarUrl && (
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
