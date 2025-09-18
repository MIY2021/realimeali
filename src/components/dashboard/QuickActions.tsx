import { Button } from "@/components/ui/button";
import { Plus, Calendar, ListChecks, Search, Star, User, Shuffle } from "lucide-react";
import { Link } from "react-router-dom";
import { useRealiChef } from "@/contexts/RealiChefContext";

export const QuickActions = () => {
  const { setIsOpen } = useRealiChef();

  const actions = [
    {
      title: "Add Recipe",
      icon: Plus,
      href: "/create-recipe",
      variant: "outline" as const,
      type: "navigation" as const,
    },
    {
      title: "Plan Meals",
      icon: Calendar,
      href: "/meal-planner",
      variant: "outline" as const,
      type: "navigation" as const,
    },
    {
      title: "Shopping List",
      icon: ListChecks,
      href: "/shopping-list",
      variant: "outline" as const,
      type: "navigation" as const,
    },
    {
      title: "Discover",
      icon: Search,
      href: "/discover-recipes",
      variant: "outline" as const,
      type: "navigation" as const,
    },
    {
      title: "AI Chef",
      icon: User,
      variant: "outline" as const,
      type: "modal" as const,
      onClick: () => setIsOpen(true),
    },
    {
      title: "Random Recipe",
      icon: Shuffle,
      href: "/my-recipes",
      variant: "outline" as const,
      type: "navigation" as const,
    },
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    if (action.type === 'modal' && action.onClick) {
      action.onClick();
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-sage" />
          Quick Actions
        </h2>
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action) => (
          action.type === 'navigation' ? (
            <Button
              key={action.title}
              variant={action.variant}
              asChild
              className="flex flex-col h-24 p-4"
            >
              <Link to={action.href!}>
                <action.icon className="h-6 w-6 mb-2" />
                <span className="text-xs font-medium">{action.title}</span>
              </Link>
            </Button>
          ) : (
            <Button
              key={action.title}
              variant={action.variant}
              onClick={() => handleActionClick(action)}
              className="flex flex-col h-24 p-4"
            >
              <action.icon className="h-6 w-6 mb-2" />
              <span className="text-xs font-medium">{action.title}</span>
            </Button>
          )
        ))}
      </div>
    </div>
  );
};