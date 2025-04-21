import { Link } from "react-router-dom";
import { ListChecks, Beef } from "lucide-react";
import { mockRecipes } from "@/data/recipes";
import { RecipeList } from "@/components/recipes/RecipeList";

export default function Index() {
  const quickLinks = [
    {
      title: "Shopping List",
      icon: <Beef className="h-8 w-8" />,
      href: "/shopping-list",
    },
    {
      title: "Meal Planner",
      icon: <ListChecks className="h-8 w-8" />,
      href: "/meal-planner",
    },
    {
      title: "Recipes",
      icon: <ListChecks className="h-8 w-8" />,
      href: "/recipes",
    },
  ];

  return (
    <div>
      <header className="py-12 text-center">
        <h1 className="text-4xl font-bold">Welcome to Recipe App</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Discover, plan, and shop for your favorite meals
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-10 mt-10">
        {quickLinks.map((link) => (
          <Link
            key={link.title}
            to={link.href}
            className="story-link flex flex-col items-center hover-scale"
          >
            <span className="rounded-full bg-accent text-accent-foreground p-4 mb-2">
              {link.icon}
            </span>
            <span className="font-semibold">{link.title}</span>
          </Link>
        ))}
      </div>

      <section className="mt-16 py-8 px-4 rounded-xl" style={{ background: "linear-gradient(135deg, #353019 0%, #f6ad55 100%)" }}>
        <h2 className="text-xl font-bold text-white mb-6">Latest Recipes</h2>
        <div className="max-w-5xl mx-auto">
          <RecipeList recipes={mockRecipes.slice(-6)} />
        </div>
      </section>

      <section className="mt-16 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <ListChecks className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Browse Recipes</h3>
              <p className="text-muted-foreground mt-2">
                Explore our collection of delicious recipes
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <ListChecks className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Plan Your Meals</h3>
              <p className="text-muted-foreground mt-2">
                Organize your weekly meal schedule
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <ListChecks className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Shop Ingredients</h3>
              <p className="text-muted-foreground mt-2">
                Get your shopping list automatically generated
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
