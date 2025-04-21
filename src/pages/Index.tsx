import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Shuffle, ListChecks } from "lucide-react";
import { mockRecipes } from "@/data/recipes";
import { RecipeCard } from "@/components/recipes/RecipeCard";

export default function Index() {
  // Show a few featured recipes
  const featuredRecipes = mockRecipes.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Made more compact */}
      <section className="py-6 bg-gradient-to-b from-cream to-cream/50">
        <div className="container px-4">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h1 className="text-xl font-bold sm:text-2xl md:text-3xl text-navy">
              RealiMeali: Your Family's Meal Planning Hub
            </h1>
            <p className="mx-auto max-w-[500px] text-sm text-muted-foreground">
              Save recipes, plan meals, and generate shopping lists.
            </p>
            <div className="flex flex-row gap-2 mt-2">
              <Button asChild size="sm" className="bg-terracotta hover:bg-terracotta/90">
                <Link to="/recipes">Browse Recipes</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/meal-planner">Start Planning</Link>
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

      {/* Featured Recipes - Compact version */}
      <section className="py-4">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-navy">
                Featured Recipes
              </h2>
              <p className="text-xs text-muted-foreground">
                Our selection of delicious meals
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/recipes">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredRecipes.map((recipe) => (
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
