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

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-sage" />
            Achievements
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-24 h-24 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="h-5 w-5 text-sage" />
          Achievements
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {achievements.map((achievement) => {
          const isUnlocked = achievement.unlockCondition(stats);
          const progress = achievement.progress(stats);
          const Icon = achievement.icon;

          return (
            <div key={achievement.id} className="flex-shrink-0 text-center">
              <div className="relative w-24 h-24 mb-2">
                {/* Badge Circle */}
                <div
                  className={`
                    w-full h-full rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${
                      isUnlocked
                        ? `bg-gradient-to-br ${achievement.gradient} shadow-lg hover:scale-110 cursor-pointer`
                        : "bg-gray-300 grayscale opacity-60"
                    }
                  `}
                >
                  <Icon className={`h-10 w-10 ${isUnlocked ? 'text-white animate-pulse-glow' : 'text-gray-500'}`} />
                </div>

                {/* Progress Ring */}
                {!isUnlocked && (
                  <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 44}`}
                      strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                      className="text-sage transition-all duration-500"
                    />
                  </svg>
                )}
              </div>
              <p className="text-xs font-medium text-foreground mb-1">
                {achievement.title}
              </p>
              {!isUnlocked && (
                <p className="text-xs text-muted-foreground">
                  {Math.floor(progress)}%
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
