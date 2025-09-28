
import { IngredientSectionParser } from './ingredientSectionParser';

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
        '⅑': 0.111, '⅒': 0.1, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8, '⅙': 0.167, '⅚': 0.833,
        '1/2': 0.5, '1/4': 0.25, '3/4': 0.75, '1/3': 0.333, '2/3': 0.667,
        '1/8': 0.125, '3/8': 0.375, '5/8': 0.625, '7/8': 0.875,
        '1/5': 0.2, '2/5': 0.4, '3/5': 0.6, '4/5': 0.8
      };
      
      // Look for fractions first, then regular numbers
      let quantity: number | undefined;
      let quantityMatch = null;
      let originalQuantityStr = '';
      
      // Pattern 1: Check for mixed fractions like "1⅗" anywhere in the string
      const mixedFractionMatch = trimmed.match(/(\d+)([⅐-⅞])/);
      if (mixedFractionMatch) {
        const wholeNumber = parseInt(mixedFractionMatch[1]);
        const fraction = mixedFractionMatch[2];
        if (fractionMap[fraction]) {
          quantity = wholeNumber + fractionMap[fraction];
          quantityMatch = mixedFractionMatch;
          originalQuantityStr = mixedFractionMatch[0];
        }
      }
      
      // Pattern 2: Check for quantities in parentheses like "(about 1.2 pinches)" or "(1.6)"
      if (!quantityMatch) {
        const parenMatch = trimmed.match(/\((?:about\s+)?(\d+(?:\.\d+)?(?:[⅐-⅞])?|\d+\/\d+|[⅐-⅞])\s*([a-z]+)?\)/i);
        if (parenMatch) {
          const quantityStr = parenMatch[1];
          if (fractionMap[quantityStr]) {
            quantity = fractionMap[quantityStr];
          } else if (quantityStr.includes('/')) {
            const parts = quantityStr.split('/');
            if (parts.length === 2) {
              quantity = parseFloat(parts[0]) / parseFloat(parts[1]);
            }
          } else {
            quantity = parseFloat(quantityStr);
          }
          quantityMatch = parenMatch;
          originalQuantityStr = parenMatch[0];
        }
      }
      
      // Pattern 3: Check for "to make X" patterns like "to make 1⅗ tbsp"
      if (!quantityMatch) {
        const toMakeMatch = trimmed.match(/to\s+make\s+(\d+(?:[⅐-⅞])?|\d+\/\d+|[⅐-⅞]|\d+(?:\.\d+)?)\s*([a-z]+)?/i);
        if (toMakeMatch) {
          const quantityStr = toMakeMatch[1];
          if (fractionMap[quantityStr]) {
            quantity = fractionMap[quantityStr];
          } else if (quantityStr.includes('/')) {
            const parts = quantityStr.split('/');
            if (parts.length === 2) {
              quantity = parseFloat(parts[0]) / parseFloat(parts[1]);
            }
          } else {
            quantity = parseFloat(quantityStr);
          }
          quantityMatch = toMakeMatch;
          originalQuantityStr = toMakeMatch[0];
        }
      }
      
      // Pattern 4: Check for Unicode fractions at the start
      if (!quantityMatch) {
        for (const [fraction, value] of Object.entries(fractionMap)) {
          if (trimmed.startsWith(fraction + ' ')) {
            quantity = value;
            quantityMatch = [fraction + ' ', fraction];
            originalQuantityStr = fraction;
            break;
          }
        }
      }
      
      // Pattern 5: Regular patterns at the start
      if (!quantityMatch) {
        quantityMatch = trimmed.match(/^(\d+(?:\.\d+)?(?:\s*[./]\s*\d+)?|\d+\/\d+)\s*/);
        if (quantityMatch) {
          const quantityStr = quantityMatch[1];
          originalQuantityStr = quantityStr;
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
      
      // Pattern 6: Check for quantities after dashes like "Prawns – 120g" or "Butter - 50ml"
      if (!quantityMatch) {
        const dashMatch = trimmed.match(/^(.+?)\s*[-–—]\s*(\d+(?:\.\d+)?(?:[⅐-⅞])?|\d+\/\d+|[⅐-⅞])\s*([a-z]+)?/i);
        if (dashMatch) {
          const quantityStr = dashMatch[2];
          originalQuantityStr = quantityStr;
          if (fractionMap[quantityStr]) {
            quantity = fractionMap[quantityStr];
          } else if (quantityStr.includes('/')) {
            const parts = quantityStr.split('/');
            if (parts.length === 2) {
              quantity = parseFloat(parts[0]) / parseFloat(parts[1]);
            }
          } else {
            quantity = parseFloat(quantityStr);
          }
          quantityMatch = dashMatch;
        }
      }
      
      // Extract unit (enhanced with more cooking units including pinches)
      const unitMatch = trimmed.match(/\b(cups?|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lbs?|pounds?|cloves?|pieces?|slices?|g|grams?|kg|kilograms?|ml|milliliters?|l|liters?|tins?|cans?|packets?|sachets?|bottles?|jars?|pinches?)\b/i);
      const unit = unitMatch ? unitMatch[1] : undefined;
      
      // Extract ingredient name (everything after quantity and unit)
      let name = trimmed;
      
      // Special handling for dash patterns
      if (quantityMatch && quantityMatch.length > 3 && quantityMatch[1]) {
        // This is a dash pattern like "Prawns – 120g"
        name = quantityMatch[1].trim();
      } else {
        // Standard patterns - remove quantity and unit from string
        if (quantityMatch) {
          name = name.replace(quantityMatch[0], '').trim();
        }
        if (unitMatch) {
          name = name.replace(unitMatch[0], '').trim();
        }
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
      '0.111': '⅑', '0.1': '⅒', '0.125': '⅛', '0.167': '⅙', '0.2': '⅕',
      '0.25': '¼', '0.33': '⅓', '0.333': '⅓', '0.375': '⅜', '0.4': '⅖',
      '0.5': '½', '0.6': '⅗', '0.625': '⅝', '0.67': '⅔', '0.667': '⅔',
      '0.75': '¾', '0.8': '⅘', '0.833': '⅚', '0.875': '⅞',
      '1.111': '1⅑', '1.1': '1⅒', '1.125': '1⅛', '1.167': '1⅙', '1.2': '1⅕',
      '1.25': '1¼', '1.33': '1⅓', '1.333': '1⅓', '1.375': '1⅜', '1.4': '1⅖',
      '1.5': '1½', '1.6': '1⅗', '1.625': '1⅝', '1.67': '1⅔', '1.667': '1⅔',
      '1.75': '1¾', '1.8': '1⅘', '1.833': '1⅚', '1.875': '1⅞',
      '2.25': '2¼', '2.33': '2⅓', '2.333': '2⅓', '2.5': '2½',
      '2.6': '2⅗', '2.67': '2⅔', '2.667': '2⅔', '2.75': '2¾',
      '3.25': '3¼', '3.33': '3⅓', '3.333': '3⅓', '3.5': '3½',
      '3.6': '3⅗', '3.67': '3⅔', '3.667': '3⅔', '3.75': '3¾'
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
    
    // Parse ingredients into sections
    const sections = IngredientSectionParser.parseIngredients(ingredients);
    
    // Scale each section
    const scaledSections = sections.map(section => ({
      ...section,
      ingredients: section.ingredients.map(ingredient => {
        const parsed = this.parseIngredient(ingredient);
        
        if (parsed.quantity) {
          const scaledQuantity = parsed.quantity * scaleFactor;
          const formattedQuantity = this.formatQuantity(scaledQuantity);
          
          // Check if this was originally a dash pattern by looking at the original ingredient
          const isDashPattern = ingredient.match(/^(.+?)\s*[-–—]\s*(\d+(?:\.\d+)?(?:[⅐-⅞])?|\d+\/\d+|[⅐-⅞])\s*([a-z]+)?/i);
          
          let scaledIngredient;
          if (isDashPattern) {
            // Reconstruct as "Name – quantity unit"
            scaledIngredient = parsed.name;
            if (parsed.unit) {
              scaledIngredient += ` – ${formattedQuantity} ${parsed.unit}`;
            } else {
              scaledIngredient += ` – ${formattedQuantity}`;
            }
          } else {
            // Standard format: "quantity unit name"
            scaledIngredient = formattedQuantity;
            if (parsed.unit) {
              scaledIngredient += ` ${parsed.unit}`;
            }
            scaledIngredient += ` ${parsed.name}`;
          }
          
          return scaledIngredient;
        }
        
        return ingredient; // Return unchanged if no quantity found
      })
    }));

    // Flatten back to string array
    return IngredientSectionParser.flattenSectionedIngredients(scaledSections);
  }
}
