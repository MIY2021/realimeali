
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockRecipes } from "@/data/recipes";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { Calendar, Book, ListChecks } from "lucide-react";

export default function Index() {
  // Show the latest recipes (most recently added)
  const latestRecipes = [...mockRecipes].reverse().slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Revised with improved buttons */}
      <section className="py-8 bg-gradient-to-b from-cream to-cream/50">
        <div className="container px-4">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h1 className="text-xl font-bold sm:text-2xl md:text-3xl text-navy">
              RealiMeali: Your Family&apos;s Meal Planning Hub
            </h1>
            <div className="mx-auto max-w-[500px] text-sm text-muted-foreground mb-2">
              Save recipes, plan meals, and generate shopping lists.
            </div>
            {/* Improved buttons with larger icons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-lg justify-center">
              {/* Meal Planning FIRST */}
              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-5 group transition-all">
                <Link to="/meal-planner" className="flex flex-col items-center w-full">
                  <span className="pb-2">
                    <span className="inline-flex items-center justify-center bg-sage/10 rounded-full p-3 mb-1 group-hover:bg-sage/20 transition">
                      <Calendar className="h-8 w-8 text-sage" />
                    </span>
                  </span>
                  <span className="font-semibold text-navy text-base">Meal Planning</span>
                  <span className="text-xs text-muted-foreground mt-1">Plan weekly meals easily</span>
                </Link>
              </Button>

              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-5 group transition-all">
                <Link to="/recipes" className="flex flex-col items-center w-full">
                  <span className="pb-2">
                    <span className="inline-flex items-center justify-center bg-sage/10 rounded-full p-3 mb-1 group-hover:bg-sage/20 transition">
                      <Book className="h-8 w-8 text-terracotta" />
                    </span>
                  </span>
                  <span className="font-semibold text-navy text-base">Recipe Collection</span>
                  <span className="text-xs text-muted-foreground mt-1">Save your favorite recipes</span>
                </Link>
              </Button>

              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-5 group transition-all">
                <Link to="/shopping-list" className="flex flex-col items-center w-full">
                  <span className="pb-2">
                    <span className="inline-flex items-center justify-center bg-sage/10 rounded-full p-3 mb-1 group-hover:bg-sage/20 transition">
                      <ListChecks className="h-8 w-8 text-butter" />
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

      {/* Latest Recipes - with darker background */}
      <section className="py-4 bg-navy/10">
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

      {/* CTA Section Removed */}
    </div>
  );
}
