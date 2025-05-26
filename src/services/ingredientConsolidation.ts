
interface ParsedIngredient {
  quantity: number;
  unit: string;
  baseName: string;
  originalText: string;
  recipeId: string;
  recipeTitle: string;
}

interface ConsolidatedIngredient {
  name: string;
  consolidatedQuantity: number;
  consolidatedUnit: string;
  sourceIngredients: string[];
  recipeIds: string[];
  recipeNames: string[];
}

export class IngredientConsolidationService {
  private static readonly UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
    // Volume conversions (to ml)
    volume: {
      'ml': 1,
      'milliliter': 1,
      'milliliters': 1,
      'l': 1000,
      'liter': 1000,
      'liters': 1000,
      'cup': 240,
      'cups': 240,
      'tbsp': 15,
      'tablespoon': 15,
      'tablespoons': 15,
      'tsp': 5,
      'teaspoon': 5,
      'teaspoons': 5,
      'fl oz': 30,
      'fluid ounce': 30,
      'fluid ounces': 30
    },
    // Weight conversions (to grams)
    weight: {
      'g': 1,
      'gram': 1,
      'grams': 1,
      'kg': 1000,
      'kilogram': 1000,
      'kilograms': 1000,
      'oz': 28.35,
      'ounce': 28.35,
      'ounces': 28.35,
      'lb': 453.6,
      'pound': 453.6,
      'pounds': 453.6
    }
  };

  private static readonly INGREDIENT_ALIASES: Record<string, string> = {
    'garlic cloves': 'garlic',
    'cloves garlic': 'garlic',
    'cloves of garlic': 'garlic',
    'garlic clove': 'garlic',
    'minced garlic': 'garlic',
    'chopped garlic': 'garlic',
    'crushed garlic': 'garlic',
    'fresh garlic': 'garlic',
    
    'onions': 'onion',
    'yellow onion': 'onion',
    'white onion': 'onion',
    'brown onion': 'onion',
    'red onion': 'onion',
    'chopped onion': 'onion',
    'diced onion': 'onion',
    'sliced onion': 'onion',
    
    'tomatoes': 'tomato',
    'fresh tomatoes': 'tomato',
    'ripe tomatoes': 'tomato',
    'cherry tomatoes': 'cherry tomato',
    'diced tomatoes': 'diced tomato',
    'crushed tomatoes': 'crushed tomato',
    'tomato paste': 'tomato paste',
    'tomato sauce': 'tomato sauce',
    'canned tomatoes': 'canned tomato',
    
    'olive oil': 'olive oil',
    'extra virgin olive oil': 'olive oil',
    'vegetable oil': 'vegetable oil',
    'cooking oil': 'vegetable oil',
    'canola oil': 'canola oil',
    'peanut oil': 'peanut oil',
    
    'black pepper': 'pepper',
    'ground black pepper': 'pepper',
    'freshly ground black pepper': 'pepper',
    'white pepper': 'white pepper',
    'ground pepper': 'pepper',
    
    'sea salt': 'salt',
    'kosher salt': 'salt',
    'table salt': 'salt',
    'coarse salt': 'salt',
    'fine salt': 'salt',
    
    'fresh ginger': 'ginger',
    'ground ginger': 'ground ginger',
    'ginger root': 'ginger',
    'fresh ginger root': 'ginger',
    'minced ginger': 'ginger',
    'grated ginger': 'ginger'
  };

  static parseIngredient(ingredientText: string, recipeId: string, recipeTitle: string): ParsedIngredient {
    // Remove week prefixes and clean up
    let cleanText = ingredientText.replace(/^week\d+-/, '').trim();
    
    // Extract quantity and unit using regex
    const quantityMatch = cleanText.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*([a-zA-Z]*)\s*(.*)/);
    
    let quantity = 1;
    let unit = '';
    let ingredientName = cleanText;

    if (quantityMatch) {
      quantity = this.parseQuantity(quantityMatch[1]);
      unit = quantityMatch[2]?.toLowerCase() || '';
      ingredientName = quantityMatch[3] || '';
    } else {
      // Try to match fractional quantities like "1/2", "1/4"
      const fractionMatch = cleanText.match(/^(½|¼|¾|⅓|⅔|⅛|⅜|⅝|⅞|\d+\/\d+)\s*([a-zA-Z]*)\s*(.*)/);
      if (fractionMatch) {
        quantity = this.parseFraction(fractionMatch[1]);
        unit = fractionMatch[2]?.toLowerCase() || '';
        ingredientName = fractionMatch[3] || '';
      }
    }

    // Clean up ingredient name
    ingredientName = ingredientName
      .replace(/[,\-]\s*(chopped|diced|sliced|minced|grated|crushed|fresh|to taste|optional).*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Get base name using aliases
    const baseName = this.getBaseName(ingredientName);

    return {
      quantity,
      unit: this.normalizeUnit(unit),
      baseName,
      originalText: ingredientText,
      recipeId,
      recipeTitle
    };
  }

  private static parseQuantity(quantityStr: string): number {
    if (quantityStr.includes('/')) {
      const [numerator, denominator] = quantityStr.split('/').map(Number);
      return numerator / denominator;
    }
    return parseFloat(quantityStr) || 1;
  }

  private static parseFraction(fractionStr: string): number {
    const fractionMap: Record<string, number> = {
      '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.33, '⅔': 0.67,
      '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875
    };
    
    if (fractionMap[fractionStr]) {
      return fractionMap[fractionStr];
    }
    
    if (fractionStr.includes('/')) {
      const [numerator, denominator] = fractionStr.split('/').map(Number);
      return numerator / denominator;
    }
    
    return 1;
  }

  private static normalizeUnit(unit: string): string {
    const unitMap: Record<string, string> = {
      'tablespoon': 'tbsp',
      'tablespoons': 'tbsp',
      'teaspoon': 'tsp',
      'teaspoons': 'tsp',
      'ounce': 'oz',
      'ounces': 'oz',
      'pound': 'lb',
      'pounds': 'lb',
      'gram': 'g',
      'grams': 'g',
      'kilogram': 'kg',
      'kilograms': 'kg',
      'milliliter': 'ml',
      'milliliters': 'ml',
      'liter': 'l',
      'liters': 'l',
      'piece': 'pieces',
      'clove': 'cloves'
    };
    
    return unitMap[unit.toLowerCase()] || unit.toLowerCase();
  }

  private static getBaseName(ingredientName: string): string {
    const lowerName = ingredientName.toLowerCase().trim();
    
    // Check direct aliases first
    if (this.INGREDIENT_ALIASES[lowerName]) {
      return this.INGREDIENT_ALIASES[lowerName];
    }
    
    // Check if any alias is contained in the ingredient name
    for (const [alias, baseName] of Object.entries(this.INGREDIENT_ALIASES)) {
      if (lowerName.includes(alias)) {
        return baseName;
      }
    }
    
    // Extract the main ingredient (usually the first 1-2 words)
    const words = lowerName.split(' ');
    if (words.length === 1) {
      return words[0];
    }
    
    // For compound ingredients, try to get the main part
    if (words.length >= 2) {
      // Common patterns like "chicken breast", "beef stock", etc.
      const commonCompounds = ['chicken', 'beef', 'pork', 'fish', 'turkey', 'lamb'];
      if (commonCompounds.includes(words[0])) {
        return `${words[0]} ${words[1]}`;
      }
      
      // For most other cases, use the last significant word
      const significantWords = words.filter(w => 
        !['fresh', 'dried', 'ground', 'chopped', 'diced', 'sliced', 'minced', 'grated', 'crushed'].includes(w)
      );
      
      return significantWords.slice(-1)[0] || words[0];
    }
    
    return lowerName;
  }

  private static canCombineUnits(unit1: string, unit2: string): boolean {
    // Check if both units are in the same conversion category
    for (const category of Object.values(this.UNIT_CONVERSIONS)) {
      if (category[unit1] && category[unit2]) {
        return true;
      }
    }
    return unit1 === unit2 || (!unit1 && !unit2);
  }

  private static convertAndCombine(
    quantity1: number, unit1: string,
    quantity2: number, unit2: string
  ): { quantity: number; unit: string } {
    // If units are the same, just add quantities
    if (unit1 === unit2) {
      return { quantity: quantity1 + quantity2, unit: unit1 };
    }

    // Try to convert within the same category
    for (const [categoryName, conversions] of Object.entries(this.UNIT_CONVERSIONS)) {
      if (conversions[unit1] && conversions[unit2]) {
        // Convert both to base unit, add, then convert to more appropriate unit
        const base1 = quantity1 * conversions[unit1];
        const base2 = quantity2 * conversions[unit2];
        const totalBase = base1 + base2;

        // Choose the more appropriate unit (prefer the larger unit for larger quantities)
        const betterUnit = totalBase > conversions[unit1] * 2 ? unit1 : unit2;
        const finalQuantity = totalBase / conversions[betterUnit];

        return { quantity: Math.round(finalQuantity * 100) / 100, unit: betterUnit };
      }
    }

    // If we can't convert, use the first unit and add quantities
    return { quantity: quantity1 + quantity2, unit: unit1 || unit2 };
  }

  static consolidateIngredients(ingredients: Array<{
    name: string;
    recipeId: string;
    recipeTitle: string;
  }>): ConsolidatedIngredient[] {
    console.log('Starting fast local consolidation for', ingredients.length, 'ingredients');
    
    // Parse all ingredients
    const parsedIngredients = ingredients.map(ing => 
      this.parseIngredient(ing.name, ing.recipeId, ing.recipeTitle)
    );

    console.log('Parsed ingredients:', parsedIngredients.slice(0, 5));

    // Group by base ingredient name
    const groups = new Map<string, ParsedIngredient[]>();
    
    for (const ingredient of parsedIngredients) {
      const key = ingredient.baseName;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(ingredient);
    }

    console.log('Grouped into', groups.size, 'ingredient types');

    // Consolidate each group
    const consolidated: ConsolidatedIngredient[] = [];

    for (const [baseName, ingredientGroup] of groups) {
      // Separate by compatible units
      const unitGroups = new Map<string, ParsedIngredient[]>();
      
      for (const ingredient of ingredientGroup) {
        let assigned = false;
        
        // Try to find a compatible unit group
        for (const [existingUnit, existingGroup] of unitGroups) {
          if (this.canCombineUnits(ingredient.unit, existingUnit)) {
            existingGroup.push(ingredient);
            assigned = true;
            break;
          }
        }
        
        if (!assigned) {
          unitGroups.set(ingredient.unit, [ingredient]);
        }
      }

      // Create consolidated entries for each unit group
      for (const unitGroup of unitGroups.values()) {
        if (unitGroup.length === 0) continue;

        // Combine quantities
        let totalQuantity = 0;
        let finalUnit = unitGroup[0].unit;
        
        for (const ingredient of unitGroup) {
          if (unitGroup.length === 1) {
            totalQuantity = ingredient.quantity;
            finalUnit = ingredient.unit;
          } else {
            const combined = this.convertAndCombine(
              totalQuantity, finalUnit,
              ingredient.quantity, ingredient.unit
            );
            totalQuantity = combined.quantity;
            finalUnit = combined.unit;
          }
        }

        // Collect recipe information
        const recipeIds = [...new Set(unitGroup.map(ing => ing.recipeId))];
        const recipeNames = [...new Set(unitGroup.map(ing => ing.recipeTitle))];
        const sourceIngredients = unitGroup.map(ing => ing.originalText);

        consolidated.push({
          name: baseName,
          consolidatedQuantity: Math.round(totalQuantity * 100) / 100,
          consolidatedUnit: finalUnit,
          sourceIngredients,
          recipeIds,
          recipeNames
        });
      }
    }

    console.log('Consolidated to', consolidated.length, 'items');
    return consolidated.sort((a, b) => a.name.localeCompare(b.name));
  }
}
