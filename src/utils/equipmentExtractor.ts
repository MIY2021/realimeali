
export class EquipmentExtractor {
  private static equipmentKeywords = {
    // Cooking vessels
    'pan': ['pan', 'frying pan', 'skillet', 'saucepan', 'wok'],
    'pot': ['pot', 'stockpot', 'dutch oven', 'casserole dish'],
    'baking tray': ['baking tray', 'baking sheet', 'cookie sheet', 'roasting pan'],
    'bowl': ['bowl', 'mixing bowl', 'large bowl', 'medium bowl', 'small bowl'],
    
    // Appliances
    'oven': ['oven', 'bake', 'baked', 'baking', 'roast', 'roasted', 'roasting'],
    'stovetop': ['stovetop', 'hob', 'burner', 'simmer', 'boil', 'fry', 'sauté'],
    'microwave': ['microwave', 'microwaved'],
    'grill': ['grill', 'grilled', 'grilling', 'barbecue', 'bbq'],
    'blender': ['blender', 'blend', 'blended', 'puree', 'pureed'],
    'food processor': ['food processor', 'process', 'processed'],
    'mixer': ['mixer', 'mix', 'mixed', 'beat', 'whisk', 'whipped'],
    
    // Tools
    'knife': ['knife', 'chop', 'chopped', 'dice', 'diced', 'slice', 'sliced', 'mince', 'minced'],
    'cutting board': ['cutting board', 'chopping board'],
    'whisk': ['whisk', 'whisked', 'whipping'],
    'spatula': ['spatula', 'flip', 'flipped', 'turn'],
    'wooden spoon': ['wooden spoon', 'stir', 'stirred', 'stirring'],
    'measuring cups': ['cup', 'cups', 'measure', 'measured'],
    'measuring spoons': ['tablespoon', 'tbsp', 'teaspoon', 'tsp'],
    'strainer': ['strain', 'strained', 'colander', 'sieve'],
    'grater': ['grate', 'grated', 'zest', 'zested'],
    'can opener': ['can opener', 'tin opener'],
    'peeler': ['peel', 'peeled', 'peeler'],
    
    // Specialty items
    'rolling pin': ['roll', 'rolled', 'rolling pin'],
    'pastry brush': ['brush', 'brushed', 'pastry brush'],
    'tongs': ['tongs', 'turn', 'flip'],
    'timer': ['timer', 'time', 'minutes', 'hours']
  };

  static extractEquipment(recipe: { ingredients: string[]; instructions: string[] }): string[] {
    const equipment = new Set<string>();
    const allText = [...recipe.ingredients, ...recipe.instructions].join(' ').toLowerCase();

    // Check each equipment category
    for (const [equipmentName, keywords] of Object.entries(this.equipmentKeywords)) {
      const hasKeyword = keywords.some(keyword => 
        allText.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        equipment.add(equipmentName);
      }
    }

    // Convert to array and sort alphabetically
    return Array.from(equipment).sort();
  }

  static formatEquipmentList(equipment: string[]): string[] {
    return equipment.map(item => {
      // Capitalize first letter of each word
      return item.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    });
  }
}
