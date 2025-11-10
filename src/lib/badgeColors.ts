import { AchievementCategory } from '@/types/achievements';

export const BADGE_COLORS: Record<AchievementCategory, {
  base: string;
  light: string;
  dark: string;
}> = {
  cooking: { base: '#FF6B35', light: '#FF8C5A', dark: '#E85A2A' },
  recipes: { base: '#4A90E2', light: '#6BA5E7', dark: '#3A7BC8' },
  planning: { base: '#50C878', light: '#6FD98E', dark: '#40B368' },
  shopping: { base: '#9B59B6', light: '#B07CC6', dark: '#8E44AD' },
  engagement: { base: '#FF69B4', light: '#FF8DC7', dark: '#E5539F' },
  sustainability: { base: '#20B2AA', light: '#4DC4BD', dark: '#1A9D96' },
  community: { base: '#F59E0B', light: '#FBBF24', dark: '#D97706' },
};

export function getBadgeColor(category: AchievementCategory) {
  return BADGE_COLORS[category];
}
