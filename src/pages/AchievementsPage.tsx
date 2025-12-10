import { useState } from 'react';
import { Achievement, AchievementCategory } from '@/types/achievements';
import { BadgeTile } from '@/components/achievements/BadgeTile';
import { BadgeBottomSheet } from '@/components/achievements/BadgeBottomSheet';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getBadgeColor } from '@/lib/badgeColors';
import { useAchievements } from '@/hooks/useAchievements';
import { PageHeader } from '@/components/layout/PageHeader';
import { Trophy } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Switch } from '@/components/ui/switch';

const AchievementsPage = () => {
  useDocumentTitle('RealiMeali | Achievements');
  const isMobile = useIsMobile();
  
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showLockedOnly, setShowLockedOnly] = useState(false);
  const { achievements, isLoading } = useAchievements();
  
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  // Filter achievements based on toggle
  const filteredAchievements = showLockedOnly 
    ? achievements.filter(a => !a.isUnlocked)
    : achievements;

  // Group all achievements by category (for totals)
  const allGroupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  // Group filtered achievements by category
  const groupedAchievements = filteredAchievements.reduce((acc, achievement) => {
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
    <div className={`container max-w-7xl py-4 px-4 sm:py-8 sm:px-6 ${isMobile ? 'min-h-screen' : ''}`} data-scroll-content>
      <PageHeader
        icon={
          <Trophy 
            className="h-6 w-6 sm:h-7 sm:w-7" 
            style={{ color: '#F5B82E', stroke: '#F5B82E' }}
            aria-hidden="true"
          />
        }
        title="Achievements"
        description="Earn badges as you cook, plan, and create. Unlock them all to become a true culinary master and showcase your kitchen expertise!"
      />
      
      {/* Toggle and unlocked count */}
      <div className="flex items-center justify-between gap-3 mb-6 px-1">
        <div className="flex items-center gap-2">
          <label htmlFor="show-locked-only" className="text-xs font-medium whitespace-nowrap text-[#1A1A1A]">
            Show badges to unlock
          </label>
          <Switch
            id="show-locked-only"
            checked={showLockedOnly}
            onCheckedChange={setShowLockedOnly}
          />
        </div>
        <div className="text-xs font-medium text-[#1A1A1A]">
          {unlockedCount} / {totalCount} unlocked
        </div>
      </div>
      
      <div className="pb-24 pt-6">
        {categoryMeta.map((category) => {
          const filteredCategoryAchievements = groupedAchievements[category.key] || [];
          const allCategoryAchievements = allGroupedAchievements[category.key] || [];
          const color = getBadgeColor(category.key);
          
          // Skip category if no achievements match the filter
          if (filteredCategoryAchievements.length === 0) {
            return null;
          }
          
          // Calculate display counts based on filter
          const displayCount = showLockedOnly 
            ? filteredCategoryAchievements.length // All filtered are locked
            : filteredCategoryAchievements.filter(a => a.isUnlocked).length; // Count unlocked in filtered
          const totalInCategory = allCategoryAchievements.length;
          
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
                  ({displayCount}/{totalInCategory})
                </span>
              </div>
              
              {/* Badge Grid */}
              <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 md:grid-cols-5">
                {filteredCategoryAchievements.map((achievement, index) => (
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
