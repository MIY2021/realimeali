
interface ParsedIngredient {
  quantity?: number;
  unit?: string;
  name: string;
}

export class RecipeScalingService {
  private static parseIngredient(ingredient: string): ParsedIngredient {
    try {
      const trimmed = ingredient.trim();
      
      // Enhanced fraction matching including Unicode fractions
      const fractionMap: { [key: string]: number } = {
        '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.333, '⅔': 0.667,
        '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
        '1/2': 0.5, '1/4': 0.25, '3/4': 0.75, '1/3': 0.333, '2/3': 0.667,
        '1/8': 0.125, '3/8': 0.375, '5/8': 0.625, '7/8': 0.875
      };
      
      // Look for fractions first, then regular numbers
      let quantity: number | undefined;
      let quantityMatch = null;
      
      // Check for Unicode fractions at the start
      for (const [fraction, value] of Object.entries(fractionMap)) {
        if (trimmed.startsWith(fraction + ' ')) {
          quantity = value;
          quantityMatch = [fraction + ' ', fraction];
          break;
        }
      }
      
      // If no Unicode fraction found, look for regular patterns
      if (!quantityMatch) {
        quantityMatch = trimmed.match(/^(\d+(?:\.\d+)?(?:\s*[./]\s*\d+)?|\d+\/\d+)\s*/);
        if (quantityMatch) {
          const quantityStr = quantityMatch[1];
          if (quantityStr.includes('/')) {
            const parts = quantityStr.split('/');
            if (parts.length === 2) {
              quantity = parseFloat(parts[0]) / parseFloat(parts[1]);
            }
          } else {
            quantity = parseFloat(quantityStr);
          }
        }
      }
      
      // Extract unit (enhanced with more cooking units)
      const unitMatch = trimmed.match(/\b(cups?|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lbs?|pounds?|cloves?|pieces?|slices?|g|grams?|kg|kilograms?|ml|milliliters?|l|liters?|tins?|cans?|packets?|sachets?|bottles?|jars?)\b/i);
      const unit = unitMatch ? unitMatch[1] : undefined;
      
      // Extract ingredient name (everything after quantity and unit)
      let name = trimmed;
      if (quantityMatch) {
        name = name.replace(quantityMatch[0], '').trim();
      }
      if (unitMatch) {
        name = name.replace(unitMatch[0], '').trim();
      }
      
      // Clean up the name
      name = name.replace(/^(of\s+|,\s*)/g, '').trim();
      
      return {
        quantity,
        unit,
        name: name || ingredient
      };
    } catch (error) {
      console.error('Error parsing ingredient:', ingredient, error);
      return { name: ingredient };
    }
  }

  private static formatQuantity(quantity: number): string {
    // Handle common fractions for display with improved logic
    const commonFractions: { [key: string]: string } = {
      '0.125': '⅛', '0.25': '¼', '0.33': '⅓', '0.333': '⅓',
      '0.375': '⅜', '0.5': '½', '0.625': '⅝', '0.67': '⅔', '0.667': '⅔',
      '0.75': '¾', '0.875': '⅞',
      '1.125': '1⅛', '1.25': '1¼', '1.33': '1⅓', '1.333': '1⅓',
      '1.375': '1⅜', '1.5': '1½', '1.625': '1⅝', '1.67': '1⅔', '1.667': '1⅔',
      '1.75': '1¾', '1.875': '1⅞',
      '2.25': '2¼', '2.33': '2⅓', '2.333': '2⅓', '2.5': '2½',
      '2.67': '2⅔', '2.667': '2⅔', '2.75': '2¾',
      '3.25': '3¼', '3.33': '3⅓', '3.333': '3⅓', '3.5': '3½',
      '3.67': '3⅔', '3.667': '3⅔', '3.75': '3¾'
    };

    const rounded = Math.round(quantity * 1000) / 1000; // More precision for better fraction matching
    
    // Check for exact matches first
    const exactKey = rounded.toString();
    if (commonFractions[exactKey]) {
      return commonFractions[exactKey];
    }
    
    // Check for close matches (within 0.01)
    for (const [key, fraction] of Object.entries(commonFractions)) {
      if (Math.abs(parseFloat(key) - rounded) < 0.01) {
        return fraction;
      }
    }
    
    // For whole numbers, return as integer
    if (rounded % 1 === 0) {
      return rounded.toString();
    }
    
    // For other values, show up to 2 decimal places but remove trailing zeros
    return rounded.toFixed(2).replace(/\.?0+$/, '');
  }

  static scaleIngredients(ingredients: string[], originalServings: number, newServings: number): string[] {
    if (originalServings === newServings) {
      return ingredients;
    }

    const scaleFactor = newServings / originalServings;

    return ingredients.map(ingredient => {
      const parsed = this.parseIngredient(ingredient);
      
      if (parsed.quantity) {
        const scaledQuantity = parsed.quantity * scaleFactor;
        const formattedQuantity = this.formatQuantity(scaledQuantity);
        
        let scaledIngredient = formattedQuantity;
        if (parsed.unit) {
          scaledIngredient += ` ${parsed.unit}`;
        }
        scaledIngredient += ` ${parsed.name}`;
        
        return scaledIngredient;
      }
      
      return ingredient; // Return unchanged if no quantity found
    });
  }
}
