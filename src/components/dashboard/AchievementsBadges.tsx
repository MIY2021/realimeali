import { useUserStats } from "@/hooks/useUserStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useAchievements } from "@/hooks/useAchievements";
import { getBadgeColor } from "@/lib/badgeColors";
import * as LucideIcons from "lucide-react";
import { Link } from "react-router-dom";

export const AchievementsBadges = () => {
  const { achievements, isLoading } = useAchievements();
  
  // Show first 4 unlocked achievements
  const unlockedAchievements = achievements
    .filter(a => a.isUnlocked)
    .sort((a, b) => {
      const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
      const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 4);

  const totalUnlocked = achievements.filter(a => a.isUnlocked).length;

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Star;
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-extrabold">
          Achievements {totalUnlocked > 0 && `(${totalUnlocked})`}
        </h2>
        <Link 
          to="/achievements"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          View All
        </Link>
      </div>
      {isLoading ? (
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      ) : unlockedAchievements.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {unlockedAchievements.map((achievement) => {
            const Icon = getIcon(achievement.iconName);
            const color = getBadgeColor(achievement.category);

            return (
              <Link 
                key={achievement.id}
                to="/achievements"
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-md group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${color.base}, ${color.dark})`
                  }}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                
                <p className="text-xs font-semibold text-gray-900 text-center max-w-[64px] line-clamp-2">
                  {achievement.name}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No achievements unlocked yet!</p>
          <p className="text-xs mt-1">Start cooking to earn your first badge</p>
        </div>
      )}
    </div>
  );
};
