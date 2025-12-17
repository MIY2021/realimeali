import { Achievement } from '@/types/achievements';

export const ACHIEVEMENTS: Achievement[] = [
  // Cooking & Chef's Insight (7)
  {
    id: '1',
    name: 'First Bite',
    category: 'cooking',
    summary: "Mark your very first recipe as cooked to unlock this achievement.",
    topTip: 'Try marking it as a favourite too, so you can find it easily later.',
    iconName: 'Flame',
    sortOrder: 1,
    isUnlocked: true,
    unlockedAt: '2024-10-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Home Hero',
    category: 'cooking',
    summary: "Mark 5 different recipes as cooked to earn this badge.",
    topTip: 'Batch cook one or two meals to make busy weeknights easier.',
    iconName: 'ChefHat',
    sortOrder: 2,
    isUnlocked: true,
    unlockedAt: '2024-10-16T14:20:00Z'
  },
  {
    id: '3',
    name: 'Kitchen Regular',
    category: 'cooking',
    summary: "Mark 10 different recipes as cooked to unlock this achievement.",
    topTip: 'Experiment with different cuisines to keep things exciting.',
    iconName: 'UtensilsCrossed',
    sortOrder: 3,
    isUnlocked: true,
    unlockedAt: '2024-10-18T09:15:00Z'
  },
  {
    id: '4',
    name: 'Head Chef',
    category: 'cooking',
    summary: "Mark 25 different recipes as cooked to earn this prestigious badge.",
    topTip: 'Revisit your top-rated meals and refine your own versions.',
    iconName: 'Crown',
    sortOrder: 4,
    isUnlocked: true,
    unlockedAt: '2024-10-20T18:45:00Z'
  },
  {
    id: '5',
    name: "Chef's Whispers",
    category: 'cooking',
    summary: "Open the Chef's Insight tab on any recipe detail page to unlock this achievement.",
    topTip: 'Ask RealiChef for ingredient substitutions or wine pairings.',
    iconName: 'MessageCircle',
    sortOrder: 5,
    isUnlocked: true,
    unlockedAt: '2024-10-21T11:30:00Z'
  },
  {
    id: '6',
    name: 'Family Favourite',
    category: 'cooking',
    summary: "Mark the same recipe as cooked 3 times to unlock this achievement.",
    topTip: 'Save it to your Favourites so you can find it instantly next time.',
    iconName: 'Heart',
    sortOrder: 6,
    isUnlocked: true,
    unlockedAt: '2024-10-22T16:00:00Z'
  },
  {
    id: '7',
    name: 'Perfect Planner',
    category: 'cooking',
    summary: "Complete an entire week by marking every planned meal as cooked.",
    topTip: "Keep planning ahead — it's the easiest way to save money and reduce waste.",
    iconName: 'CalendarCheck',
    sortOrder: 7,
    isUnlocked: true,
    unlockedAt: '2024-10-23T20:10:00Z'
  },
  
  // Recipe Creation & Importing (15)
  {
    id: '8',
    name: 'Recipe Creator',
    category: 'recipes',
    summary: "Add your very first recipe using any method to unlock this achievement.",
    topTip: 'Include prep and cook times to help plan meals more efficiently.',
    iconName: 'PenTool',
    sortOrder: 8,
    isUnlocked: true,
    unlockedAt: '2024-10-24T08:30:00Z'
  },
  {
    id: '9',
    name: 'Web Whiz',
    category: 'recipes',
    summary: 'Import a recipe from a website URL using the "From URL" tab when creating a recipe.',
    topTip: 'Always check measurements — UK vs US conversions can catch you out.',
    iconName: 'Globe',
    sortOrder: 9,
    isUnlocked: true,
    unlockedAt: '2024-10-24T12:45:00Z'
  },
  {
    id: '10',
    name: 'Photo Feeder',
    category: 'recipes',
    summary: 'Add a recipe by uploading or taking a photo using the "From Image" tab when creating a recipe.',
    topTip: 'Use good lighting when photographing recipes to make them easier to read.',
    iconName: 'Camera',
    sortOrder: 10,
    isUnlocked: true,
    unlockedAt: '2024-10-25T15:20:00Z'
  },
  {
    id: '11',
    name: 'AI Chef',
    category: 'recipes',
    summary: 'Use the "Generate with AI" tab when creating a recipe to let RealiChef create one for you.',
    topTip: 'Ask for variations like "make it vegetarian" or "add more spice" for custom twists.',
    iconName: 'Bot',
    sortOrder: 11,
    isUnlocked: true,
    unlockedAt: '2024-10-25T19:00:00Z'
  },
  {
    id: '12',
    name: 'Textbook Taster',
    category: 'recipes',
    summary: 'Add a recipe by pasting text using the "From Text" tab when creating a recipe.',
    topTip: 'Make sure ingredients are on separate lines for smooth shopping list generation.',
    iconName: 'FileText',
    sortOrder: 12,
    isUnlocked: true,
    unlockedAt: '2024-10-26T10:15:00Z'
  },
  {
    id: '13',
    name: 'Recipe Collector',
    category: 'recipes',
    summary: 'Build your recipe collection to 10 recipes using any combination of methods.',
    topTip: 'Mix quick weekday meals with impressive weekend showstoppers.',
    iconName: 'BookOpen',
    sortOrder: 13,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '14',
    name: 'Recipe Master',
    category: 'recipes',
    summary: 'Grow your collection to 25 recipes to earn this achievement.',
    topTip: 'Use cuisine categories and tags to keep your recipe library organized.',
    iconName: 'Library',
    sortOrder: 14,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '15',
    name: 'Recipe Legend',
    category: 'recipes',
    summary: 'Build your collection to 50 recipes to unlock this prestigious achievement.',
    topTip: 'Add seasonal recipes throughout the year to keep variety in your meal plans.',
    iconName: 'Trophy',
    sortOrder: 15,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '16',
    name: 'Fridge Forager',
    category: 'recipes',
    summary: 'Create a recipe using the "What Can I Make?" tab by entering ingredients you have at home.',
    topTip: 'Use this feature weekly before shopping to avoid food waste.',
    iconName: 'Search',
    sortOrder: 16,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '17',
    name: 'Manual Maker',
    category: 'recipes',
    summary: 'Create a recipe from scratch by manually entering all details in the "Manual Entry" tab.',
    topTip: 'Number your steps for clearer cooking instructions.',
    iconName: 'Edit3',
    sortOrder: 17,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '18',
    name: 'Recipe Refiner',
    category: 'recipes',
    summary: "Edit any recipe you've created by clicking the edit button on its detail page.",
    topTip: 'Add personal notes like "less salt next time" to perfect your recipes.',
    iconName: 'Sparkles',
    sortOrder: 18,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '19',
    name: 'Picture Perfect',
    category: 'recipes',
    summary: "Add or upload a photo to any recipe using the image section when creating or editing.",
    topTip: 'Photo your finished dish rather than raw ingredients for better results.',
    iconName: 'ImagePlus',
    sortOrder: 19,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '20',
    name: 'Tip Topper',
    category: 'recipes',
    summary: "Write a custom Top Tip in the notes section when creating or editing a recipe.",
    topTip: 'Share time-saving shortcuts that other household cooks will appreciate.',
    iconName: 'Lightbulb',
    sortOrder: 20,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '21',
    name: 'Tidy Tabs',
    category: 'recipes',
    summary: "View all tabs (Ingredients, Equipment, Instructions, Chef's Insight) on any recipe detail page.",
    topTip: 'Check the Equipment tab before starting to avoid missing tools mid-cook.',
    iconName: 'Tabs',
    sortOrder: 21,
    isUnlocked: false,
    unlockedAt: null
  },
  
  // Meal Planning (4)
  {
    id: '23',
    name: 'Plan Ahead',
    category: 'planning',
    summary: 'Add your first meal to the Meal Planner to start planning your week.',
    topTip: 'Keep one night free for leftovers or takeaway to stay flexible.',
    iconName: 'Calendar',
    sortOrder: 23,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '24',
    name: 'Add to Plan',
    category: 'planning',
    summary: 'Manually add a recipe to your meal plan by clicking "Add to Meal Plan" from any recipe.',
    topTip: 'Drag and drop planned meals between days to reorganize your week.',
    iconName: 'Plus',
    sortOrder: 24,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '25',
    name: 'Auto-Magician',
    category: 'planning',
    summary: 'Click the "Generate Meal Plan" button in the Meal Planner to auto-create your week.',
    topTip: 'Review portion sizes and swap meals if needed before finalizing.',
    iconName: 'Wand2',
    sortOrder: 25,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '26',
    name: 'Share the Plan',
    category: 'planning',
    summary: 'Use the share button in the Meal Planner to send your weekly plan to household members.',
    topTip: "Get everyone's input before shopping to avoid midweek meal complaints.",
    iconName: 'Share2',
    sortOrder: 26,
    isUnlocked: false,
    unlockedAt: null
  },
  
  // Shopping & Pantry (6)
  {
    id: '27',
    name: 'Budget Baker',
    category: 'shopping',
    summary: 'Generate your first shopping list from your meal plan in the Shopping List section.',
    topTip: 'Items are automatically grouped by category for easier shopping.',
    iconName: 'ShoppingCart',
    sortOrder: 27,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '28',
    name: 'Smart Shopper',
    category: 'shopping',
    summary: 'Check off 10 items on any shopping list to unlock this achievement.',
    topTip: 'Use "Hide Checked" to focus only on remaining items in your cart.',
    iconName: 'CheckCircle2',
    sortOrder: 28,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '29',
    name: 'Pantry Pro',
    category: 'shopping',
    summary: 'Manually add a custom item to your shopping list using the "Add Item" button.',
    topTip: 'Add pantry staples manually so you never forget essentials like olive oil.',
    iconName: 'Package',
    sortOrder: 29,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '30',
    name: 'List Lover',
    category: 'shopping',
    summary: 'Generate 5 separate shopping lists from your meal plans over time.',
    topTip: 'Generate a new list each week to stay organized and track spending.',
    iconName: 'ListChecks',
    sortOrder: 30,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '31',
    name: 'Clear Conscience',
    category: 'shopping',
    summary: 'Click "Clear All" on a completed shopping list to start fresh for the next week.',
    topTip: 'Clear your list weekly to keep it tidy and ready for the next shop.',
    iconName: 'Trash2',
    sortOrder: 31,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '32',
    name: 'Share the Load',
    category: 'shopping',
    summary: 'Share your shopping list with household members using the share button.',
    topTip: 'Split up categories (you grab produce, they get dairy) to shop faster together.',
    iconName: 'Users',
    sortOrder: 32,
    isUnlocked: false,
    unlockedAt: null
  },
  
  // Everyday Engagement (4)
  {
    id: '33',
    name: 'Kitchen Explorer',
    category: 'engagement',
    summary: "Visit all main sections: Dashboard, My Recipes, Meal Planner, Shopping List, and Discover.",
    topTip: 'Check the Discover tab weekly for fresh recipe inspiration.',
    iconName: 'Compass',
    sortOrder: 33,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '34',
    name: 'Daily Dash of Salt',
    category: 'engagement',
    summary: 'Log in to RealiMeali for 5 consecutive days to build your cooking routine.',
    topTip: 'Set a Sunday reminder to plan your meals for smoother weeks ahead.',
    iconName: 'Zap',
    sortOrder: 34,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '35',
    name: 'Stir Crazy',
    category: 'engagement',
    summary: 'Use RealiMeali actively for 4 weeks by adding recipes, planning meals, or marking recipes cooked.',
    topTip: 'Stay active by checking in weekly — even browsing recipes counts!',
    iconName: 'TrendingUp',
    sortOrder: 35,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '36',
    name: 'Kitchen Keeper',
    category: 'engagement',
    summary: "Log in and stay active on RealiMeali for 30 consecutive days.",
    topTip: 'After 30 days of planning and cooking, treat yourself to a night off!',
    iconName: 'Award',
    sortOrder: 36,
    isUnlocked: false,
    unlockedAt: null
  },
  
  // Sustainability (2)
  {
    id: '37',
    name: 'Waste Watcher',
    category: 'sustainability',
    summary: 'Add leftovers to your meal plan by using the "Add Leftovers" feature.',
    topTip: 'Schedule a weekly "leftovers night" to reduce food waste.',
    iconName: 'Leaf',
    sortOrder: 37,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '38',
    name: 'Zero Waste Week',
    category: 'sustainability',
    summary: 'Mark 3 different leftover meals as cooked within a 7-day period.',
    topTip: 'Label leftover containers with dates to track freshness and avoid waste.',
    iconName: 'Recycle',
    sortOrder: 38,
    isUnlocked: false,
    unlockedAt: null
  },
  
  // Community & Invitations (5)
  {
    id: '39',
    name: "Dinner's Better Together",
    category: 'community',
    summary: "Invite your first household member or friend to RealiMeali.",
    topTip: 'Share recipes and meal plans with household members to cook together more easily.',
    iconName: 'UserPlus',
    sortOrder: 39,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '40',
    name: 'Sunday Roast Crew',
    category: 'community',
    summary: "Have all invited household members each add at least one recipe to their collection.",
    topTip: 'Encourage everyone to add their signature dish to build a family cookbook.',
    iconName: 'UsersRound',
    sortOrder: 40,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '41',
    name: 'The Generous Host',
    category: 'community',
    summary: "Successfully invite 5 friends outside your household who join RealiMeali.",
    topTip: 'Share your favorite recipes when inviting to show what they can achieve.',
    iconName: 'Gift',
    sortOrder: 41,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '42',
    name: 'Kitchen Connector',
    category: 'community',
    summary: "Have someone you invited also invite another user (create a second-generation invite).",
    topTip: 'The best way to grow is to help others discover the joy of organized cooking.',
    iconName: 'Network',
    sortOrder: 42,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '43',
    name: 'Mealfluencer',
    category: 'community',
    summary: "Successfully invite 10 people to join RealiMeali.",
    topTip: 'Share how RealiMeali has helped you save time and reduce food waste.',
    iconName: 'Megaphone',
    sortOrder: 43,
    isUnlocked: false,
    unlockedAt: null
  },
  
  // Meal Plan Creation (5)
  {
    id: '44',
    name: 'Copy Cat',
    category: 'planning',
    summary: "Copy an existing meal plan to quickly reuse a week you loved.",
    topTip: 'Copy your best weeks and tweak just one or two meals for easy variety.',
    iconName: 'Copy',
    sortOrder: 44,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '45',
    name: 'Plan Starter',
    category: 'planning',
    summary: "Create 5 meal plans to build your weekly planning habit.",
    topTip: 'Aim to plan your week every Sunday — consistency is key!',
    iconName: 'CalendarDays',
    sortOrder: 45,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '46',
    name: 'Plan Builder',
    category: 'planning',
    summary: "Create 10 meal plans and establish yourself as a planning pro.",
    topTip: 'Review past plans to spot patterns and optimize your grocery shopping.',
    iconName: 'CalendarRange',
    sortOrder: 46,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '47',
    name: 'Plan Master',
    category: 'planning',
    summary: "Create 25 meal plans to earn this prestigious planning badge.",
    topTip: 'By now you know what works — save your favourite plans for quick reuse.',
    iconName: 'Medal',
    sortOrder: 47,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '48',
    name: 'Plan Legend',
    category: 'planning',
    summary: "Create 50 meal plans and become a true meal planning legend.",
    topTip: "You've mastered meal planning — consider sharing your tips with others!",
    iconName: 'Milestone',
    sortOrder: 48,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '49',
    name: 'Serving Sizer',
    category: 'recipes',
    summary: "Adjust the serving size on any recipe to scale the ingredients up or down.",
    topTip: 'Double up portions when batch cooking to save time later in the week.',
    iconName: 'Scale',
    sortOrder: 49,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '50',
    name: 'Streak Starter',
    category: 'planning',
    summary: "Plan your meals for 3 consecutive weeks without missing a week.",
    topTip: 'Consistency is the secret to stress-free dinners — keep the streak going!',
    iconName: 'Repeat',
    sortOrder: 50,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '51',
    name: 'Recipe Reunion',
    category: 'cooking',
    summary: "Cook a recipe you haven't made in over 30 days — rediscover an old favourite!",
    topTip: 'Revisiting past hits keeps your menu exciting without the effort of finding something new.',
    iconName: 'History',
    sortOrder: 51,
    isUnlocked: false,
    unlockedAt: null
  },
];
