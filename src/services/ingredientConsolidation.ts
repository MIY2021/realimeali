
interface ParsedIngredient {
  quantity?: number;
  unit?: string;
  name: string;
}

interface ConsolidatedIngredient {
  name: string;
  consolidatedQuantity?: number;
  consolidatedUnit?: string;
  sourceIngredients: string[];
  recipeIds: string[];
}

export class IngredientConsolidationService {
  private static parseIngredient(ingredient: string): ParsedIngredient {
    try {
      const trimmed = ingredient.trim().toLowerCase();
      
      // Enhanced fraction mapping including Unicode fractions
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

  private static generateConsolidationKey(name: string, unit?: string): string {
    return `${name.toLowerCase()}-${(unit || '').toLowerCase()}`;
  }

  static consolidateIngredients(ingredients: Array<{ name: string; recipeId: string; recipeTitle: string }>): ConsolidatedIngredient[] {
    const consolidationMap = new Map<string, ConsolidatedIngredient>();

    ingredients.forEach(ingredient => {
      try {
        const parsed = this.parseIngredient(ingredient.name);
        if (!parsed.name) return;

        const key = this.generateConsolidationKey(parsed.name, parsed.unit);

        if (consolidationMap.has(key)) {
          const existing = consolidationMap.get(key)!;
          existing.consolidatedQuantity = (existing.consolidatedQuantity || 0) + (parsed.quantity || 1);
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
      } catch (error) {
        console.error('Error processing ingredient:', ingredient.name, error);
      }
    });

    return Array.from(consolidationMap.values()).filter(item =>
      item.name && item.name.trim().length > 0
    );
  }

  static consolidateIngredientsWithServings(ingredients: Array<{
    name: string;
    recipeId: string;
    recipeTitle: string;
    servingMultiplier: number;
  }>): ConsolidatedIngredient[] {
    console.log('🔄 Starting enhanced ingredient consolidation with servings for', ingredients.length, 'ingredients');
    
    const consolidationMap = new Map<string, ConsolidatedIngredient>();
    
    ingredients.forEach(ingredient => {
      try {
        const parsed = this.parseIngredient(ingredient.name);
        if (!parsed.name) return;
        
        // Apply serving multiplier to the quantity with enhanced precision
        const adjustedQuantity = parsed.quantity ? 
          Math.round((parsed.quantity * ingredient.servingMultiplier) * 1000) / 1000 : 
          ingredient.servingMultiplier;
        
        const key = this.generateConsolidationKey(parsed.name, parsed.unit);
        
        if (consolidationMap.has(key)) {
          const existing = consolidationMap.get(key)!;
          const newTotal = (existing.consolidatedQuantity || 0) + adjustedQuantity;
          existing.consolidatedQuantity = Math.round(newTotal * 1000) / 1000;
          existing.sourceIngredients.push(ingredient.name);
          if (!existing.recipeIds.includes(ingredient.recipeId)) {
            existing.recipeIds.push(ingredient.recipeId);
          }
        } else {
          consolidationMap.set(key, {
            name: parsed.name,
            consolidatedQuantity: adjustedQuantity,
            consolidatedUnit: parsed.unit,
            sourceIngredients: [ingredient.name],
            recipeIds: [ingredient.recipeId]
          });
        }
      } catch (error) {
        console.error('Error processing ingredient with servings:', ingredient.name, error);
      }
    });
    
    const result = Array.from(consolidationMap.values()).filter(item => 
      item.name && item.name.trim().length > 0
    );
    
    console.log('✅ Enhanced consolidation: converted', ingredients.length, 'ingredients into', result.length, 'items with proper fraction handling');
    return result;
  }
}
