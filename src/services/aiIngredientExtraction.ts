
export class AIIngredientExtractionService {
  static async extractIngredientName(fullText: string): Promise<string> {
    try {
      const response = await fetch('/api/extract-ingredient-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ingredientText: fullText 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract ingredient name');
      }

      const data = await response.json();
      return data.extractedName || fullText;
    } catch (error) {
      console.error('AI extraction failed, falling back to regex:', error);
      // Fallback to existing regex-based extraction
      return this.fallbackExtraction(fullText);
    }
  }

  private static fallbackExtraction(fullText: string): string {
    // Use the existing regex-based logic as fallback
    let cleanText = fullText.replace(/^week\d+-/, '');
    
    cleanText = cleanText.replace(/^[\d½¼¾⅓⅔⅛⅜⅝⅞]+(\s*[./]\s*[\d½¼¾⅓⅔⅛⅜⅝⅞]+)?(\s+[\d½¼¾⅓⅔⅛⅜⅝⅞]+(\s*[./]\s*[\d½¼¾⅓⅔⅛⅜⅝⅞]+)?)?\s*/g, '');
    cleanText = cleanText.replace(/^\d+\s*(g|kg|ml|l|oz|lb|cups?|cup|tbsp|tsp|teaspoons?|tablespoons?|pieces?|slices?|cloves?|pounds?|ounces?|grams?|liters?|milliliters?|pints?|quarts?|gallons?)\s+/gi, '');
    cleanText = cleanText.replace(/^(g|kg|ml|l|oz|lb|cups?|cup|tbsp|tsp|teaspoons?|tablespoons?|pieces?|slices?|cloves?|pounds?|ounces?|grams?|liters?|milliliters?|pints?|quarts?|gallons?)\s+/gi, '');
    cleanText = cleanText.replace(/^[\d½¼¾⅓⅔⅛⅜⅝⅞]+\s*/g, '');
    cleanText = cleanText.replace(/^(a |an |some |few |bunch of |handful of |pinch of )/i, '');
    cleanText = cleanText.replace(/\s*\([^)]*\)/g, '');
    cleanText = cleanText.replace(/,\s*(toasted|chopped|diced|minced|sliced|grated|fresh|dried|ground|whole|crushed|powder|paste|sauce|oil|extract|juice|zest|peeled|canned|frozen|cooked|raw|organic|unsalted|salted|extra virgin|virgin|light|dark|heavy|thick|thin|fine|coarse|large|small|medium|pitted|halved|rinsed|drained|and.*$).*$/gi, '');
    cleanText = cleanText.replace(/\s+(toasted|chopped|diced|minced|sliced|grated|fresh|dried|ground|whole|crushed|powder|paste|sauce|oil|extract|juice|zest|peeled|canned|frozen|cooked|raw|organic|unsalted|salted|extra virgin|virgin|light|dark|heavy|thick|thin|fine|coarse|large|small|medium|pitted|halved|rinsed|drained).*$/gi, '');
    cleanText = cleanText.trim();
    cleanText = cleanText.replace(/^(cooked|dried|fresh|canned|frozen|raw|organic)\s+/i, '');
    
    return cleanText
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }
}
