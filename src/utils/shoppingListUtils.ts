import { AIIngredientExtractionService } from "@/services/aiIngredientExtraction";

export const extractIngredientName = async (fullText: string): Promise<string> => {
  // For better performance, try AI extraction first, fall back to regex if needed
  try {
    return await AIIngredientExtractionService.extractIngredientName(fullText);
  } catch (error) {
    console.error('AI extraction failed, using fallback:', error);
    return extractIngredientNameFallback(fullText);
  }
};

// Keep the existing regex-based extraction as a fallback
export const extractIngredientNameFallback = (fullText: string): string => {
  // Remove week prefixes like "week1-", "week2-"
  let cleanText = fullText.replace(/^week\d+-/, '');
  
  // Remove all quantity patterns at the start (more comprehensive)
  // This handles: "1", "1/2", "½", "1 1/4", "2.5", "400g", etc.
  cleanText = cleanText.replace(/^[\d½¼¾⅓⅔⅛⅜⅝⅞]+(\s*[./]\s*[\d½¼¾⅓⅔⅛⅜⅝⅞]+)?(\s+[\d½¼¾⅓⅔⅛⅜⅝⅞]+(\s*[./]\s*[\d½¼¾⅓⅔⅛⅜⅝⅞]+)?)?\s*/g, '');
  
  // Remove standalone quantities with units at the beginning
  cleanText = cleanText.replace(/^\d+\s*(g|kg|ml|l|oz|lb|cups?|cup|tbsp|tsp|teaspoons?|tablespoons?|pieces?|slices?|cloves?|pounds?|ounces?|grams?|liters?|milliliters?|pints?|quarts?|gallons?)\s+/gi, '');
  
  // Remove units without quantities (like "g black olives" -> "black olives")
  cleanText = cleanText.replace(/^(g|kg|ml|l|oz|lb|cups?|cup|tbsp|tsp|teaspoons?|tablespoons?|pieces?|slices?|cloves?|pounds?|ounces?|grams?|liters?|milliliters?|pints?|quarts?|gallons?)\s+/gi, '');
  
  // Remove any remaining standalone numbers at the start
  cleanText = cleanText.replace(/^[\d½¼¾⅓⅔⅛⅜⅝⅞]+\s*/g, '');
  
  // Remove common quantity words at the start
  cleanText = cleanText.replace(/^(a |an |some |few |bunch of |handful of |pinch of )/i, '');
  
  // Remove parenthetical descriptions entirely (like "(or 200g dried lentils, rinsed)")
  cleanText = cleanText.replace(/\s*\([^)]*\)/g, '');
  
  // Remove descriptive terms that come after commas (like ", pitted and halved", ", rinsed")
  cleanText = cleanText.replace(/,\s*(toasted|chopped|diced|minced|sliced|grated|fresh|dried|ground|whole|crushed|powder|paste|sauce|oil|extract|juice|zest|peeled|canned|frozen|cooked|raw|organic|unsalted|salted|extra virgin|virgin|light|dark|heavy|thick|thin|fine|coarse|large|small|medium|pitted|halved|rinsed|drained|and.*$).*$/gi, '');
  
  // Remove any trailing descriptive words after the main ingredient
  cleanText = cleanText.replace(/\s+(toasted|chopped|diced|minced|sliced|grated|fresh|dried|ground|whole|crushed|powder|paste|sauce|oil|extract|juice|zest|peeled|canned|frozen|cooked|raw|organic|unsalted|salted|extra virgin|virgin|light|dark|heavy|thick|thin|fine|coarse|large|small|medium|pitted|halved|rinsed|drained).*$/gi, '');
  
  // Clean up extra whitespace and capitalize properly
  cleanText = cleanText.trim();
  
  // Handle edge cases where the ingredient starts with descriptive words
  cleanText = cleanText.replace(/^(cooked|dried|fresh|canned|frozen|raw|organic)\s+/i, '');
  
  // Capitalize first letter of each word
  return cleanText
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
};

export const formatQuantity = (quantity: number | undefined): string => {
  if (!quantity) return '';
  
  // Common fraction mappings
  const fractionMap: { [key: number]: string } = {
    0.125: '⅛',
    0.166: '⅙',
    0.2: '⅕',
    0.25: '¼',
    0.333: '⅓',
    0.5: '½',
    0.666: '⅔',
    0.75: '¾',
    0.833: '⅚'
  };
  
  // Check if it's a whole number
  if (quantity === Math.floor(quantity)) {
    return quantity.toString();
  }
  
  // Check for common fractions (with tolerance for floating point errors)
  const tolerance = 0.02;
  for (const [decimal, fraction] of Object.entries(fractionMap)) {
    if (Math.abs(quantity - parseFloat(decimal)) < tolerance) {
      return fraction;
    }
    
    // Check for mixed numbers (e.g., 1.5 → "1½")
    const wholeNumber = Math.floor(quantity);
    const remainder = quantity - wholeNumber;
    if (wholeNumber > 0 && Math.abs(remainder - parseFloat(decimal)) < tolerance) {
      return `${wholeNumber}${fraction}`;
    }
  }
  
  // Round to 2 decimal places for display
  const rounded = Math.round(quantity * 100) / 100;
  
  // If it rounds to a whole number, show it as such
  if (rounded === Math.floor(rounded)) {
    return rounded.toString();
  }
  
  // Otherwise show up to 2 decimal places, removing trailing zeros
  return rounded.toString();
};

export const capitalizeShoppingItem = (text: string): string => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
