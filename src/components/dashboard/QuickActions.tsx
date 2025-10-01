import { Book, UtensilsCrossed, ShoppingBag, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserStats } from "@/hooks/useUserStats";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const QuickActions = () => {
  const navigate = useNavigate();
  const { stats, isLoading } = useUserStats();

  const quickActions = [
    {
      title: "My Recipes",
      value: stats.totalRecipes,
      icon: Book,
      iconBg: "bg-blue-500",
      onClick: () => navigate("/my-recipes"),
    },
    {
      title: "To Cook",
      value: stats.recipesToCook,
      icon: UtensilsCrossed,
      iconBg: "bg-emerald-500",
      onClick: () => navigate("/my-recipes?filter=not-cooked"),
    },
    {
      title: "Shopping",
      value: stats.shoppingItemsCount,
      icon: ShoppingBag,
      iconBg: "bg-purple-500",
      onClick: () => navigate("/shopping-list"),
    },
    {
      title: "Favourites",
      value: stats.favoriteRecipes,
      icon: Heart,
      iconBg: "bg-red-500",
      onClick: () => navigate("/my-recipes?filter=favourites"),
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            onClick={action.onClick}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-white border-0 rounded-2xl shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">
                {action.title}
              </span>
              <div className={`${action.iconBg} rounded-full p-1.5`}>
                <action.icon className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="text-3xl font-bold text-gray-900">
                {action.value}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};