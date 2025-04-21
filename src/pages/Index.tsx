import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Shuffle, ListChecks } from "lucide-react";
import { mockRecipes } from "@/data/recipes";
import { RecipeCard } from "@/components/recipes/RecipeCard";

export default function Index() {
  // Show the latest recipes (most recently added)
  const latestRecipes = [...mockRecipes].reverse().slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Revised with three buttons */}
      <section className="py-8 bg-gradient-to-b from-cream to-cream/50">
        <div className="container px-4">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h1 className="text-xl font-bold sm:text-2xl md:text-3xl text-navy">
              RealiMeali: Your Family&apos;s Meal Planning Hub
            </h1>
            <div className="mx-auto max-w-[500px] text-sm text-muted-foreground mb-2">
              Save recipes, plan meals, and generate shopping lists.
            </div>
            {/* New buttons for Recipe Collection, Meal Planning, and Shopping Lists */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-lg justify-center">
              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-5 group transition-all">
                <Link to="/recipes" className="flex flex-col items-center w-full">
                  <span className="pb-2">
                    <span className="inline-flex items-center justify-center bg-sage/10 rounded-full p-2 mb-1 group-hover:bg-sage/20 transition">
                      {/* Lucide: book */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M2 7v11a2 2 0 0 0 2 2h16M2 7a2 2 0 0 1 2-2h13.5a2 2 0 0 1 2 2v13M2 7h17.5M20 20V7"/></svg>
                    </span>
                  </span>
                  <span className="font-semibold text-navy text-base">Recipe Collection</span>
                  <span className="text-xs text-muted-foreground mt-1">Save your favorite recipes</span>
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-5 group transition-all">
                <Link to="/meal-planner" className="flex flex-col items-center w-full">
                  <span className="pb-2">
                    <span className="inline-flex items-center justify-center bg-sage/10 rounded-full p-2 mb-1 group-hover:bg-sage/20 transition">
                      {/* Lucide: calendar */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="18" height="16" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                    </span>
                  </span>
                  <span className="font-semibold text-navy text-base">Meal Planning</span>
                  <span className="text-xs text-muted-foreground mt-1">Plan weekly meals easily</span>
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-5 group transition-all">
                <Link to="/shopping-list" className="flex flex-col items-center w-full">
                  <span className="pb-2">
                    <span className="inline-flex items-center justify-center bg-sage/10 rounded-full p-2 mb-1 group-hover:bg-sage/20 transition">
                      {/* Lucide: shopping-cart */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-butter" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h2l1 5.32m2.26 9.35A2 2 0 0 0 8 19h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6.42"/><path d="M16 10v6"/><path d="M8 7V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/></svg>
                    </span>
                  </span>
                  <span className="font-semibold text-navy text-base">Shopping Lists</span>
                  <span className="text-xs text-muted-foreground mt-1">Generate lists from your meal plan</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - More compact */}
      <section className="py-4 bg-muted">
        <div className="container px-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center p-2 space-x-3">
              <div className="rounded-full bg-terracotta/20 p-1.5">
                <UtensilsCrossed className="h-4 w-4 text-terracotta" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Recipe Collection</h3>
                <p className="text-xs text-muted-foreground">
                  Save your favorite recipes
                </p>
              </div>
            </div>
            <div className="flex items-center p-2 space-x-3">
              <div className="rounded-full bg-sage/20 p-1.5">
                <Shuffle className="h-4 w-4 text-sage" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Meal Planning</h3>
                <p className="text-xs text-muted-foreground">
                  Plan weekly meals easily
                </p>
              </div>
            </div>
            <div className="flex items-center p-2 space-x-3">
              <div className="rounded-full bg-butter/20 p-1.5">
                <ListChecks className="h-4 w-4 text-butter" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Shopping Lists</h3>
                <p className="text-xs text-muted-foreground">
                  Generate lists from your meal plan
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Recipes - instead of Featured Recipes */}
      <section className="py-4">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-navy">
                Latest Recipes
              </h2>
              <p className="text-xs text-muted-foreground">
                See what&apos;s new in your recipe collection
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/recipes">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {latestRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - More compact */}
      <section className="py-5 bg-navy text-cream">
        <div className="container px-4">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h2 className="text-lg font-bold">
              Ready to Start Planning?
            </h2>
            <p className="mx-auto max-w-[300px] text-cream/80 text-sm">
              Create an account today and organize your meals.
            </p>
            <div className="flex flex-row gap-2 mt-1">
              <Button asChild size="sm" className="bg-terracotta hover:bg-terracotta/90">
                <Link to="/signup">Sign Up</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-cream text-cream hover:bg-cream/10">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
