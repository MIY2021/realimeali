import { extractIngredientNameFallback } from "@/utils/shoppingListUtils";

export interface ParsedShoppingIngredient {
  name: string;
  quantity?: number;
  unit?: string;
  searchName: string;
}

const UNIT_ALIASES: Record<string, string> = {
  g: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  kilo: "kg",
  kilos: "kg",
  ml: "ml",
  millilitre: "ml",
  millilitres: "ml",
  milliliter: "ml",
  milliliters: "ml",
  l: "l",
  litre: "l",
  litres: "l",
  liter: "l",
  liters: "l",
  cl: "cl",
  tsp: "tsp",
  "tsp.": "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tbsp: "tbsp",
  "tbsp.": "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  oz: "oz",
  ounce: "oz",
  ounces: "oz",
  lb: "lb",
  lbs: "lb",
  pound: "lb",
  pounds: "lb",
  tin: "tin",
  tins: "tins",
  can: "tin",
  cans: "tins",
  packet: "packet",
  packets: "packets",
  pack: "pack",
  packs: "packs",
  bunch: "bunch",
  bunches: "bunches",
  clove: "cloves",
  cloves: "cloves",
  slice: "slices",
  slices: "slices",
  piece: "pcs",
  pieces: "pcs",
};

const NUMBER_PATTERN = "(?:\\d+(?:\\.\\d+)?|\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|[½¼¾⅓⅔⅛⅜⅝⅞])";

const fractionToNumber = (value: string): number | undefined => {
  const trimmed = value.trim();
  const unicodeFractions: Record<string, number> = {
    "½": 0.5,
    "¼": 0.25,
    "¾": 0.75,
    "⅓": 1 / 3,
    "⅔": 2 / 3,
    "⅛": 0.125,
    "⅜": 0.375,
    "⅝": 0.625,
    "⅞": 0.875,
  };

  if (unicodeFractions[trimmed] !== undefined) return unicodeFractions[trimmed];

  if (/^\d+\s+\d+\/\d+$/.test(trimmed)) {
    const [whole, fraction] = trimmed.split(/\s+/);
    const [numerator, denominator] = fraction.split("/").map(Number);
    return Number(whole) + numerator / denominator;
  }

  if (/^\d+\/\d+$/.test(trimmed)) {
    const [numerator, denominator] = trimmed.split("/").map(Number);
    return numerator / denominator;
  }

  const number = Number(trimmed);
  return Number.isFinite(number) ? number : undefined;
};

const tidyName = (value: string): string => {
  let name = value
    .replace(/^week\\d+-/i, "")
    .replace(/\\s+/g, " ")
    .trim();

  // Preparation notes are useful to cooks, but usually make poor supermarket searches.
  name = name.replace(/\\s*\\([^)]*\\)/g, "").trim();
  name = name.split(/,\\s*/)[0].trim();

  // Remove common preparation phrases that follow the ingredient.
  name = name.replace(
    /\\s+(?:peeled|chopped|diced|minced|sliced|grated|crushed|halved|quartered|rinsed|drained|pitted|de-seeded|deseeded|finely|roughly)\\b.*$/i,
    ""
  ).trim();

  return name.replace(/^[,;:\-\\s]+|[,;:\-\\s]+$/g, "").trim();
};

export function parseShoppingIngredient(rawIngredient: string): ParsedShoppingIngredient {
  const original = rawIngredient.trim();
  const cleaned = tidyName(original);

  const amountMatch = cleaned.match(new RegExp(
    "^(" + NUMBER_PATTERN + ")\\s*(g|kg|ml|l|cl|oz|lb|lbs|tsp\\.?|tbsp\\.?|teaspoons?|tablespoons?|grams?|gram|kilos?|kilograms?|millilitres?|milliliters?|litres?|liters?|ounces?|pounds?|tins?|cans?|packets?|packs?|bunches?|cloves?|slices?|pieces?)\\b\\s*",
    "i"
  ));

  if (amountMatch) {
    const quantity = fractionToNumber(amountMatch[1]);
    const rawUnit = amountMatch[2].toLowerCase();
    const unit = UNIT_ALIASES[rawUnit] || rawUnit;
    const name = cleaned.slice(amountMatch[0].length).trim();

    return {
      name: name || cleaned,
      quantity,
      unit,
      searchName: name || cleaned,
    };
  }

  // Countable ingredients without an explicit unit: "2 onions", "3 lemons".
  const countMatch = cleaned.match(new RegExp("^(" + NUMBER_PATTERN + ")\\s+(.+)$", "i"));
  if (countMatch) {
    const quantity = fractionToNumber(countMatch[1]);
    const name = countMatch[2].trim();

    if (quantity !== undefined && name) {
      return {
        name,
        quantity,
        unit: "pcs",
        searchName: name,
      };
    }
  }

  const fallbackName = extractIngredientNameFallback(cleaned);
  const searchName = fallbackName || cleaned;

  return {
    name: searchName,
    searchName,
  };
}

/**
 * One canonical supermarket query for every shopping-list action.
 * The stored shopping-list name is already cleaned, but this also handles
 * older lists and manually added items safely.
 */
export function getShoppingSearchName(
  name: string,
  quantity?: number,
  unit?: string
): string {
  const parsed = parseShoppingIngredient(name);
  return parsed.searchName || name.trim();
}
