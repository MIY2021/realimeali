export interface ParsedShoppingIngredient {
  name: string;
  quantity?: number;
  unit?: string;
  searchName: string;
}

const UNIT_ALIASES: Record<string, string> = {
  g: "g", gram: "g", grams: "g",
  kg: "kg", kilo: "kg", kilos: "kg", kilogram: "kg", kilograms: "kg",
  ml: "ml", millilitre: "ml", millilitres: "ml", milliliter: "ml", milliliters: "ml",
  l: "l", litre: "l", litres: "l", liter: "l", liters: "l",
  cl: "cl",
  tsp: "tsp", "tsp.": "tsp", teaspoon: "tsp", teaspoons: "tsp",
  tbsp: "tbsp", "tbsp.": "tbsp", tablespoon: "tbsp", tablespoons: "tbsp",
  oz: "oz", ounce: "oz", ounces: "oz",
  lb: "lb", lbs: "lb", pound: "lb", pounds: "lb",
  tin: "tin", tins: "tins", can: "tin", cans: "tins",
  packet: "packet", packets: "packets", pack: "pack", packs: "packs",
  bunch: "bunch", bunches: "bunches",
  clove: "cloves", cloves: "cloves",
  slice: "slices", slices: "slices",
  piece: "pcs", pieces: "pcs",
};

const NUMBER_PATTERN = "(?:\\d+(?:\\.\\d+)?|\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|[½¼¾⅓⅔⅛⅜⅝⅞])";

const fractionToNumber = (value: string): number | undefined => {
  const trimmed = value.trim();
  const unicodeFractions: Record<string, number> = {
    "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3,
    "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
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
    .replace(/^week\d+-/i, "")
    .replace(/\s+/g, " ")
    .trim();

  name = name.replace(/\s*\([^)]*\)/g, "").trim();

  // Remove preparation/cooking notes, but do not blindly remove everything after a comma.
  name = name.replace(
    /,\s*(?:thinly|finely|roughly|very finely|roughly|peeled|chopped|diced|minced|sliced|grated|crushed|halved|quartered|rinsed|drained|pitted|deseeded|de-seeded|to serve|for serving|divided|separated)\b.*$/i,
    ""
  ).trim();

  name = name.replace(
    /\s+(?:peeled|chopped|diced|minced|sliced|grated|crushed|halved|quartered|rinsed|drained|pitted|deseeded|de-seeded)\b.*$/i,
    ""
  ).trim();

  return name.replace(/^[,;:\-\s]+|[,;:\-\s]+$/g, "").trim();
};

/**
 * Removes generic shopping-search noise without destroying meaningful product
 * characteristics such as "5% fat", "smoked", "light", "frozen" or "baby".
 */
export const canonicalizeShoppingSearchName = (value: string): string => {
  let name = value
    .replace(/\s+/g, " ")
    .replace(/^[,;:\-\s]+|[,;:\-\s]+$/g, "")
    .trim();

  // Generic size/quality wording is not useful in a supermarket search.
  name = name.replace(/\b(?:small|medium|large|extra large|xl|good quality|high quality|nice)\b\s*/gi, "");
  name = name.replace(/\s{2,}/g, " ").trim();

  // Never allow an accidental trailing punctuation mark or dangling conjunction.
  name = name.replace(/\s+(?:and|&|,|;)$/i, "").trim();

  return name;
};

export function parseShoppingIngredient(rawIngredient: string): ParsedShoppingIngredient {
  const cleaned = tidyName(rawIngredient.trim());

  const amountMatch = cleaned.match(new RegExp(
    "^((" + NUMBER_PATTERN + "))\\s*(g|kg|ml|l|cl|oz|lb|lbs|tsp\\.?|tbsp\\.?|teaspoons?|tablespoons?|grams?|kilos?|kilograms?|millilitres?|milliliters?|litres?|liters?|ounces?|pounds?|tins?|cans?|packets?|packs?|bunches?|cloves?|slices?|pieces?)\\b\\s*",
    "i"
  ));

  if (amountMatch) {
    const quantity = fractionToNumber(amountMatch[1]);
    const rawUnit = amountMatch[2].toLowerCase();
    const unit = UNIT_ALIASES[rawUnit] || rawUnit;
    const name = canonicalizeShoppingSearchName(cleaned.slice(amountMatch[0].length).trim());

    return {
      name: name || cleaned,
      quantity,
      unit,
      searchName: name || cleaned,
    };
  }

  // Do not interpret percentages such as "5% fat beef mince" as "5 pieces".
  const countMatch = cleaned.match(new RegExp("^((" + NUMBER_PATTERN + "))\\s+(?!%)(.+)$", "i"));
  if (countMatch) {
    const quantity = fractionToNumber(countMatch[1]);
    const name = canonicalizeShoppingSearchName(countMatch[2].trim());

    if (quantity !== undefined && name) {
      return { name, quantity, unit: "pcs", searchName: name };
    }
  }

  const searchName = canonicalizeShoppingSearchName(cleaned);
  return { name: searchName, searchName };
};

export function getShoppingSearchName(name: string, quantity?: number, unit?: string): string {
  return parseShoppingIngredient(name).searchName || name.trim();
}
