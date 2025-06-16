
export const extractIngredientName = (fullText: string): string => {
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

export const capitalizeShoppingItem = (text: string): string => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
