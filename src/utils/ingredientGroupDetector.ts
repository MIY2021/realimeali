/**
 * Conservative validation utility for ingredient groups
 * Only flags obvious misses - uses semantic keywords combined with context
 * Avoids false positives by being very conservative
 */

// Common group indicator keywords (semantic, not pattern-based)
const GROUP_KEYWORDS = [
  'dressing',
  'sauce',
  'marinade',
  'topping',
  'garnish',
  'filling',
  'crust',
  'batter',
  'glaze',
  'rub',
  'spice mix',
  'seasoning',
  'paste',
  'puree',
  'reduction',
  'frosting',
  'icing',
  'syrup',
  'vinaigrette',
  'mayonnaise',
  'aioli',
  'salsa',
  'relish',
  'chutney',
  'pickle',
  'brine',
  'cure',
  'mash',
  'puree',
  'emulsion',
];

// Common measurement words that indicate an individual ingredient
const MEASUREMENT_WORDS = [
  'cup', 'cups', 'tbsp', 'tablespoon', 'tablespoons', 'tsp', 'teaspoon', 'teaspoons',
  'oz', 'ounce', 'ounces', 'lb', 'pound', 'pounds', 'g', 'gram', 'grams', 'kg', 'kilogram',
  'ml', 'milliliter', 'milliliters', 'l', 'liter', 'liters', 'fl oz', 'fluid ounce',
  'pinch', 'dash', 'splash', 'handful', 'bunch', 'head', 'clove', 'cloves', 'piece', 'pieces',
  'can', 'cans', 'jar', 'jars', 'bottle', 'bottles', 'package', 'packages', 'box', 'boxes',
  'slice', 'slices', 'strip', 'strips', 'leaf', 'leaves', 'stalk', 'stalks',
];

// Check if text contains a number or fraction
function hasQuantity(text: string): boolean {
  // Check for numbers
  if (/\d/.test(text)) return true;
  
  // Check for fractions (1/2, 1/4, etc.)
  if (/[\d]+\/[\d]+/.test(text)) return true;
  
  // Check for measurement words
  const lowerText = text.toLowerCase();
  return MEASUREMENT_WORDS.some(word => lowerText.includes(word));
}

// Check if text contains a group keyword
function hasGroupKeyword(text: string): boolean {
  const lowerText = text.toLowerCase();
  return GROUP_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

// Check if text is likely a group header based on context
function isLikelyGroupHeader(
  text: string,
  index: number,
  allIngredients: string[]
): boolean {
  const trimmed = text.trim();
  
  // Already has colon - assume it's correctly formatted
  if (trimmed.endsWith(':')) return false;
  
  // Has quantity - definitely not a group
  if (hasQuantity(trimmed)) return false;
  
  // Must have a group keyword
  if (!hasGroupKeyword(trimmed)) return false;
  
  // Check context: should be followed by multiple ingredients (at least 2)
  const followingIngredients = allIngredients.slice(index + 1, index + 4);
  const hasFollowingIngredients = followingIngredients.length >= 2;
  
  // Also check if it starts with "For the" or "For" which are strong indicators
  const startsWithFor = /^for\s+(the\s+)?/i.test(trimmed);
  
  // Very conservative: only flag if it has keyword AND (has following ingredients OR starts with "For")
  return hasFollowingIngredients || startsWithFor;
}

export interface ValidationResult {
  corrected: string[];
  detected: number;
  ambiguous: string[];
}

/**
 * Conservative validation that only flags obvious group header misses
 * Uses semantic keywords + context, avoids false positives
 * 
 * @param ingredients - Array of ingredient strings
 * @returns Object with corrected array, count of detections, and ambiguous cases
 */
export function validateIngredientGroups(ingredients: string[]): ValidationResult {
  const corrected: string[] = [];
  const ambiguous: string[] = [];
  let detected = 0;
  
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return { corrected: ingredients, detected: 0, ambiguous: [] };
  }
  
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    
    if (!ingredient || typeof ingredient !== 'string') {
      corrected.push(ingredient);
      continue;
    }
    
    const trimmed = ingredient.trim();
    
    // Skip empty entries
    if (!trimmed) {
      corrected.push(ingredient);
      continue;
    }
    
    // Already has colon - keep as is
    if (trimmed.endsWith(':')) {
      corrected.push(ingredient);
      continue;
    }
    
    // Check if this is likely a missed group header
    if (isLikelyGroupHeader(trimmed, i, ingredients)) {
      // Very conservative: only auto-fix if it's very clear
      const hasGroupKeyword = GROUP_KEYWORDS.some(kw => trimmed.toLowerCase().includes(kw));
      const startsWithFor = /^for\s+(the\s+)?/i.test(trimmed);
      
      // Only auto-fix if it has keyword AND starts with "For" (very clear case)
      // Otherwise, log as ambiguous for review
      if (hasGroupKeyword && startsWithFor) {
        corrected.push(trimmed.endsWith(':') ? trimmed : `${trimmed}:`);
        detected++;
        console.log(`[IngredientGroupDetector] Auto-fixed group header: "${trimmed}" → "${trimmed}:"`);
      } else {
        // Has keyword but ambiguous - log for review
        ambiguous.push(trimmed);
        corrected.push(ingredient); // Keep original
        console.log(`[IngredientGroupDetector] Potential missed group (ambiguous): "${trimmed}"`);
      }
    } else {
      // Not a group header - keep as is
      corrected.push(ingredient);
    }
  }
  
  return {
    corrected,
    detected,
    ambiguous,
  };
}

