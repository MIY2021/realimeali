
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  UtensilsCrossed, 
  CalendarDays, 
  ListChecks,
  Search,
} from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { LoginPromptDialog } from "@/components/auth/LoginPromptDialog";
import { useLoginPrompt } from "@/hooks/useLoginPrompt";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  useDocumentTitle("RealiMeali | All-in-one meal planning");
  const { showPrompt, promptTrigger, triggerPromptOnFeatureClick, closePrompt } = useLoginPrompt();
  const { user } = useAuth();

  const handleFeatureClick = (e: React.MouseEvent, path: string) => {
    if (!user) {
      e.preventDefault();
      const promptShown = triggerPromptOnFeatureClick();
      if (!promptShown) {
        // If no prompt shown (user dismissed permanently), redirect normally
        window.location.href = path;
      }
    }
  };

  return (
    <div className="flex flex-col min-h-[85vh]">
      <section className="py-8 md:py-12 lg:py-16 bg-white -mt-16 pt-24 md:pt-28 lg:pt-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter text-navy sm:text-4xl md:text-5xl lg:text-6xl">
                Welcome to RealiMeali
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Your all-in-one meal planning and recipe management system to make cooking easier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 md:py-6 bg-gray-50 flex-grow">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-10">
            <div className="group relative overflow-hidden rounded-lg border bg-white p-6 shadow-md transition-all hover:shadow-lg md:min-h-[300px]">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="rounded-full bg-terracotta/10 p-4">
                  <UtensilsCrossed className="h-10 w-10 text-terracotta" />
                </div>
                <h2 className="text-xl font-bold text-navy">My Recipes</h2>
                <p className="text-muted-foreground mb-4">
                  Browse and manage your favorite recipes all in one place.
                </p>
                {user ? (
                  <Button className="mt-auto" asChild>
                    <Link to="/my-recipes">View My Recipes</Link>
                  </Button>
                ) : (
                  <Button 
                    className="mt-auto" 
                    onClick={(e) => handleFeatureClick(e, "/my-recipes")}
                  >
                    View My Recipes
                  </Button>
                )}
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg border bg-white p-6 shadow-md transition-all hover:shadow-lg md:min-h-[300px]">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="rounded-full bg-sage/10 p-4">
                  <Search className="h-10 w-10 text-sage" />
                </div>
                <h2 className="text-xl font-bold text-navy">Discover Recipes</h2>
                <p className="text-muted-foreground mb-4">
                  Discover thousands of recipes from around the world.
                </p>
                {user ? (
                  <Button className="mt-auto" asChild>
                    <Link to="/discover-recipes">Discover Recipes</Link>
                  </Button>
                ) : (
                  <Button 
                    className="mt-auto"
                    onClick={(e) => handleFeatureClick(e, "/discover-recipes")}
                  >
                    Discover Recipes
                  </Button>
                )}
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg border bg-white p-6 shadow-md transition-all hover:shadow-lg md:min-h-[300px]">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="rounded-full bg-sage/10 p-4">
                  <CalendarDays className="h-10 w-10 text-sage" />
                </div>
                <h2 className="text-xl font-bold text-navy">Meal Planner</h2>
                <p className="text-muted-foreground mb-4">
                  Plan your meals for the week and simplify your cooking schedule.
                </p>
                {user ? (
                  <Button className="mt-auto" asChild>
                    <Link to="/meal-planner">Go to Planner</Link>
                  </Button>
                ) : (
                  <Button 
                    className="mt-auto"
                    onClick={(e) => handleFeatureClick(e, "/meal-planner")}
                  >
                    Go to Planner
                  </Button>
                )}
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg border bg-white p-6 shadow-md transition-all hover:shadow-lg md:min-h-[300px]">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="rounded-full bg-navy/10 p-4">
                  <ListChecks className="h-10 w-10 text-navy" />
                </div>
                <h2 className="text-xl font-bold text-navy">Shopping List</h2>
                <p className="text-muted-foreground mb-4">
                  Generate and manage shopping lists based on your meal plans.
                </p>
                {user ? (
                  <Button className="mt-auto" asChild>
                    <Link to="/shopping-list">View Shopping List</Link>
                  </Button>
                ) : (
                  <Button 
                    className="mt-auto"
                    onClick={(e) => handleFeatureClick(e, "/shopping-list")}
                  >
                    View Shopping List
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <LoginPromptDialog 
        isOpen={showPrompt}
        onClose={closePrompt}
        trigger={promptTrigger}
      />
    </div>
  );
}
