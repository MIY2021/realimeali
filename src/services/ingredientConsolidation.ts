import { parse } from 'ingredient-parser-nlp';

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
      const parsed = parse(ingredient);
      return {
        quantity: parsed?.quantity || undefined,
        unit: parsed?.unit || undefined,
        name: parsed?.ingredient || ingredient
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
