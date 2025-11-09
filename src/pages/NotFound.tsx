import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <UtensilsCrossed className="h-16 w-16 text-terracotta" />
        </div>
        <h1 className="text-6xl font-bold text-navy">404</h1>
        <p className="text-xl text-muted-foreground">Oops! This page is not on the menu.</p>
        <Button asChild className="bg-terracotta hover:bg-terracotta/90">
          <Link to="/">
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
