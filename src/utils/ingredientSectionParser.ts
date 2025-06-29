
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
    console.log("🔍 IngredientSectionParser.parseIngredients called with:", ingredients);
    
    if (!ingredients || ingredients.length === 0) {
      console.log("🔍 No ingredients provided, returning empty section");
      return [{ ingredients: [] }];
    }

    const sections: IngredientSection[] = [];
    let currentSection: IngredientSection = { ingredients: [] };

    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];
      const trimmed = ingredient.trim();
      
      console.log(`🔍 Processing ingredient ${i}: "${trimmed}"`);
      
      if (!trimmed) {
        console.log(`🔍 Skipping empty ingredient at index ${i}`);
        continue;
      }
      
      // Check if this ingredient is actually a section header
      const isHeader = this.isLikelyHeader(trimmed);
      console.log(`🔍 Is "${trimmed}" a header? ${isHeader}`);
      
      if (isHeader) {
        // Save current section if it has ingredients
        if (currentSection.ingredients.length > 0) {
          console.log(`🔍 Saving previous section with ${currentSection.ingredients.length} ingredients`);
          sections.push(currentSection);
        }
        
        // Start new section
        const cleanHeader = trimmed.replace(/(:|\.)$/, ''); // Remove trailing colon or period
        console.log(`🔍 Starting new section: "${cleanHeader}"`);
        currentSection = {
          header: cleanHeader,
          ingredients: []
        };
      } else {
        // Add to current section
        console.log(`🔍 Adding "${ingredient}" to current section`);
        currentSection.ingredients.push(ingredient);
      }
    }

    // Add the final section
    if (currentSection.ingredients.length > 0 || currentSection.header) {
      console.log(`🔍 Adding final section with ${currentSection.ingredients.length} ingredients`);
      sections.push(currentSection);
    }

    console.log(`🔍 Final result: ${sections.length} sections`, sections);

    // If no sections were found, return all ingredients as one section
    if (sections.length === 0) {
      console.log("🔍 No sections found, returning all ingredients as single section");
      return [{ ingredients }];
    }

    return sections;
  }

  private static isLikelyHeader(text: string): boolean {
    const lowerText = text.toLowerCase().trim();
    
    // More flexible pattern matching
    const matchesPattern = this.sectionPatterns.some(pattern => {
      const matches = pattern.test(text);
      if (matches) {
        console.log(`🔍 "${text}" matches pattern: ${pattern}`);
      }
      return matches;
    });
    
    if (matchesPattern) return true;

    // Enhanced colon detection
    if (text.endsWith(':')) {
      console.log(`🔍 "${text}" ends with colon, checking if it's an ingredient...`);
      
      // More precise ingredient detection
      const hasNumberAndUnit = /\d+\s*(cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|oz|ounce|ounces|lb|pound|pounds|kg|kilogram|kilograms|g|gram|grams|ml|milliliter|milliliters|l|liter|liters|inch|inches|clove|cloves|piece|pieces|slice|slices|can|cans|jar|jars|bottle|bottles|packet|packets)/i.test(text);
      
      // If it has clear measurements, it's probably an ingredient
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

    // Enhanced header keywords detection
    const headerKeywords = [
      'for the', 'for making', 'sauce', 'marinade', 'dressing', 'topping', 
      'garnish', 'filling', 'base', 'mixture', 'preparation', 'assembly',
      'ingredients', 'components', 'paste', 'seasoning', 'spice mix', 'gravy',
      'vegetables', 'meat', 'spices', 'herbs', 'optional', 'to serve'
    ];
    
    const containsHeaderKeyword = headerKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
    
    // More lenient header detection for keyword-based headers
    if (containsHeaderKeyword && text.length < 100 && !this.looksLikeIngredient(text)) {
      console.log(`🔍 "${text}" contains header keyword and doesn't look like ingredient`);
      return true;
    }

    console.log(`🔍 "${text}" does not appear to be a header`);
    return false;
  }

  private static looksLikeIngredient(text: string): boolean {
    // Enhanced ingredient detection
    const hasNumber = /\d/.test(text);
    const hasUnit = /\b(cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|oz|ounce|ounces|lb|pound|pounds|kg|kilogram|kilograms|g|gram|grams|ml|milliliter|milliliters|l|liter|liters|inch|inches|clove|cloves|piece|pieces|slice|slices|can|cans|jar|jars|bottle|bottles|packet|packets|pinch|dash|handful)\b/i.test(text);
    const hasCommonIngredients = /\b(oil|salt|pepper|garlic|onion|flour|sugar|butter|water|milk|egg|chicken|beef|pork|cheese|tomato|lemon|lime|olive|vinegar|herbs|spices)\b/i.test(text);
    const hasQuantifier = /\b(large|small|medium|fresh|dried|chopped|diced|minced|crushed|grated|sliced)\b/i.test(text);
    
    return (hasNumber && hasUnit) || hasCommonIngredients || (hasNumber && hasQuantifier);
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
