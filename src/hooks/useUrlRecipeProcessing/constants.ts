
export const FUNNY_LOADING_MESSAGES = [
  "🤓 Oh where did I put my reading glasses...",
  "😋 WOW this recipe looks tasty!",
  "🤤 Getting peckish just looking at this...",
  "🕵️ Investigating kitchen mysteries...",
  "🎭 Putting on my chef hat...",
  "🦸 Activating recipe superpowers...",
  "🔮 Consulting the culinary crystal ball...",
  "🎪 Performing food magic tricks...",
  "🧙‍♂️ Brewing up some recipe wizardry...",
  "🎯 Hunting for flavour treasures...",
  "👨‍🍳 Donning my apron with style...",
  "🍴 Preparing the finest cutlery...",
  "🥄 Stirring up some culinary magic...",
  "🌟 Sprinkling fairy dust on ingredients...",
  "🔍 Analysing the art of cookery...",
  "🎨 Painting flavours on the palette...",
  "🏆 Competing for the best recipe prize...",
  "🚀 Launching into flavour space...",
  "🎭 Rehearsing the cooking performance...",
  "🎪 Juggling ingredients with finesse..."
];

// Remove the restrictive domain list - let the edge function handle parsing attempts
export const SUPPORTED_DOMAINS: string[] = [];

// We'll let the parse-recipe-ai edge function attempt to parse any website
// and only show errors if the actual parsing fails, not based on domain restrictions
