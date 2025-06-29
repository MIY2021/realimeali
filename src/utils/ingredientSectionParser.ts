interface IngredientSection {
  header?: string;
  ingredients: string[];
}

export class IngredientSectionParser {
  private static sectionPatterns = [
    // Existing patterns
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
    
    // New flexible patterns
    /^(.+):$/i, // Any text ending with a colon
    /^(.+ ingredients?):?$/i, // "X ingredients" or "X ingredient"
    /^(.+ sauce):?$/i, // "X sauce"
    /^(.+ marinade):?$/i, // "X marinade"
    /^(.+ dressing):?$/i, // "X dressing"
    /^(.+ mixture):?$/i, // "X mixture"
    /^(.+ topping):?$/i, // "X topping"
    /^(.+ filling):?$/i, // "X filling"
    /^(.+ garnish):?$/i, // "X garnish"
    /^(preparation|prep):?$/i, // Preparation
    /^(method):?$/i, // Method
  ];

  static parseIngredients(ingredients: string[]): IngredientSection[] {
    if (!ingredients || ingredients.length === 0) {
      return [{ ingredients: [] }];
    }

    const sections: IngredientSection[] = [];
    let currentSection: IngredientSection = { ingredients: [] };

    for (const ingredient of ingredients) {
      const trimmed = ingredient.trim();
      
      if (!trimmed) continue; // Skip empty lines
      
      // Check if this ingredient is actually a section header
      const isHeader = this.isLikelyHeader(trimmed);
      
      if (isHeader) {
        // Save current section if it has ingredients
        if (currentSection.ingredients.length > 0) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          header: trimmed.replace(/(:|\.)$/, ''), // Remove trailing colon or period
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
    // Check against predefined patterns
    const matchesPattern = this.sectionPatterns.some(pattern => pattern.test(text));
    if (matchesPattern) return true;

    // Additional heuristics for header detection
    const lowerText = text.toLowerCase();
    
    // Lines ending with colon are likely headers
    if (text.endsWith(':')) {
      // But exclude obvious ingredient measurements
      const hasNumber = /\d/.test(text);
      const hasUnit = /\b(cup|cups|tbsp|tsp|oz|lb|kg|g|ml|l|inch|inches)\b/i.test(text);
      
      // If it has numbers and units, it's probably an ingredient, not a header
      if (hasNumber && hasUnit) return false;
      
      // If it's short and ends with colon, likely a header
      if (text.length < 50) return true;
    }

    // Common header keywords
    const headerKeywords = [
      'for the', 'for making', 'sauce', 'marinade', 'dressing', 'topping', 
      'garnish', 'filling', 'base', 'mixture', 'preparation', 'assembly',
      'ingredients', 'components', 'paste', 'seasoning', 'spice mix'
    ];
    
    const containsHeaderKeyword = headerKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
    
    // If it contains header keywords and is relatively short, it's likely a header
    if (containsHeaderKeyword && text.length < 80 && !this.looksLikeIngredient(text)) {
      return true;
    }

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
