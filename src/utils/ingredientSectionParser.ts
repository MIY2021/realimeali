
interface IngredientSection {
  header?: string;
  ingredients: string[];
}

export class IngredientSectionParser {

  static parseIngredients(ingredients: string[], groupIndices?: number[]): IngredientSection[] {
    // Reduce excessive logging for production use
    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 IngredientSectionParser.parseIngredients called with:", ingredients.length, "ingredients", groupIndices?.length || 0, "groups");
    }
    
    if (!ingredients || ingredients.length === 0) {
      return [{ ingredients: [] }];
    }

    const sections: IngredientSection[] = [];
    let currentSection: IngredientSection = { ingredients: [] };
    
    // Create a Set for O(1) lookup of group indices
    const groupSet = new Set(groupIndices || []);
    
    // If no group indices provided, fall back to detecting headers by colon pattern (for backward compatibility with existing recipes)
    const useColonDetection = !groupIndices || groupIndices.length === 0;

    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];
      const trimmed = ingredient.trim();
      
      if (!trimmed) continue;
      
      // Check if this ingredient is a group header
      let isHeader: boolean;
      if (useColonDetection) {
        // Backward compatibility: detect headers by colon pattern (but not ratios like "1:2 ratio:")
        isHeader = trimmed.endsWith(':') && !/\d+.*:/.test(trimmed);
      } else {
        // Use provided group indices
        isHeader = groupSet.has(i);
      }
      
      if (isHeader) {
        // Save current section if it has ingredients
        if (currentSection.ingredients.length > 0) {
          sections.push(currentSection);
        }
        
        // Start new section - remove colon if present (for backward compatibility)
        const cleanHeader = trimmed.replace(/(:|\.)$/, '');
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

    // Reorder sections: sections without headers first, then sections with headers at the bottom
    const sectionsWithoutHeaders: IngredientSection[] = [];
    const sectionsWithHeaders: IngredientSection[] = [];
    
    for (const section of sections) {
      if (section.header) {
        sectionsWithHeaders.push(section);
      } else {
        sectionsWithoutHeaders.push(section);
      }
    }
    
    // Return ungrouped sections first, then grouped sections at the bottom
    return [...sectionsWithoutHeaders, ...sectionsWithHeaders];
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
