
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
      <section className="py-16 md:py-24 bg-gradient-to-b from-cream to-cream/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-navy">
                Your Family's Meal Planning Hub
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Save favorite recipes, plan weekly meals, and share with family members.
                All in one place, always accessible.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-terracotta hover:bg-terracotta/90">
                <Link to="/recipes">
                  Browse Recipes
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/meal-planner">
                  Start Planning
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-terracotta/20 p-4">
                <Book className="h-6 w-6 text-terracotta" />
              </div>
              <h3 className="text-xl font-bold">Recipe Collection</h3>
              <p className="text-muted-foreground">
                Save and organize all your favorite family recipes in one place.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-sage/20 p-4">
                <CalendarDays className="h-6 w-6 text-sage" />
              </div>
              <h3 className="text-xl font-bold">Meal Planning</h3>
              <p className="text-muted-foreground">
                Plan your weekly meals and generate shopping lists with ease.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-butter/20 p-4">
                <UtensilsCrossed className="h-6 w-6 text-butter" />
              </div>
              <h3 className="text-xl font-bold">Family Sharing</h3>
              <p className="text-muted-foreground">
                Share your meal plans with family members for seamless coordination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter text-navy">
                Featured Recipes
              </h2>
              <p className="text-muted-foreground">
                Discover our selection of delicious recipes
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/recipes">View All Recipes</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-navy text-cream">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready to Start Planning?
              </h2>
              <p className="mx-auto max-w-[600px] text-cream/80 md:text-xl">
                Create an account today and start organizing your family's meals.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-terracotta hover:bg-terracotta/90">
                <Link to="/signup">
                  Sign Up Now
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-cream text-cream hover:bg-cream/10">
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
