export type AchievementRequirementType = 
  | 'cooked_count' 
  | 'chef_insight' 
  | 'family_favourite' 
  | 'perfect_week'
  | 'recipe_count'
  | 'other';

export interface AchievementRequirement {
  type: AchievementRequirementType;
  required: number;
}

export const ACHIEVEMENT_REQUIREMENTS: Record<string, AchievementRequirement> = {
  // Cooking achievements - based on completed meals in meal planner
  '1': { type: 'cooked_count', required: 1 },     // First Bite
  '2': { type: 'cooked_count', required: 5 },     // Home Hero
  '3': { type: 'cooked_count', required: 10 },    // Kitchen Regular
  '4': { type: 'cooked_count', required: 25 },    // Head Chef
  '5': { type: 'chef_insight', required: 1 },     // Chef's Whispers
  '6': { type: 'family_favourite', required: 3 }, // Family Favourite (special case)
  '7': { type: 'perfect_week', required: 1 },     // Perfect Planner
  
  // Recipe creation achievements
  '8': { type: 'recipe_count', required: 1 },     // Recipe Creator
  '9': { type: 'other', required: 1 },            // Web Whiz (URL import)
  '10': { type: 'other', required: 1 },           // Photo Feeder (image import)
  '11': { type: 'other', required: 1 },           // AI Chef (AI generation)
  '12': { type: 'other', required: 1 },           // Meal Maestro (meal generation)
  '13': { type: 'recipe_count', required: 10 },   // Recipe Collector
  '14': { type: 'recipe_count', required: 25 },   // Recipe Master
  '15': { type: 'recipe_count', required: 50 },   // Recipe Legend
  '16': { type: 'other', required: 1 },           // Taste Explorer (Edamam)
  '17': { type: 'other', required: 3 },           // Flavour Hunter
  '18': { type: 'other', required: 5 },           // Culinary Curator
  '19': { type: 'other', required: 10 },          // Recipe Connoisseur
  '20': { type: 'other', required: 1 },           // Leftovers Legend
  '21': { type: 'other', required: 1 },           // Zero Waste Warrior
  '22': { type: 'other', required: 5 },           // Meal Prep Pro
  
  // Meal planning achievements
  '23': { type: 'other', required: 1 },           // Planning Pioneer
  '24': { type: 'other', required: 4 },           // Weekly Warrior
  '25': { type: 'other', required: 12 },          // Monthly Mastermind
  '26': { type: 'other', required: 1 },           // Freestyle Chef
  '27': { type: 'other', required: 5 },           // Improv Master
  
  // Shopping list achievements
  '28': { type: 'other', required: 1 },           // List Maker
  '29': { type: 'other', required: 1 },           // Organised Shopper
  '30': { type: 'other', required: 5 },           // Shopping Streak
  '31': { type: 'other', required: 1 },           // Custom Creator
  '32': { type: 'other', required: 10 },          // List Legend
  
  // Engagement achievements
  '33': { type: 'other', required: 1 },           // Early Bird
  '34': { type: 'other', required: 7 },           // Loyal Cook
  '35': { type: 'other', required: 30 },          // Committed Chef
  '36': { type: 'other', required: 1 },           // Favourite Finder
  '37': { type: 'other', required: 5 },           // Favourite Collector
  '38': { type: 'other', required: 1 },           // Memory Keeper
  
  // Community achievements
  '39': { type: 'other', required: 1 },           // Dinner's Better Together
  '40': { type: 'other', required: 1 },           // Sunday Roast Crew
  '41': { type: 'other', required: 5 },           // The Generous Host
  '42': { type: 'other', required: 1 },           // Kitchen Connector
  '43': { type: 'other', required: 10 },          // Mealfluencer
};
