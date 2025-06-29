
interface IngredientSection {
  header?: string;
  ingredients: string[];
}

export class IngredientSectionParser {
  private static sectionPatterns = [
    // Exact colon patterns
    /^(.+):$/i,
    
    // Common recipe section patterns
    /^(for the .+):?$/i,
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
    
    // Pattern-based headers
    /^(.+ ingredients?):?$/i,
    /^(.+ sauce):?$/i,
    /^(.+ marinade):?$/i,
    /^(.+ dressing):?$/i,
    /^(.+ mixture):?$/i,
    /^(.+ topping):?$/i,
    /^(.+ filling):?$/i,
    /^(.+ garnish):?$/i,
    /^(preparation|prep):?$/i,
    /^(method):?$/i,
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
    
    // Check against predefined patterns first
    const matchesPattern = this.sectionPatterns.some(pattern => {
      const matches = pattern.test(text);
      if (matches) {
        console.log(`🔍 "${text}" matches pattern: ${pattern}`);
      }
      return matches;
    });
    
    if (matchesPattern) return true;

    // Lines ending with colon are likely headers (but not if they look like ingredients)
    if (text.endsWith(':')) {
      console.log(`🔍 "${text}" ends with colon, checking if it's an ingredient...`);
      
      // Check if it looks like an ingredient with measurements
      const hasNumber = /\d/.test(text);
      const hasUnit = /\b(cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|oz|ounce|ounces|lb|pound|pounds|kg|kilogram|kilograms|g|gram|grams|ml|milliliter|milliliters|l|liter|liters|inch|inches|clove|cloves|piece|pieces|slice|slices)\b/i.test(text);
      
      // If it has numbers and units, it's probably an ingredient, not a header
      if (hasNumber && hasUnit) {
        console.log(`🔍 "${text}" has measurements, treating as ingredient`);
        return false;
      }
      
      // If it's short and ends with colon, likely a header
      if (text.length < 50) {
        console.log(`🔍 "${text}" is short and ends with colon, treating as header`);
        return true;
      }
    }

    // Common header keywords
    const headerKeywords = [
      'for the', 'for making', 'sauce', 'marinade', 'dressing', 'topping', 
      'garnish', 'filling', 'base', 'mixture', 'preparation', 'assembly',
      'ingredients', 'components', 'paste', 'seasoning', 'spice mix', 'gravy'
    ];
    
    const containsHeaderKeyword = headerKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
    
    // If it contains header keywords and is relatively short, it's likely a header
    if (containsHeaderKeyword && text.length < 80 && !this.looksLikeIngredient(text)) {
      console.log(`🔍 "${text}" contains header keyword and doesn't look like ingredient`);
      return true;
    }

    console.log(`🔍 "${text}" does not appear to be a header`);
    return false;
  }

  private static looksLikeIngredient(text: string): boolean {
    // Check if the text looks like a typical ingredient with measurements
    const hasNumber = /\d/.test(text);
    const hasUnit = /\b(cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|oz|ounce|ounces|lb|pound|pounds|kg|kilogram|kilograms|g|gram|grams|ml|milliliter|milliliters|l|liter|liters|inch|inches|clove|cloves|piece|pieces|slice|slices)\b/i.test(text);
    const hasCommonIngredients = /\b(oil|salt|pepper|garlic|onion|flour|sugar|butter|water|milk|egg|chicken|beef|pork|cheese|tomato|lemon|lime)\b/i.test(text);
    
    return (hasNumber && hasUnit) || hasCommonIngredients;
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
