
interface IngredientSection {
  header?: string;
  ingredients: string[];
}

export class IngredientSectionParser {
  private static sectionPatterns = [
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
    /^(optional):?$/i
  ];

  static parseIngredients(ingredients: string[]): IngredientSection[] {
    if (!ingredients || ingredients.length === 0) {
      return [{ ingredients: [] }];
    }

    const sections: IngredientSection[] = [];
    let currentSection: IngredientSection = { ingredients: [] };

    for (const ingredient of ingredients) {
      const trimmed = ingredient.trim();
      
      // Check if this ingredient is actually a section header
      const isHeader = this.sectionPatterns.some(pattern => pattern.test(trimmed));
      
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
