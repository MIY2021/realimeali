export interface ConsolidatedIngredient {
  name: string;
  consolidatedQuantity: number;
  consolidatedUnit: string;
  sourceIngredients: string[];
  recipeIds: string[];
}

export class IngredientConsolidationService {
  static consolidateIngredients(ingredients: Array<{
    name: string;
    recipeId: string;
    recipeTitle: string;
  }>): ConsolidatedIngredient[] {
    console.log('Starting local consolidation of', ingredients.length, 'ingredients');
    
    // Filter out invalid ingredients first
    const validIngredients = ingredients.filter(ing => {
      const trimmed = ing.name?.trim();
      return trimmed && trimmed.length > 0 && trimmed !== 'undefined' && trimmed !== 'null';
    });

    console.log('Valid ingredients after filtering:', validIngredients.length);

    if (validIngredients.length === 0) {
      return [];
    }

    const consolidationMap = new Map<string, ConsolidatedIngredient>();

    validIngredients.forEach(ingredient => {
      const parsed = this.parseIngredient(ingredient.name);
      
      // Skip if we couldn't parse a meaningful ingredient name
      if (!parsed.name || parsed.name.length < 2) {
        console.log('Skipping ingredient with invalid name:', ingredient.name);
        return;
      }

      const key = parsed.name.toLowerCase();
      
      if (consolidationMap.has(key)) {
        const existing = consolidationMap.get(key)!;
        
        // Add quantity if units match or if one has no unit
        if (parsed.unit === existing.consolidatedUnit || !parsed.unit || !existing.consolidatedUnit) {
          existing.consolidatedQuantity += parsed.quantity;
          // Use the unit from the ingredient that has one
          if (parsed.unit && !existing.consolidatedUnit) {
            existing.consolidatedUnit = parsed.unit;
          }
        } else {
          // Different units - try to convert or just add as separate quantity
          const converted = this.convertUnits(parsed.quantity, parsed.unit, existing.consolidatedUnit);
          if (converted !== null) {
            existing.consolidatedQuantity += converted;
          } else {
            // Can't convert, just increment count
            existing.consolidatedQuantity += parsed.quantity;
          }
        }
        
        existing.sourceIngredients.push(ingredient.name);
        if (!existing.recipeIds.includes(ingredient.recipeId)) {
          existing.recipeIds.push(ingredient.recipeId);
        }
      } else {
        consolidationMap.set(key, {
          name: parsed.name,
          consolidatedQuantity: parsed.quantity,
          consolidatedUnit: parsed.unit,
          sourceIngredients: [ingredient.name],
          recipeIds: [ingredient.recipeId]
        });
      }
    });

    const result = Array.from(consolidationMap.values());
    console.log('Consolidated into', result.length, 'unique ingredients');
    return result;
  }

  private static parseIngredient(ingredient: string): {
    quantity: number;
    unit: string;
    name: string;
  } {
    const trimmed = ingredient.trim();
    
    // Pattern to match quantity (including fractions), optional unit, and ingredient name
    const patterns = [
      // "2 1/2 cups flour", "1/2 cup olive oil", "3.5 tbsp sugar"
      /^(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)\s*(cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lb|lbs|pounds?|g|grams?|kg|kilograms?|ml|l|liters?|cloves?|pieces?|slices?|cans?|packages?|sticks?)\s+(.+)$/i,
      // "2 1/2 large onions", "1/2 garlic clove"
      /^(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)\s+(large|medium|small|whole)?\s*(.+)$/i,
      // "flour", "salt" (no quantity)
      /^(.+)$/
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        if (match.length === 4 && match[1]) {
          // Has quantity and unit
          return {
            quantity: this.parseFractionOrDecimal(match[1]) || 1,
            unit: this.standardizeUnit(match[2] || ''),
            name: this.cleanIngredientName(match[3] || match[1])
          };
        } else if (match.length === 4 && !match[2]) {
          // Has quantity but no clear unit (like "2 onions")
          return {
            quantity: this.parseFractionOrDecimal(match[1]) || 1,
            unit: '',
            name: this.cleanIngredientName(match[3] || match[1])
          };
        } else {
          // No quantity, just ingredient name
          return {
            quantity: 1,
            unit: '',
            name: this.cleanIngredientName(match[1] || trimmed)
          };
        }
      }
    }

    // Fallback
    return {
      quantity: 1,
      unit: '',
      name: this.cleanIngredientName(trimmed)
    };
  }

  private static parseFractionOrDecimal(quantityStr: string): number {
    const trimmed = quantityStr.trim();
    
    // Handle mixed numbers like "2 1/2"
    const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
      const whole = parseInt(mixedMatch[1], 10);
      const numerator = parseInt(mixedMatch[2], 10);
      const denominator = parseInt(mixedMatch[3], 10);
      return whole + (numerator / denominator);
    }
    
    // Handle simple fractions like "1/2"
    const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
      const numerator = parseInt(fractionMatch[1], 10);
      const denominator = parseInt(fractionMatch[2], 10);
      return numerator / denominator;
    }
    
    // Handle decimals like "2.5"
    const decimal = parseFloat(trimmed);
    if (!isNaN(decimal)) {
      return decimal;
    }
    
    // Fallback
    return 1;
  }

  private static standardizeUnit(unit: string): string {
    const unitMap: { [key: string]: string } = {
      'cup': 'cup',
      'cups': 'cups',
      'tbsp': 'tbsp',
      'tablespoon': 'tbsp',
      'tablespoons': 'tbsp',
      'tsp': 'tsp',
      'teaspoon': 'tsp',
      'teaspoons': 'tsp',
      'oz': 'oz',
      'ounce': 'oz',
      'ounces': 'oz',
      'lb': 'lb',
      'lbs': 'lb',
      'pound': 'lb',
      'pounds': 'lb',
      'g': 'g',
      'gram': 'g',
      'grams': 'g',
      'kg': 'kg',
      'kilogram': 'kg',
      'kilograms': 'kg',
      'ml': 'ml',
      'l': 'l',
      'liter': 'l',
      'liters': 'l',
      'clove': 'cloves',
      'cloves': 'cloves',
      'piece': 'pieces',
      'pieces': 'pieces',
      'slice': 'slices',
      'slices': 'slices',
      'can': 'can',
      'cans': 'cans',
      'package': 'package',
      'packages': 'packages',
      'stick': 'stick',
      'sticks': 'sticks'
    };

    return unitMap[unit.toLowerCase()] || unit.toLowerCase();
  }

  private static cleanIngredientName(name: string): string {
    return name
      .trim()
      .replace(/^(a|an|some|the)\s+/i, '') // Remove articles
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/^[,\-\s]+|[,\-\s]+$/g, '') // Remove leading/trailing punctuation
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private static convertUnits(quantity: number, fromUnit: string, toUnit: string): number | null {
    // Simple unit conversions
    const conversions: { [key: string]: { [key: string]: number } } = {
      'tsp': { 'tbsp': 1/3, 'cup': 1/48 },
      'tbsp': { 'tsp': 3, 'cup': 1/16 },
      'cup': { 'tbsp': 16, 'tsp': 48 },
      'oz': { 'lb': 1/16, 'g': 28.35 },
      'lb': { 'oz': 16, 'g': 453.592 },
      'g': { 'oz': 1/28.35, 'lb': 1/453.592, 'kg': 1/1000 },
      'kg': { 'g': 1000, 'lb': 2.20462 },
      'ml': { 'l': 1/1000 },
      'l': { 'ml': 1000 }
    };

    if (conversions[fromUnit]?.[toUnit]) {
      return quantity * conversions[fromUnit][toUnit];
    }

    return null; // Can't convert
  }
}
