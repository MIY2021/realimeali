import { Achievement } from '@/types/achievements';

export const ACHIEVEMENTS: Achievement[] = [
  // Cooking & Chef's Insight (7)
  {
    id: '1',
    name: 'First Bite',
    category: 'cooking',
    summary: "You've marked your very first recipe as cooked — the journey begins!",
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
    summary: "Cooked 5 recipes — you're officially running the household kitchen.",
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
    summary: "Cooked 10 recipes — you're becoming a true kitchen regular!",
    topTip: 'Experiment with cuisines to keep things exciting.',
    iconName: 'UtensilsCrossed',
    sortOrder: 3,
    isUnlocked: true,
    unlockedAt: '2024-10-18T09:15:00Z'
  },
  {
    id: '4',
    name: 'Head Chef',
    category: 'cooking',
    summary: "25 cooked recipes! You're leading your household like a pro chef.",
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
    summary: "You explored the Chef's Insight tab — tips, pairings, and a little AI wisdom.",
    topTip: 'Ask RealiChef for substitutions or wine pairings next time.',
    iconName: 'MessageCircle',
    sortOrder: 5,
    isUnlocked: true,
    unlockedAt: '2024-10-21T11:30:00Z'
  },
  {
    id: '6',
    name: 'Family Favourite',
    category: 'cooking',
    summary: "Cooked the same recipe three times — it's officially a family hit!",
    topTip: 'Save it to your Favourites so you can find it instantly.',
    iconName: 'Heart',
    sortOrder: 6,
    isUnlocked: true,
    unlockedAt: '2024-10-22T16:00:00Z'
  },
  {
    id: '7',
    name: 'Perfect Planner',
    category: 'cooking',
    summary: "Every meal in your weekly plan has been cooked. That's a flawless week!",
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
    summary: "You've added your first recipe to RealiMeali — your personal collection starts here.",
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
    summary: 'Imported your first recipe from a website. Smart and speedy!',
    topTip: 'Check measurements — UK vs US conversions can catch you out.',
    iconName: 'Globe',
    sortOrder: 9,
    isUnlocked: true,
    unlockedAt: '2024-10-24T12:45:00Z'
  },
  {
    id: '10',
    name: 'Photo Feeder',
    category: 'recipes',
    summary: 'Added a recipe from a photo — delicious memories saved forever.',
    topTip: 'Use good lighting — clear photos make recipes easier to follow later.',
    iconName: 'Camera',
    sortOrder: 10,
    isUnlocked: true,
    unlockedAt: '2024-10-25T15:20:00Z'
  },
  {
    id: '11',
    name: 'AI Chef',
    category: 'recipes',
    summary: 'Let RealiChef AI whip up a brand-new recipe for you.',
    topTip: 'Ask for variations — "make it vegetarian" or "add spice" for new twists.',
    iconName: 'Bot',
    sortOrder: 11,
    isUnlocked: true,
    unlockedAt: '2024-10-25T19:00:00Z'
  },
  {
    id: '12',
    name: 'Textbook Taster',
    category: 'recipes',
    summary: 'Added a recipe by pasting text — easy and classic.',
    topTip: 'Double-check ingredient formatting for smooth shopping list generation.',
    iconName: 'FileText',
    sortOrder: 12,
    isUnlocked: true,
    unlockedAt: '2024-10-26T10:15:00Z'
  },
  {
    id: '13',
    name: 'Fridge Forager',
    category: 'recipes',
    summary: 'Created a meal using "What Can I Make?" — nothing goes to waste!',
    topTip: 'Try this weekly before your food shop to use up leftovers.',
    iconName: 'Search',
    sortOrder: 13,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '14',
    name: 'Manual Maker',
    category: 'recipes',
    summary: 'Manually entered your own recipe — true culinary craftsmanship.',
    topTip: 'Add step numbers for clearer cooking instructions.',
    iconName: 'Edit3',
    sortOrder: 14,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '15',
    name: 'Recipe Collector',
    category: 'recipes',
    summary: 'Added 5 recipes — your digital cookbook is taking shape.',
    topTip: 'Mix in quick weekday meals with your showstoppers.',
    iconName: 'BookOpen',
    sortOrder: 15,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '16',
    name: 'Recipe Curator',
    category: 'recipes',
    summary: "25 recipes added — you're curating a proper collection.",
    topTip: 'Use the "Cuisine" tag to keep your recipe library tidy.',
    iconName: 'Library',
    sortOrder: 16,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '17',
    name: 'Recipe Mastermind',
    category: 'recipes',
    summary: "50 recipes created — you've built a kitchen empire.",
    topTip: 'Review your top 10 recipes and share them with your household.',
    iconName: 'GraduationCap',
    sortOrder: 17,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '18',
    name: 'Recipe Legend',
    category: 'recipes',
    summary: "100 recipes added — that's next-level dedication!",
    topTip: 'Try adding seasonal recipes — it keeps your meal plans fresh year-round.',
    iconName: 'Trophy',
    sortOrder: 18,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '19',
    name: 'Recipe Refiner',
    category: 'recipes',
    summary: "You've edited a recipe — perfection takes practice.",
    topTip: 'Add cooking notes for your future self ("less salt next time!").',
    iconName: 'Sparkles',
    sortOrder: 19,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '20',
    name: 'Picture Perfect',
    category: 'recipes',
    summary: "Added a photo to a recipe — it's all in the presentation.",
    topTip: 'Capture your final plate — food looks better than ingredients!',
    iconName: 'ImagePlus',
    sortOrder: 20,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '21',
    name: 'Tip Topper',
    category: 'recipes',
    summary: 'Added your own Top Tip — share your inner chef wisdom.',
    topTip: 'Add time-saving tips — other household cooks will thank you.',
    iconName: 'Lightbulb',
    sortOrder: 21,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '22',
    name: 'Tidy Tabs',
    category: 'recipes',
    summary: 'You explored every recipe tab (Ingredients, Equipment, Instructions).',
    topTip: 'Use the Equipment tab before you start — no missing whisks mid-dinner!',
    iconName: 'Tabs',
    sortOrder: 22,
    isUnlocked: false,
    unlockedAt: null
  },
  
  // Meal Planning (4)
  {
    id: '23',
    name: 'Plan Ahead',
    category: 'planning',
    summary: 'You created your first weekly meal plan — the secret to stress-free cooking.',
    topTip: 'Keep one night free for leftovers or takeaway flexibility.',
    iconName: 'Calendar',
    sortOrder: 23,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '24',
    name: 'Add to Plan',
    category: 'planning',
    summary: 'Added a meal to your plan manually — a proper planner!',
    topTip: 'Drag and drop meals to adjust your week easily.',
    iconName: 'Plus',
    sortOrder: 24,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '25',
    name: 'Auto-Magician',
    category: 'planning',
    summary: 'Used the Generate button — meal plans at the tap of a button.',
    topTip: 'Review generated plans for portion sizes before locking them in.',
    iconName: 'Wand2',
    sortOrder: 25,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '26',
    name: 'Share the Plan',
    category: 'planning',
    summary: 'Shared your meal plan — teamwork makes the dream dinner work.',
    topTip: 'Get feedback from family before shopping — saves midweek complaints.',
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
    summary: 'Created your first shopping list — organised and ready to roll.',
    topTip: 'Group items by aisle for smoother shopping trips.',
    iconName: 'ShoppingCart',
    sortOrder: 27,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '28',
    name: 'Smart Shopper',
    category: 'shopping',
    summary: 'Ticked off 10 items — efficient and satisfying.',
    topTip: 'Use "Hide Checked" to focus on what\'s left in your trolley.',
    iconName: 'CheckCircle2',
    sortOrder: 28,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '29',
    name: 'Pantry Pro',
    category: 'shopping',
    summary: 'Added a manual item — custom lists for custom cooks.',
    topTip: 'Add pantry staples once; reuse them across weeks.',
    iconName: 'Package',
    sortOrder: 29,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '30',
    name: 'List Lover',
    category: 'shopping',
    summary: 'Made 5 shopping lists — a grocery guru in action.',
    topTip: 'Use weeks as list titles for easy tracking (e.g. "Week 42 Shop").',
    iconName: 'ListChecks',
    sortOrder: 30,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '31',
    name: 'Clear Conscience',
    category: 'shopping',
    summary: 'Used Clear All — a fresh start for your next plan.',
    topTip: 'Do this weekly to keep things tidy and reduce old leftovers.',
    iconName: 'Trash2',
    sortOrder: 31,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '32',
    name: 'Share the Load',
    category: 'shopping',
    summary: 'Shared your list — delegation level: expert.',
    topTip: 'Divide sections (you take veg, they take dairy) for faster trips.',
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
    summary: "You've visited every section — you now know the full RealiMeali world.",
    topTip: 'Check the Discover tab weekly for new inspiration.',
    iconName: 'Compass',
    sortOrder: 33,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '34',
    name: 'Daily Dash of Salt',
    category: 'engagement',
    summary: 'Logged in 5 days in a row — consistent cooking power!',
    topTip: 'Set reminders to plan meals on Sundays for smoother weeks.',
    iconName: 'Zap',
    sortOrder: 34,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '35',
    name: 'Stir Crazy',
    category: 'engagement',
    summary: 'Stayed active for 4 weeks — your kitchen rhythm is strong.',
    topTip: 'Keep that streak — even adding recipes counts!',
    iconName: 'TrendingUp',
    sortOrder: 35,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '36',
    name: 'Kitchen Keeper',
    category: 'engagement',
    summary: "Used RealiMeali for 30 straight days — you're officially part of the furniture.",
    topTip: 'Treat yourself — maybe a night off cooking!',
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
    summary: 'Used the leftovers feature — nothing wasted, everything tasty.',
    topTip: 'Keep a "leftovers night" in your weekly plan.',
    iconName: 'Leaf',
    sortOrder: 37,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '38',
    name: 'Zero Waste Week',
    category: 'sustainability',
    summary: 'Marked leftovers as cooked/done 3 times in 7 days — a true eco hero.',
    topTip: 'Label leftover containers with dates so nothing sneaks past you.',
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
    summary: "The first invite always tastes the sweetest — cooking's better when shared.",
    topTip: 'Reward: Unlock bonus recipe credits or early access to premium recipes. Complexity: ⭐ (simple count check — when invites = 1)',
    iconName: 'UserPlus',
    sortOrder: 39,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '40',
    name: 'Sunday Roast Crew',
    category: 'community',
    summary: "Everyone's brought a dish to the table — your household is officially a culinary crew.",
    topTip: 'Reward: Unlocks a custom household badge or theme colour. Complexity: ⭐⭐ (check that each invited user has recipes_added > 0)',
    iconName: 'UsersRound',
    sortOrder: 40,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '41',
    name: 'The Generous Host',
    category: 'community',
    summary: "You've opened your kitchen to the world. Sharing meals, sharing magic.",
    topTip: 'Reward: Unlocks hidden "community gem" recipes. Complexity: ⭐ (count of successful external invites ≥ 5)',
    iconName: 'Gift',
    sortOrder: 41,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '42',
    name: 'Kitchen Connector',
    category: 'community',
    summary: "You started a ripple effect of recipes — a true culinary catalyst.",
    topTip: 'Reward: XP multiplier for 7 days or an "Influencer Apron" badge. Complexity: ⭐⭐⭐ (requires second-level invite tracking)',
    iconName: 'Network',
    sortOrder: 42,
    isUnlocked: false,
    unlockedAt: null
  },
  {
    id: '43',
    name: 'Mealfluencer',
    category: 'community',
    summary: "Ten new cooks joined because of you — you're officially stirring up a movement.",
    topTip: 'Reward: Featured recipe slot or "Verified Chef" badge. Complexity: ⭐ (count of successful invites ≥ 10)',
    iconName: 'Megaphone',
    sortOrder: 43,
    isUnlocked: false,
    unlockedAt: null
  },
];
