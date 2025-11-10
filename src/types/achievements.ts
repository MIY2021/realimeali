export type AchievementCategory = 
  | 'cooking' 
  | 'recipes' 
  | 'planning' 
  | 'shopping' 
  | 'engagement' 
  | 'sustainability'
  | 'community';

export interface Achievement {
  id: string;
  name: string;
  category: AchievementCategory;
  summary: string;
  topTip: string;
  iconName: string;
  sortOrder: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}
