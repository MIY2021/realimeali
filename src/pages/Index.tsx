
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Book, CalendarDays } from "lucide-react";
import { mockRecipes } from "@/data/mockData";
import { RecipeCard } from "@/components/recipes/RecipeCard";

export default function Index() {
  // Show a few featured recipes
  const featuredRecipes = mockRecipes.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-cream to-cream/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl text-navy">
                RealiMeali: Your Family's Meal Planning Hub
              </h1>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-base">
                Save favorite recipes, plan weekly meals, and share with family.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild size="md" className="bg-terracotta hover:bg-terracotta/90">
                <Link to="/recipes">Browse Recipes</Link>
              </Button>
              <Button asChild size="md" variant="outline">
                <Link to="/meal-planner">Start Planning</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-6 md:py-8 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-1 text-center">
              <div className="rounded-full bg-terracotta/20 p-2">
                <Book className="h-5 w-5 text-terracotta" />
              </div>
              <h3 className="text-base font-bold">Recipe Collection</h3>
              <p className="text-xs text-muted-foreground">
                Save and organize all your favorite family recipes.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-1 text-center">
              <div className="rounded-full bg-sage/20 p-2">
                <CalendarDays className="h-5 w-5 text-sage" />
              </div>
              <h3 className="text-base font-bold">Meal Planning</h3>
              <p className="text-xs text-muted-foreground">
                Plan your weekly meals and generate shopping lists.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-1 text-center">
              <div className="rounded-full bg-butter/20 p-2">
                <UtensilsCrossed className="h-5 w-5 text-butter" />
              </div>
              <h3 className="text-base font-bold">Family Sharing</h3>
              <p className="text-xs text-muted-foreground">
                Share your meal plans for seamless coordination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="py-6 md:py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center md:flex-row md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tighter text-navy">
                Featured Recipes
              </h2>
              <p className="text-sm text-muted-foreground">
                Our selection of delicious recipes
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/recipes">View All Recipes</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-6 md:py-8 bg-navy text-cream">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tighter sm:text-2xl">
                Ready to Start Planning with RealiMeali?
              </h2>
              <p className="mx-auto max-w-[400px] text-cream/80 text-base">
                Create an account today and start organizing your family's meals.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild size="md" className="bg-terracotta hover:bg-terracotta/90">
                <Link to="/signup">Sign Up Now</Link>
              </Button>
              <Button asChild size="md" variant="outline" className="border-cream text-cream hover:bg-cream/10">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
