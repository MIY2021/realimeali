
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  UtensilsCrossed, 
  CalendarDays, 
  ListChecks,
} from "lucide-react";

export default function Index() {
  return (
    <div className="flex flex-col min-h-[85vh]">
      <section className="py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter text-navy sm:text-4xl md:text-5xl lg:text-6xl">
                Welcome to FoodHaven
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Your all-in-one meal planning and recipe management system to make cooking easier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-gray-50 flex-grow">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            <div className="group relative overflow-hidden rounded-lg border bg-white p-6 shadow-md transition-all hover:shadow-lg md:min-h-[300px]">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="rounded-full bg-terracotta/10 p-4">
                  <UtensilsCrossed className="h-10 w-10 text-terracotta" />
                </div>
                <h2 className="text-xl font-bold text-navy">Recipes</h2>
                <p className="text-muted-foreground mb-4">
                  Browse and manage your favorite recipes all in one place.
                </p>
                <Button className="mt-auto" asChild>
                  <Link to="/recipes">View Recipes</Link>
                </Button>
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
                <Button className="mt-auto" asChild>
                  <Link to="/meal-planner">Go to Planner</Link>
                </Button>
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
                <Button className="mt-auto" asChild>
                  <Link to="/shopping-list">View Shopping List</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
