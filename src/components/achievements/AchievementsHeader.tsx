interface AchievementsHeaderProps {
  unlockedCount: number;
  totalCount: number;
}

export const AchievementsHeader = ({ unlockedCount, totalCount }: AchievementsHeaderProps) => {
  return (
    <header className="flex items-start justify-between gap-3 py-4 px-4 border-b">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-xl shrink-0">
          🏅
        </div>
        <div>
          <h1 className="text-2xl font-bold">Achievements</h1>
          <p className="text-sm text-muted-foreground">
            Earn badges as you cook, plan, and create.
          </p>
        </div>
      </div>
      <div className="shrink-0 rounded-full px-3 py-1 text-xs bg-muted text-foreground/80 font-medium">
        {unlockedCount} / {totalCount} unlocked
      </div>
    </header>
  );
};
