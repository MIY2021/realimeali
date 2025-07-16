import { supabase } from "@/integrations/supabase/client";

// Cache for categorized items to avoid repeated API calls
const categoryCache = new Map<string, string>();

export async function categorizeShoppingItemWithAI(itemName: string): Promise<string> {
  // Check cache first
  const cacheKey = itemName.toLowerCase().trim();
  if (categoryCache.has(cacheKey)) {
    return categoryCache.get(cacheKey)!;
  }

  try {
    const { data, error } = await supabase.functions.invoke('categorize-shopping-item', {
      body: { itemName }
    });

    if (error) {
      console.error('Error categorizing item:', error);
      return 'misc';
    }

    const category = data?.category || 'misc';
    
    // Cache the result
    categoryCache.set(cacheKey, category);
    
    return category;
  } catch (error) {
    console.error('Failed to categorize shopping item:', error);
    return 'misc';
  }
}

// Clear cache when needed (e.g., on app restart or manual refresh)
export function clearCategorizationCache() {
  categoryCache.clear();
}