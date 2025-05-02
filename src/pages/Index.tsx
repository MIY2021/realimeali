
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
              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-2 group transition-all h-auto">
                <Link to="/meal-planner" className="flex flex-col items-center w-full">
                  <div className="w-full overflow-hidden">
                    <img
                      src="/lovable-uploads/f5e80761-ddc5-48b2-80d2-54be701453a3.png"
                      className="w-full h-48 object-cover rounded-t-md"
                      alt="Meal Planner"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <span className="font-semibold text-navy text-lg mb-1 block">Meal Planner</span>
                    <span className="text-xs text-muted-foreground">Plan your weekly meals</span>
                  </div>
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-2 group transition-all h-auto">
                <Link to="/recipes" className="flex flex-col items-center w-full">
                  <div className="w-full overflow-hidden">
                    <img
                      src="/lovable-uploads/Banana-Pancakes-08.png"
                      className="w-full h-48 object-cover rounded-t-md"
                      alt="Recipes"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <span className="font-semibold text-navy text-lg mb-1 block">Recipe Collection</span>
                    <span className="text-xs text-muted-foreground">Browse delicious recipes</span>
                  </div>
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white border shadow hover:bg-sage/10 flex-1 flex flex-col items-center py-2 group transition-all h-auto">
                <Link to="/shopping-list" className="flex flex-col items-center w-full">
                  <div className="w-full overflow-hidden">
                    <img
                      src="/lovable-uploads/440d79e4-31b0-4eb2-a8d6-8437ee4b3c6a.png"
                      className="w-full h-48 object-cover rounded-t-md"
                      alt="Shopping List"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <span className="font-semibold text-navy text-lg mb-1 block">Shopping Lists</span>
                    <span className="text-xs text-muted-foreground">Generate shopping lists</span>
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-4" style={{ background: "#e48568" }}>
        <div className="container px-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-[#3d405b]">
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
