import { useState } from 'react';
import { ACHIEVEMENTS } from '@/lib/achievementsData';
import { Achievement } from '@/types/achievements';
import { AchievementsHeader } from '@/components/achievements/AchievementsHeader';
import { BadgeTile } from '@/components/achievements/BadgeTile';
import { BadgeBottomSheet } from '@/components/achievements/BadgeBottomSheet';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const AchievementsPage = () => {
  useDocumentTitle('RealiMeali | Achievements');
  
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  const unlockedCount = ACHIEVEMENTS.filter(a => a.isUnlocked).length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="min-h-screen bg-background">
      <AchievementsHeader unlockedCount={unlockedCount} totalCount={totalCount} />
      
      <div className="px-4 pb-24 pt-6">
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 md:grid-cols-5">
          {ACHIEVEMENTS.map((achievement, index) => (
            <BadgeTile
              key={achievement.id}
              achievement={achievement}
              onClick={() => setSelectedAchievement(achievement)}
              index={index}
            />
          ))}
        </div>
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
