import { useState } from 'react';
import { ACHIEVEMENTS } from '@/lib/achievementsData';
import { Achievement, AchievementCategory } from '@/types/achievements';
import { AchievementsHeader } from '@/components/achievements/AchievementsHeader';
import { BadgeTile } from '@/components/achievements/BadgeTile';
import { BadgeBottomSheet } from '@/components/achievements/BadgeBottomSheet';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getBadgeColor } from '@/lib/badgeColors';
import { useAchievements } from '@/hooks/useAchievements';

const AchievementsPage = () => {
  useDocumentTitle('RealiMeali | Achievements');
  
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const { achievements, isLoading } = useAchievements();
  
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  // Group achievements by category
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  // Define category order and metadata
  const categoryMeta = [
    { key: 'cooking' as AchievementCategory, label: 'Cooking & Chef\'s Insight', emoji: '👨‍🍳' },
    { key: 'recipes' as AchievementCategory, label: 'Recipe Creation & Importing', emoji: '🍳' },
    { key: 'planning' as AchievementCategory, label: 'Meal Planning', emoji: '📅' },
    { key: 'shopping' as AchievementCategory, label: 'Shopping & Pantry', emoji: '🛒' },
    { key: 'engagement' as AchievementCategory, label: 'Everyday Engagement', emoji: '💡' },
    { key: 'sustainability' as AchievementCategory, label: 'Sustainability', emoji: '🌱' },
    { key: 'community' as AchievementCategory, label: 'Community & Invitations', emoji: '🤝' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AchievementsHeader unlockedCount={unlockedCount} totalCount={totalCount} />
      
      <div className="px-4 pb-24 pt-6">
        {categoryMeta.map((category) => {
          const achievements = groupedAchievements[category.key] || [];
          const unlockedInCategory = achievements.filter(a => a.isUnlocked).length;
          const color = getBadgeColor(category.key);
          
          return (
            <section key={category.key} className="mb-8 last:mb-0">
              {/* Category Header */}
              <div 
                className="flex items-center gap-2 mb-4 rounded-full px-3 py-2 w-fit"
                style={{
                  backgroundColor: `${color.base}15`,
                  borderLeft: `3px solid ${color.base}`
                }}
              >
                <span className="text-base">{category.emoji}</span>
                <h2 className="text-xs uppercase font-bold tracking-wider" style={{ color: color.dark }}>
                  {category.label}
                </h2>
                <span className="text-xs text-muted-foreground ml-1">
                  ({unlockedInCategory}/{achievements.length})
                </span>
              </div>
              
              {/* Badge Grid */}
              <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 md:grid-cols-5">
                {achievements.map((achievement, index) => (
                  <BadgeTile
                    key={achievement.id}
                    achievement={achievement}
                    onClick={() => setSelectedAchievement(achievement)}
                    index={index}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <BadgeBottomSheet
        achievement={selectedAchievement}
        open={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
      
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementsPage;
