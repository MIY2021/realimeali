import { Globe, Calendar, Sparkles, Star, Heart, Check } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { Skeleton } from "@/components/ui/skeleton";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlockCondition: (stats: any) => boolean;
  progress: (stats: any) => number;
  threshold: number;
  gradient: string;
}

const achievements: Achievement[] = [
  {
    id: "variety-voyager",
    title: "Variety Voyager",
    description: "Try 20+ different recipes",
    icon: Globe,
    unlockCondition: (stats) => stats.totalRecipes >= 20,
    progress: (stats) => Math.min((stats.totalRecipes / 20) * 100, 100),
    threshold: 20,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "budget-baker",
    title: "Budget Baker",
    description: "Plan 10+ shopping lists",
    icon: Check,
    unlockCondition: (stats) => stats.shoppingItemsCount >= 50,
    progress: (stats) => Math.min((stats.shoppingItemsCount / 50) * 100, 100),
    threshold: 50,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "week-warrior",
    title: "Week Warrior",
    description: "Plan 4 consecutive weeks",
    icon: Calendar,
    unlockCondition: (stats) => stats.totalRecipes >= 15,
    progress: (stats) => Math.min((stats.totalRecipes / 15) * 100, 100),
    threshold: 15,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "recipe-creator",
    title: "Recipe Creator",
    description: "Add 10+ recipes",
    icon: Sparkles,
    unlockCondition: (stats) => stats.totalRecipes >= 10,
    progress: (stats) => Math.min((stats.totalRecipes / 10) * 100, 100),
    threshold: 10,
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "favorite-finder",
    title: "Favorite Finder",
    description: "Mark 5+ recipes as favorites",
    icon: Star,
    unlockCondition: (stats) => stats.favoriteRecipes >= 5,
    progress: (stats) => Math.min((stats.favoriteRecipes / 5) * 100, 100),
    threshold: 5,
    gradient: "from-yellow-500 to-amber-500",
  },
];

export const AchievementsBadges = () => {
  const { stats, isLoading } = useUserStats();

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Achievements Unlocked!
        </h2>
        <button className="text-sm font-medium text-gray-600 hover:text-gray-900">
          View All
        </button>
      </div>
      {isLoading ? (
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
          {achievements.slice(0, 3).map((achievement) => {
            const isUnlocked = achievement.unlockCondition(stats);
            const Icon = achievement.icon;

            return (
              <div key={achievement.id} className="flex flex-col items-center gap-2 flex-shrink-0">
                <div
                  className={`
                    w-20 h-20 rounded-full flex items-center justify-center
                    transition-all duration-300 shadow-md
                    ${isUnlocked 
                      ? `bg-gradient-to-br ${achievement.gradient}` 
                      : 'bg-gray-200 grayscale'
                    }
                  `}
                >
                  <Icon 
                    className={`h-9 w-9 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}
                  />
                </div>
                
                <p className="text-xs font-semibold text-gray-900 text-center max-w-[80px] line-clamp-2">
                  {achievement.title}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
