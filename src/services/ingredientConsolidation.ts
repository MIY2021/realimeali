
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
      // Basic ingredient parsing logic
      const trimmed = ingredient.trim().toLowerCase();
      
      // Extract quantity (look for numbers at the beginning)
      const quantityMatch = trimmed.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*/);
      const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : undefined;
      
      // Extract unit (common cooking units)
      const unitMatch = trimmed.match(/\b(cups?|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lbs?|pounds?|cloves?|pieces?|slices?)\b/);
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
    console.log('🔄 Starting ingredient consolidation with servings for', ingredients.length, 'ingredients');
    
    const consolidationMap = new Map<string, ConsolidatedIngredient>();
    
    ingredients.forEach(ingredient => {
      try {
        const parsed = this.parseIngredient(ingredient.name);
        if (!parsed.name) return;
        
        // Apply serving multiplier to the quantity
        const adjustedQuantity = parsed.quantity ? parsed.quantity * ingredient.servingMultiplier : ingredient.servingMultiplier;
        
        const key = this.generateConsolidationKey(parsed.name, parsed.unit);
        
        if (consolidationMap.has(key)) {
          const existing = consolidationMap.get(key)!;
          existing.consolidatedQuantity = (existing.consolidatedQuantity || 0) + adjustedQuantity;
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
    
    console.log('✅ Consolidated', ingredients.length, 'ingredients into', result.length, 'items with serving adjustments');
    return result;
  }
}
