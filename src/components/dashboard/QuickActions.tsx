import { Plus, Calendar, ListChecks, Search, Sparkles, Shuffle } from "lucide-react";
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
      gradient: "from-orange-400 to-red-500",
    },
    {
      title: "Plan Meals",
      icon: Calendar,
      href: "/meal-planner",
      type: "navigation" as const,
      gradient: "from-green-400 to-emerald-500",
    },
    {
      title: "Shopping",
      icon: ListChecks,
      href: "/shopping-list",
      type: "navigation" as const,
      gradient: "from-purple-400 to-purple-600",
    },
    {
      title: "Discover",
      icon: Search,
      href: "/discover-recipes",
      type: "navigation" as const,
      gradient: "from-blue-400 to-cyan-500",
    },
    {
      title: "AI Chef",
      icon: Sparkles,
      type: "modal" as const,
      onClick: () => setIsOpen(true),
      gradient: "from-pink-400 to-rose-500",
    },
    {
      title: "Random",
      icon: Shuffle,
      href: "/my-recipes",
      type: "navigation" as const,
      gradient: "from-yellow-400 to-amber-500",
    },
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    if (action.type === 'modal' && action.onClick) {
      action.onClick();
    }
  };

  return (
    <div className="w-full px-4">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {actions.map((action) => {
          const content = (
            <div
              className={`
                relative overflow-hidden
                bg-gradient-to-br ${action.gradient}
                rounded-2xl p-4 min-h-[88px]
                flex flex-col items-center justify-center gap-2
                shadow-lg
                transition-all duration-300
                hover:scale-105 hover:shadow-xl
                active:scale-95
                cursor-pointer
                group
              `}
            >
              <action.icon className="h-8 w-8 text-white drop-shadow-md group-hover:animate-float" />
              <span className="text-xs font-semibold text-white text-center leading-tight">
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