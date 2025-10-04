import { Plus, Calendar, ListChecks, Search, Sparkles, Shuffle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useRealiChef } from "@/contexts/RealiChefContext";

export const QuickActions = () => {
  const { setIsOpen } = useRealiChef();

  const actions = [
    {
      title: "Add Recipe",
      icon: Plus,
      href: "/create-recipe",
      type: "navigation" as const,
      gradient: "from-orange-200 to-red-300",
      textColor: "text-orange-800",
    },
    {
      title: "Plan Meals",
      icon: Calendar,
      href: "/meal-planner",
      type: "navigation" as const,
      gradient: "from-green-200 to-emerald-300",
      textColor: "text-green-800",
    },
    {
      title: "Shopping",
      icon: ListChecks,
      href: "/shopping-list",
      type: "navigation" as const,
      gradient: "from-purple-200 to-purple-300",
      textColor: "text-purple-800",
    },
    {
      title: "Discover",
      icon: Search,
      href: "/discover-recipes",
      type: "navigation" as const,
      gradient: "from-blue-200 to-cyan-300",
      textColor: "text-blue-800",
    },
    {
      title: "AI Chef",
      icon: Sparkles,
      type: "modal" as const,
      onClick: () => setIsOpen(true),
      gradient: "from-pink-200 to-rose-300",
      textColor: "text-pink-800",
    },
    {
      title: "Random",
      icon: Shuffle,
      href: "/my-recipes",
      type: "navigation" as const,
      gradient: "from-yellow-200 to-amber-300",
      textColor: "text-yellow-800",
    },
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    if (action.type === 'modal' && action.onClick) {
      action.onClick();
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-sage" />
          Quick Actions
        </h2>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {actions.map((action) => {
          const content = (
            <div
              className={`
                relative overflow-hidden
                bg-gradient-to-br ${action.gradient}
                rounded-2xl p-4 min-h-[88px]
                flex flex-col items-center justify-center gap-2
                shadow-md
                transition-all duration-300
                hover:scale-105 hover:shadow-lg
                active:scale-95
                cursor-pointer
                group
              `}
            >
              <action.icon className={`h-8 w-8 ${action.textColor} group-hover:animate-float`} />
              <span className={`text-xs font-semibold ${action.textColor} text-center leading-tight`}>
                {action.title}
              </span>
            </div>
          );

          return action.type === 'navigation' ? (
            <Link key={action.title} to={action.href!}>
              {content}
            </Link>
          ) : (
            <div key={action.title} onClick={() => handleActionClick(action)}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};