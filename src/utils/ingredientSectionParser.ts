
interface IngredientSection {
  header?: string;
  ingredients: string[];
}

export class IngredientSectionParser {
  private static sectionPatterns = [
    // Exact colon patterns - more flexible
    /^(.+):$/i,
    
    // Common recipe section patterns - enhanced
    /^(for the .+):?$/i,
    /^(for making .+):?$/i,
    /^(marinade):?$/i,
    /^(sauce):?$/i,
    /^(dressing):?$/i,
    /^(garnish):?$/i,
    /^(topping):?$/i,
    /^(filling):?$/i,
    /^(base):?$/i,
    /^(assembly):?$/i,
    /^(to serve):?$/i,
    /^(optional):?$/i,
    /^(gravy):?$/i,
    /^(meat):?$/i,
    /^(vegetables?):?$/i,
    /^(spices?):?$/i,
    /^(seasoning):?$/i,
    /^(paste):?$/i,
    /^(mix):?$/i,
    /^(mixture):?$/i,
    
    // Pattern-based headers - more comprehensive
    /^(.+ ingredients?):?$/i,
    /^(.+ sauce):?$/i,
    /^(.+ marinade):?$/i,
    /^(.+ dressing):?$/i,
    /^(.+ mixture):?$/i,
    /^(.+ topping):?$/i,
    /^(.+ filling):?$/i,
    /^(.+ garnish):?$/i,
    /^(.+ base):?$/i,
    /^(.+ paste):?$/i,
    /^(preparation|prep):?$/i,
    /^(method):?$/i,
    /^(components?):?$/i,
  ];

  static parseIngredients(ingredients: string[]): IngredientSection[] {
    // Reduce excessive logging for production use
    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 IngredientSectionParser.parseIngredients called with:", ingredients.length, "ingredients");
    }
    
    if (!ingredients || ingredients.length === 0) {
      return [{ ingredients: [] }];
    }

    const sections: IngredientSection[] = [];
    let currentSection: IngredientSection = { ingredients: [] };

    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];
      const trimmed = ingredient.trim();
      
      if (!trimmed) continue;
      
      // Check if this ingredient is actually a section header
      const isHeader = this.isLikelyHeader(trimmed);
      
      if (isHeader) {
        // Save current section if it has ingredients
        if (currentSection.ingredients.length > 0) {
          sections.push(currentSection);
        }
        
        // Start new section
        const cleanHeader = trimmed.replace(/(:|\.)$/, ''); // Remove trailing colon or period
        currentSection = {
          header: cleanHeader,
          ingredients: []
        };
      } else {
        // Add to current section
        currentSection.ingredients.push(ingredient);
      }
    }

    // Add the final section
    if (currentSection.ingredients.length > 0 || currentSection.header) {
      sections.push(currentSection);
    }

    // If no sections were found, return all ingredients as one section
    if (sections.length === 0) {
      return [{ ingredients }];
    }

    return sections;
  }

  private static isLikelyHeader(text: string): boolean {
    const lowerText = text.toLowerCase().trim();
    
    // PRIORITY: If it clearly looks like an ingredient with quantity, it's NOT a header
    if (this.looksLikeIngredient(text)) {
      console.log(`🔍 "${text}" clearly looks like an ingredient, not a header`);
      return false;
    }
    
    // Enhanced colon detection - but only for non-ingredients
    if (text.endsWith(':')) {
      console.log(`🔍 "${text}" ends with colon, checking if it's valid header...`);
      
      // If it has clear measurements, it's definitely an ingredient
      const hasNumberAndUnit = /\d+\s*(cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|oz|ounce|ounces|lb|pound|pounds|kg|kilogram|kilograms|g|gram|grams|ml|milliliter|milliliters|l|liter|liters|inch|inches|clove|cloves|piece|pieces|slice|slices|can|cans|jar|jars|bottle|bottles|packet|packets)/i.test(text);
      
      if (hasNumberAndUnit) {
        console.log(`🔍 "${text}" has measurements, treating as ingredient`);
        return false;
      }
      
      // If it's reasonably short and ends with colon, likely a header
      if (text.length < 60) {
        console.log(`🔍 "${text}" is short and ends with colon, treating as header`);
        return true;
      }
    }

    // Exact pattern matching for specific header patterns (but exclude ingredients)
    const exactPatterns = [
      /^(for the .+):?$/i,
      /^(marinade):?$/i,
      /^(dressing):?$/i,
      /^(topping):?$/i,
      /^(filling):?$/i,
      /^(base):?$/i,
      /^(assembly):?$/i,
      /^(to serve):?$/i,
      /^(optional):?$/i,
      /^(gravy):?$/i,
      /^(preparation|prep):?$/i,
      /^(method):?$/i,
      /^(.+ ingredients?):?$/i,
    ];
    
    const matchesExactPattern = exactPatterns.some(pattern => pattern.test(text));
    if (matchesExactPattern) {
      console.log(`🔍 "${text}" matches exact header pattern`);
      return true;
    }

    console.log(`🔍 "${text}" does not appear to be a header`);
    return false;
  }

  private static looksLikeIngredient(text: string): boolean {
    // Enhanced ingredient detection with stronger patterns
    const hasNumber = /\d/.test(text);
    const hasUnit = /\b(cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|oz|ounce|ounces|lb|pound|pounds|kg|kilogram|kilograms|g|gram|grams|ml|milliliter|milliliters|l|liter|liters|inch|inches|clove|cloves|piece|pieces|slice|slices|can|cans|jar|jars|bottle|bottles|packet|packets|pinch|dash|handful)\b/i.test(text);
    const hasCommonIngredients = /\b(oil|salt|pepper|garlic|onion|flour|sugar|butter|water|milk|egg|chicken|beef|pork|cheese|tomato|lemon|lime|olive|vinegar|herbs|spices|paste|sauce|cilantro|parsley|basil|curry|soy|coconut|broccoli|zucchini|bell pepper|ginger)\b/i.test(text);
    const hasQuantifier = /\b(large|small|medium|fresh|dried|chopped|diced|minced|crushed|grated|sliced|red|green|yellow|white|black|for garnish)\b/i.test(text);
    
    // Strong indicators: number + unit combination
    const hasStrongPattern = hasNumber && hasUnit;
    
    // Medium indicators: common ingredients or descriptive terms
    const hasMediumPattern = hasCommonIngredients || (hasNumber && hasQuantifier);
    
    // Additional patterns that strongly suggest ingredients
    const hasIngredientStructure = /^\d+\s+\w+.*,\s*(chopped|diced|minced|sliced|grated|crushed)$/i.test(text);
    const hasCanPackagePattern = /\d+\s*(can|jar|bottle|packet)\s*\([^)]+\)/i.test(text);
    
    return hasStrongPattern || hasMediumPattern || hasIngredientStructure || hasCanPackagePattern;
  }

  static flattenSectionedIngredients(sections: IngredientSection[]): string[] {
    const flattened: string[] = [];
    
    for (const section of sections) {
      if (section.header) {
        flattened.push(section.header + ':');
      }
      flattened.push(...section.ingredients);
    }
    
    return flattened;
  }
}
