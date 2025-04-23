import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockRecipes } from "@/data/recipes";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { ListChecks } from "lucide-react";

export default function Index() {
  const uniqueByTitle = (recipes: typeof mockRecipes) => {
    const seen = new Set();
    return recipes.filter((r) => {
      const key = r.title.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const latestRecipes = uniqueByTitle(mockRecipes)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-8 bg-gradient-to-b from-[#ffe5cb] to-[#fff3e0]">
        <div className="container px-4">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h1 className="text-xl font-bold sm:text-2xl md:text-3xl text-navy">
              RealiMeali: Your Family&apos;s Meal Planning Hub
            </h1>
            <div className="mx-auto max-w-[500px] text-sm text-muted-foreground mb-2">
              Save recipes, plan meals, and generate shopping lists.
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-lg justify-center">
              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-5 group transition-all">
                <Link to="/meal-planner" className="flex flex-col items-center w-full">
                  <span className="pb-2">
                    <img
                      src="https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=128&q=80"
                      className="h-24 w-24 object-cover rounded-full border mb-1"
                      alt="Meal Planner"
                    />
                  </span>
                  <span className="font-semibold text-navy text-base">Meal Planner</span>
                  <span className="text-xs text-muted-foreground mt-1">Plan weekly meals easily</span>
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-5 group transition-all">
                <Link to="/recipes" className="flex flex-col items-center w-full">
                  <span className="pb-2">
                    <img
                      src="https://images.unsplash.com/photo-1546039907-7fa05f864c02?auto=format&fit=crop&w=128&q=80"
                      className="h-24 w-24 object-cover rounded-full border mb-1"
                      alt="Recipes"
                    />
                  </span>
                  <span className="font-semibold text-navy text-base">Recipe Collection</span>
                  <span className="text-xs text-muted-foreground mt-1">Save your favorite recipes</span>
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-5 group transition-all">
                <Link to="/shopping-list" className="flex flex-col items-center w-full">
                  <span className="pb-2 flex justify-center items-center h-24 w-24">
                    <img
                      src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=128&q=80"
                      className="h-24 w-24 object-cover rounded-full border mb-1"
                      alt="Shopping List"
                    />
                  </span>
                  <span className="font-semibold text-navy text-base">Shopping Lists</span>
                  <span className="text-xs text-muted-foreground mt-1">Generate lists from your meal plan</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-4" style={{ background: "#1F4D5C" }}>
        <div className="container px-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                Latest Recipes
              </h2>
              <p className="text-xs text-white/80">
                See what&apos;s new in your recipe collection
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {latestRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
