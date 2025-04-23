
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
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-lg justify-center">
              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-5 group transition-all">
                <Link to="/meal-planner" className="flex flex-col items-center w-full">
                  <span className="pb-2">
                    <img
                      src="/lovable-uploads/f5e80761-ddc5-48b2-80d2-54be701453a3.png"
                      className="h-24 w-24 object-cover rounded-full border mb-1"
                      alt="Meal Planner"
                    />
                  </span>
                  <span className="font-semibold text-navy text-base">Meal Planner</span>
                  <span className="text-xs text-muted-foreground mt-1">Plan your weekly meals</span>
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-5 group transition-all">
                <Link to="/recipes" className="flex flex-col items-center w-full">
                  <span className="pb-2">
                    <img
                      src="/lovable-uploads/02d17fd6-6699-46d2-9e0a-6031dfc6c617.png"
                      className="h-24 w-24 object-cover rounded-full border mb-1"
                      alt="Recipes"
                    />
                  </span>
                  <span className="font-semibold text-navy text-base">Recipe Collection</span>
                  <span className="text-xs text-muted-foreground mt-1">Browse delicious recipes</span>
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-5 group transition-all">
                <Link to="/shopping-list" className="flex flex-col items-center w-full">
                  <span className="pb-2 flex justify-center items-center h-24 w-24">
                    <img
                      src="/lovable-uploads/440d79e4-31b0-4eb2-a8d6-8437ee4b3c6a.png"
                      className="h-24 w-24 object-cover rounded-full border mb-1"
                      alt="Shopping List"
                    />
                  </span>
                  <span className="font-semibold text-navy text-base">Shopping Lists</span>
                  <span className="text-xs text-muted-foreground mt-1">Generate shopping lists</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-4" style={{ background: "#1A1F2C" }}>
        <div className="container px-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                Latest Recipes
              </h2>
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
