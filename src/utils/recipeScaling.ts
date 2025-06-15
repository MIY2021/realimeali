
interface ParsedIngredient {
  quantity?: number;
  unit?: string;
  name: string;
}

export class RecipeScalingService {
  private static parseIngredient(ingredient: string): ParsedIngredient {
    try {
      const trimmed = ingredient.trim();
      
      // Extract quantity (look for numbers at the beginning, including fractions)
      const quantityMatch = trimmed.match(/^(\d+(?:\.\d+)?(?:\/\d+)?|\d+\/\d+)\s*/);
      let quantity: number | undefined;
      
      if (quantityMatch) {
        const quantityStr = quantityMatch[1];
        if (quantityStr.includes('/')) {
          // Handle fractions like "1/2" or "1 1/2"
          const parts = quantityStr.split('/');
          if (parts.length === 2) {
            quantity = parseFloat(parts[0]) / parseFloat(parts[1]);
          }
        } else {
          quantity = parseFloat(quantityStr);
        }
      }
      
      // Extract unit (common cooking units)
      const unitMatch = trimmed.match(/\b(cups?|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lbs?|pounds?|cloves?|pieces?|slices?|g|grams?|kg|kilograms?|ml|milliliters?|l|liters?)\b/i);
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
    // Handle common fractions for display
    const commonFractions: { [key: string]: string } = {
      '0.25': '1/4',
      '0.33': '1/3',
      '0.5': '1/2',
      '0.67': '2/3',
      '0.75': '3/4',
      '1.25': '1 1/4',
      '1.33': '1 1/3',
      '1.5': '1 1/2',
      '1.67': '1 2/3',
      '1.75': '1 3/4',
      '2.25': '2 1/4',
      '2.33': '2 1/3',
      '2.5': '2 1/2',
      '2.67': '2 2/3',
      '2.75': '2 3/4'
    };

    const rounded = Math.round(quantity * 100) / 100;
    const fractionKey = rounded.toString();
    
    if (commonFractions[fractionKey]) {
      return commonFractions[fractionKey];
    }
    
    // For other values, show up to 2 decimal places but remove trailing zeros
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2).replace(/\.?0+$/, '');
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
