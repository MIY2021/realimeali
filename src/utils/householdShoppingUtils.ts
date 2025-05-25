
export const parseIngredientQty = (text: string): { qty: number; unit: string; name: string } => {
  const match = text.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)?\s+(.*)$/);
  if (match) {
    return {
      qty: parseFloat(match[1]),
      unit: match[2] ? match[2].trim() : "",
      name: match[3].toLowerCase(),
    };
  }
  return { qty: 1, unit: "", name: text.toLowerCase() };
};

export const categoriseByName = (name: string): string => {
  const nameLower = name.toLowerCase();
  
  // Fresh & Chilled Food
  if (/lettuce|spinach|kale|rocket|watercress|cabbage|broccoli|cauliflower|carrot|onion|potato|tomato|cucumber|pepper|courgette|aubergine|mushroom|garlic|ginger|lemon|lime|orange|apple|banana|grapes|strawberry|avocado|herbs|parsley|coriander|basil|thyme|rosemary|fresh|salad|vegetable|fruit|meat|chicken|beef|pork|lamb|fish|salmon|cod|prawns|bacon|ham|sausage|mince|steak|milk|cheese|yogurt|cream|butter|egg|tofu/i.test(nameLower)) {
    return "Fresh & Chilled Food";
  }
  
  // Food Cupboard
  if (/flour|sugar|salt|pepper|oil|vinegar|rice|pasta|noodles|quinoa|couscous|bulgur|lentils|beans|chickpeas|tinned|canned|jar|sauce|paste|stock|cube|spice|spices|cumin|paprika|turmeric|cinnamon|vanilla|honey|syrup|nuts|seeds|dried|cereal|oats|biscuits|crackers|tea|coffee|condiment|ketchup|mustard|mayo|mayonnaise|dressing|coconut|tahini|peanut|almond|olive|sunflower|rapeseed|balsamic|soy|worcestershire|tabasco|harissa/i.test(nameLower)) {
    return "Food Cupboard";
  }
  
  // Bakery
  if (/bread|bun|roll|bagel|muffin|croissant|pastry|cake|loaf|baguette|pitta|naan|tortilla|wrap|crumpet|scone/i.test(nameLower)) {
    return "Bakery";
  }
  
  // Frozen Food
  if (/frozen|ice|sorbet|gelato|peas|chips|pizza|ready meal/i.test(nameLower)) {
    return "Frozen Food";
  }
  
  // Dietary, Lifestyle & World Foods
  if (/gluten.free|dairy.free|vegan|organic|free.range|coconut.milk|almond.milk|soy.milk|oat.milk|kimchi|miso|teriyaki|curry|garam.masala|chinese|thai|indian|mexican|mediterranean|kosher|halal/i.test(nameLower)) {
    return "Dietary, Lifestyle & World Foods";
  }
  
  // Soft Drinks, Tea & Coffee
  if (/juice|squash|cordial|water|sparkling|cola|lemonade|energy.drink|smoothie|kombucha|green.tea|black.tea|herbal.tea|coffee.beans|instant.coffee|decaf/i.test(nameLower)) {
    return "Soft Drinks, Tea & Coffee";
  }
  
  // Beer, Wine & Spirits
  if (/beer|wine|whisky|vodka|gin|rum|brandy|champagne|prosecco|cider|ale|lager|spirits|alcohol/i.test(nameLower)) {
    return "Beer, Wine & Spirits";
  }
  
  // Health, Beauty & Personal Care
  if (/shampoo|conditioner|soap|toothpaste|deodorant|moisturiser|sunscreen|vitamins|supplements|paracetamol|ibuprofen|plaster|antiseptic/i.test(nameLower)) {
    return "Health, Beauty & Personal Care";
  }
  
  // Baby, Parent & Kids
  if (/nappy|baby.food|formula|dummy|wipes|baby.oil|baby.powder|kids|children|junior/i.test(nameLower)) {
    return "Baby, Parent & Kids";
  }
  
  // Home Care & Cleaning
  if (/washing.powder|fabric.softener|bleach|disinfectant|toilet.paper|kitchen.roll|bin.bags|washing.up.liquid|dishwasher|tablets|cleaning|polish|hoover|vacuum/i.test(nameLower)) {
    return "Home Care & Cleaning";
  }
  
  // Pets, Home & Garden
  if (/dog.food|cat.food|pet.treats|bird.seed|fish.food|plant.food|compost|seeds|bulbs|garden|pet|animal/i.test(nameLower)) {
    return "Pets, Home & Garden";
  }
  
  // Occasions & Entertaining
  if (/candles|balloons|party|celebration|gift|card|wrapping|decorations|entertaining/i.test(nameLower)) {
    return "Occasions & Entertaining";
  }
  
  // Clothing & Accessories
  if (/socks|underwear|shirt|dress|jumper|jacket|shoes|hat|gloves|scarf|belt|bag|watch|jewellery/i.test(nameLower)) {
    return "Clothing & Accessories";
  }
  
  // Default fallback
  return "Food Cupboard";
};
