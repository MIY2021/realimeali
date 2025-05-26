
export const categorizeIngredient = (ingredient: string): string => {
  const lower = ingredient.toLowerCase();
  
  // Fresh & Chilled Food
  if (lower.includes('lettuce') || lower.includes('spinach') || lower.includes('kale') || 
      lower.includes('rocket') || lower.includes('watercress') || lower.includes('cabbage') || 
      lower.includes('broccoli') || lower.includes('cauliflower') || lower.includes('carrot') || 
      lower.includes('onion') || lower.includes('potato') || lower.includes('tomato') || 
      lower.includes('cucumber') || lower.includes('pepper') || lower.includes('courgette') || 
      lower.includes('aubergine') || lower.includes('mushroom') || lower.includes('garlic') || 
      lower.includes('ginger') || lower.includes('lemon') || lower.includes('lime') || 
      lower.includes('orange') || lower.includes('apple') || lower.includes('banana') || 
      lower.includes('grapes') || lower.includes('strawberry') || lower.includes('avocado') || 
      lower.includes('herbs') || lower.includes('parsley') || lower.includes('coriander') || 
      lower.includes('basil') || lower.includes('thyme') || lower.includes('rosemary') || 
      lower.includes('fresh') || lower.includes('salad') || lower.includes('vegetable') || 
      lower.includes('fruit') || lower.includes('meat') || lower.includes('chicken') || 
      lower.includes('beef') || lower.includes('pork') || lower.includes('lamb') || 
      lower.includes('fish') || lower.includes('salmon') || lower.includes('cod') || 
      lower.includes('prawns') || lower.includes('bacon') || lower.includes('ham') || 
      lower.includes('sausage') || lower.includes('mince') || lower.includes('steak') || 
      lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || 
      lower.includes('cream') || lower.includes('butter') || lower.includes('egg') || 
      lower.includes('tofu')) {
    return "Fresh & Chilled Food";
  }
  
  // Bakery
  if (lower.includes('bread') || lower.includes('bun') || lower.includes('roll') || 
      lower.includes('bagel') || lower.includes('muffin') || lower.includes('croissant') || 
      lower.includes('pastry') || lower.includes('cake') || lower.includes('loaf') || 
      lower.includes('baguette') || lower.includes('pitta') || lower.includes('naan') || 
      lower.includes('tortilla') || lower.includes('wrap') || lower.includes('crumpet') || 
      lower.includes('scone')) {
    return "Bakery";
  }
  
  // Frozen Food
  if (lower.includes('frozen') || lower.includes('ice') || lower.includes('sorbet') || 
      lower.includes('gelato') || lower.includes('peas') || lower.includes('chips') || 
      lower.includes('pizza') || lower.includes('ready meal')) {
    return "Frozen Food";
  }
  
  // Dietary, Lifestyle & World Foods
  if (lower.includes('gluten') || lower.includes('dairy') || lower.includes('vegan') || 
      lower.includes('organic') || lower.includes('free') || lower.includes('range') || 
      lower.includes('almond milk') || lower.includes('soy milk') || lower.includes('oat milk') || 
      lower.includes('kimchi') || lower.includes('miso') || lower.includes('teriyaki') || 
      lower.includes('curry') || lower.includes('garam') || lower.includes('chinese') || 
      lower.includes('thai') || lower.includes('indian') || lower.includes('mexican') || 
      lower.includes('mediterranean') || lower.includes('kosher') || lower.includes('halal')) {
    return "Dietary, Lifestyle & World Foods";
  }
  
  // Soft Drinks, Tea & Coffee
  if (lower.includes('juice') || lower.includes('squash') || lower.includes('cordial') || 
      lower.includes('water') || lower.includes('sparkling') || lower.includes('cola') || 
      lower.includes('lemonade') || lower.includes('energy') || lower.includes('smoothie') || 
      lower.includes('kombucha') || lower.includes('green tea') || lower.includes('black tea') || 
      lower.includes('herbal') || lower.includes('coffee beans') || lower.includes('instant coffee') || 
      lower.includes('decaf') || lower.includes('tea') || lower.includes('coffee')) {
    return "Soft Drinks, Tea & Coffee";
  }
  
  // Beer, Wine & Spirits
  if (lower.includes('beer') || lower.includes('wine') || lower.includes('whisky') || 
      lower.includes('vodka') || lower.includes('gin') || lower.includes('rum') || 
      lower.includes('brandy') || lower.includes('champagne') || lower.includes('prosecco') || 
      lower.includes('cider') || lower.includes('ale') || lower.includes('lager') || 
      lower.includes('spirits') || lower.includes('alcohol')) {
    return "Beer, Wine & Spirits";
  }
  
  // Default fallback to Food Cupboard for all other items
  return "Food Cupboard";
};
