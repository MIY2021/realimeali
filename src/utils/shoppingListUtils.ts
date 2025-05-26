
export const extractIngredientName = (fullText: string): string => {
  // Remove week prefixes like "week1-", "week2-"
  let cleanText = fullText.replace(/^week\d+-/, '');
  
  // Remove quantity prefixes (numbers + units at the start)
  cleanText = cleanText.replace(/^\d+\s*(g|kg|ml|l|oz|lb|cups?|tbsp|tsp|pieces?|slices?)?\s*/i, '');
  
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
