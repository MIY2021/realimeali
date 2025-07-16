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
}

// AI-powered category to icon mapping
export const CATEGORY_ICON_MAP: Record<string, any> = {
  // Main categories
  vegetables: Home,
  fruits: Heart,
  meat: Star,
  seafood: Star,
  dairy: Circle,
  eggs: Circle,
  frozen: Circle,
  bakery: Home,
  pantry: Home,
  spices: Star,
  beverages: Circle,
  snacks: Heart,
  condiments: Star,
  
  // Specific iconic items
  pizza: Star,
  bread: Home,
  wine: Circle,
  beer: Circle,
  coffee: Circle,
  milk: Circle,
  cheese: Circle,
  pasta: Home,
  rice: Home,
  butter: Circle,
  tea: Circle,
  
  // Additional categories
  tinned: Home,
  canned: Home,
  soup: Star,
  grapes: Heart,
  herbs: Star,
  
  // Default fallback
  misc: ShoppingBag,
  default: ShoppingBag
};

export function getCategoryIcon(category: string): any {
  return CATEGORY_ICON_MAP[category.toLowerCase()] || CATEGORY_ICON_MAP.default;
}

// Legacy function for fallback when AI categorization fails
export function categorizeShoppingItem(itemName: string): ItemCategory {
  const normalizedName = itemName.toLowerCase().trim();
  
  // Quick static fallbacks for common items
  const staticMappings: Record<string, string> = {
    // Vegetables
    carrot: 'vegetables', potato: 'vegetables', onion: 'vegetables',
    garlic: 'vegetables', tomato: 'vegetables', broccoli: 'vegetables',
    
    // Fruits  
    apple: 'fruits', banana: 'fruits', orange: 'fruits', lemon: 'fruits',
    
    // Dairy
    milk: 'milk', cheese: 'cheese', butter: 'butter', yogurt: 'dairy',
    
    // Meat
    chicken: 'meat', beef: 'meat', pork: 'meat', bacon: 'meat',
    
    // Pantry
    flour: 'pantry', sugar: 'pantry', rice: 'rice', pasta: 'pasta',
    bread: 'bread', oil: 'pantry',
    
    // Beverages
    wine: 'wine', beer: 'beer', coffee: 'coffee', tea: 'tea',
    
    // Specific items
    pizza: 'pizza'
  };

  for (const [keyword, category] of Object.entries(staticMappings)) {
    if (normalizedName.includes(keyword)) {
      return {
        name: category,
        icon: getCategoryIcon(category)
      };
    }
  }
  
  // Default category if no match found
  return {
    name: "misc",
    icon: ShoppingBag
  };
}