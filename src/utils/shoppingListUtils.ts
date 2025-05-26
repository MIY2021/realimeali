
export const extractIngredientName = (fullText: string): string => {
  // Remove week prefixes like "week1-", "week2-"
  let cleanText = fullText.replace(/^week\d+-/, '');
  
  // Remove all quantity patterns at the start (more comprehensive)
  // This handles: "1", "1/2", "1 1/4", "2.5", etc. followed by units
  cleanText = cleanText.replace(/^\d+(\s*\/\s*\d+)?(\s+\d+(\s*\/\s*\d+)?)?\s*(g|kg|ml|l|oz|lb|cups?|cup|tbsp|tsp|teaspoons?|tablespoons?|pieces?|slices?|cloves?|pounds?|ounces?|grams?|liters?|milliliters?)?\s*/i, '');
  
  // Remove any remaining standalone numbers at the start
  cleanText = cleanText.replace(/^\d+\s*/, '');
  
  // Remove common quantity words at the start
  cleanText = cleanText.replace(/^(a |an |some |few |bunch of |handful of |pinch of )/i, '');
  
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
