import { 
  Circle,
  ShoppingBag,
  Heart,
  Home,
  Star
} from "lucide-react";

export interface ItemCategory {
  name: string;
  icon: any;
  keywords: string[];
}

export const SHOPPING_CATEGORIES: ItemCategory[] = [
  {
    name: "dairy",
    icon: Circle,
    keywords: [
      "milk", "cheese", "butter", "yogurt", "yoghurt", "cream", "sour cream",
      "cottage cheese", "cheddar", "mozzarella", "parmesan", "feta", "brie",
      "camembert", "ricotta", "mascarpone", "greek yogurt"
    ]
  },
  {
    name: "vegetables",
    icon: Home,
    keywords: [
      "carrot", "potato", "onion", "garlic", "tomato", "cucumber", "pepper",
      "bell pepper", "broccoli", "cauliflower", "spinach", "lettuce", "cabbage",
      "celery", "mushroom", "zucchini", "eggplant", "aubergine", "leek",
      "beetroot", "radish", "turnip", "parsnip", "sweet potato", "corn",
      "peas", "green beans", "asparagus", "artichoke", "kale", "chard"
    ]
  },
  {
    name: "fruits",
    icon: Heart,
    keywords: [
      "apple", "banana", "orange", "lemon", "lime", "grape", "strawberry",
      "blueberry", "raspberry", "blackberry", "cherry", "peach", "pear",
      "plum", "apricot", "mango", "pineapple", "kiwi", "watermelon", "melon",
      "cantaloupe", "honeydew", "coconut", "avocado", "pomegranate", "fig"
    ]
  },
  {
    name: "meat",
    icon: Star,
    keywords: [
      "beef", "chicken", "pork", "lamb", "turkey", "duck", "bacon", "ham",
      "sausage", "ground beef", "mince", "steak", "chops", "ribs", "wings",
      "thighs", "breast", "drumsticks", "salami", "pepperoni", "prosciutto"
    ]
  },
  {
    name: "seafood",
    icon: Star,
    keywords: [
      "fish", "salmon", "tuna", "cod", "haddock", "mackerel", "sardines",
      "anchovies", "trout", "halibut", "sole", "prawns", "shrimp", "crab",
      "lobster", "mussels", "clams", "oysters", "scallops", "squid", "octopus"
    ]
  },
  {
    name: "pantry",
    icon: Home,
    keywords: [
      "flour", "sugar", "salt", "pepper", "rice", "pasta", "bread", "cereal",
      "oats", "quinoa", "barley", "lentils", "beans", "chickpeas", "oil",
      "olive oil", "vinegar", "soy sauce", "honey", "syrup", "vanilla",
      "spices", "herbs", "garlic powder", "onion powder", "paprika", "cumin",
      "oregano", "basil", "thyme", "rosemary", "cinnamon", "nutmeg", "ginger"
    ]
  },
  {
    name: "frozen",
    icon: Circle,
    keywords: [
      "frozen", "ice cream", "frozen vegetables", "frozen fruit", "frozen peas",
      "frozen corn", "frozen berries", "frozen pizza", "frozen meals",
      "ice", "popsicles", "sorbet", "frozen yogurt"
    ]
  },
  {
    name: "eggs",
    icon: Circle,
    keywords: ["eggs", "egg", "dozen eggs"]
  },
  {
    name: "beverages",
    icon: Circle,
    keywords: [
      "coffee", "tea", "juice", "soda", "water", "beer", "wine", "whiskey",
      "vodka", "rum", "gin", "champagne", "sparkling water", "energy drink",
      "soft drink", "lemonade", "iced tea", "hot chocolate", "smoothie"
    ]
  }
];

export function categorizeShoppingItem(itemName: string): ItemCategory {
  const normalizedName = itemName.toLowerCase().trim();
  
  // Find the category that matches the item
  for (const category of SHOPPING_CATEGORIES) {
    for (const keyword of category.keywords) {
      if (normalizedName.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Default category if no match found
  return {
    name: "misc",
    icon: ShoppingBag,
    keywords: []
  };
}