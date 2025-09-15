import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, ShoppingBag, Search, Star } from "lucide-react";
import { Link } from "react-router-dom";

export const QuickActions = () => {
  const actions = [
    {
      title: "Add Recipe",
      icon: Plus,
      href: "/create-recipe",
      variant: "default" as const,
    },
    {
      title: "Plan Meals",
      icon: Calendar,
      href: "/meal-planner",
      variant: "secondary" as const,
    },
    {
      title: "Shopping List",
      icon: ShoppingBag,
      href: "/shopping-list",
      variant: "outline" as const,
    },
    {
      title: "Discover",
      icon: Search,
      href: "/discover-recipes",
      variant: "outline" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-sage" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              asChild
              className="flex flex-col h-20 p-4"
            >
              <Link to={action.href}>
                <action.icon className="h-5 w-5 mb-2" />
                <span className="text-xs font-medium">{action.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};