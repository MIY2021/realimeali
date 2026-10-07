export interface ParsedShoppingIngredient {
  name: string;
  quantity?: number;
  quantityMin?: number;
  quantityMax?: number;
  quantityDisplay?: string;
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
const RANGE_PATTERN = `(${NUMBER_PATTERN})\\s*[–-]\\s*(${NUMBER_PATTERN})`;

const formatParsedNumber = (value: string): string => {
  const number = fractionToNumber(value);
  if (number === undefined) return value.trim();

  const fractions: Array<[number, string]> = [
    [0.125, "⅛"], [0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"],
    [2 / 3, "⅔"], [0.75, "¾"], [0.875, "⅞"]
  ];

  if (Number.isInteger(number)) return String(number);

  for (const [decimal, symbol] of fractions) {
    if (Math.abs(number - decimal) < 0.01) return symbol;
    const whole = Math.floor(number);
    if (whole > 0 && Math.abs(number - whole - decimal) < 0.01) return `${whole}${symbol}`;
  }

  return String(Math.round(number * 100) / 100);
};

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
  const unitPattern = "g|kg|ml|l|cl|oz|lb|lbs|tsp\\.?|tbsp\\.?|teaspoons?|tablespoons?|grams?|kilos?|kilograms?|millilitres?|milliliters?|litres?|liters?|ounces?|pounds?|tins?|cans?|packets?|packs?|bunches?|cloves?|slices?|pieces?";

  // Support ranges such as "2-3 tbsp", "3–4 chicken breasts" and "½–1 tsp".
  const rangeAmountMatch = cleaned.match(new RegExp(
    "^" + RANGE_PATTERN + "\\s*(" + unitPattern + ")\\b\\s*",
    "i"
  ));

  if (rangeAmountMatch) {
    const min = fractionToNumber(rangeAmountMatch[1]);
    const max = fractionToNumber(rangeAmountMatch[2]);
    const rawUnit = rangeAmountMatch[3].toLowerCase();
    const unit = UNIT_ALIASES[rawUnit] || rawUnit;
    const name = canonicalizeShoppingSearchName(cleaned.slice(rangeAmountMatch[0].length).trim());

    if (min !== undefined && max !== undefined && name) {
      return {
        name, quantity: min, quantityMin: min, quantityMax: max,
        quantityDisplay: `${formatParsedNumber(rangeAmountMatch[1])}–${formatParsedNumber(rangeAmountMatch[2])}`,
        unit, searchName: name,
      };
    }
  }

  const amountMatch = cleaned.match(new RegExp(
    "^(" + NUMBER_PATTERN + ")\\s*(" + unitPattern + ")\\b\\s*",
    "i"
  ));

  if (amountMatch) {
    const quantity = fractionToNumber(amountMatch[1]);
    const rawUnit = amountMatch[2].toLowerCase();
    const unit = UNIT_ALIASES[rawUnit] || rawUnit;
    const name = canonicalizeShoppingSearchName(cleaned.slice(amountMatch[0].length).trim());

    return {
      name: name || cleaned, quantity, quantityMin: quantity, quantityMax: quantity,
      quantityDisplay: formatParsedNumber(amountMatch[1]), unit, searchName: name || cleaned,
    };
  }

  // Handle wording where the quantity follows the preparation, e.g. "Juice of ½ lemon".
  const quantityAfterPrepMatch = cleaned.match(new RegExp(
    "^(juice|zest)\\s+of\\s+(" + NUMBER_PATTERN + ")\\s+(.+)$", "i"
  ));

  if (quantityAfterPrepMatch) {
    const quantity = fractionToNumber(quantityAfterPrepMatch[2]);
    const name = canonicalizeShoppingSearchName(
      `${quantityAfterPrepMatch[1]} ${quantityAfterPrepMatch[3].trim()}`
    );

    if (quantity !== undefined && name) {
      return {
        name, quantity, quantityMin: quantity, quantityMax: quantity,
        quantityDisplay: formatParsedNumber(quantityAfterPrepMatch[2]),
        unit: "pcs", searchName: name,
      };
    }
  }

  // Do not interpret percentages such as "5% fat beef mince" as "5 pieces".
  const countRangeMatch = cleaned.match(new RegExp(
    "^" + RANGE_PATTERN + "\\s+(?!%)(.+)$", "i"
  ));

  if (countRangeMatch) {
    const min = fractionToNumber(countRangeMatch[1]);
    const max = fractionToNumber(countRangeMatch[2]);
    const name = canonicalizeShoppingSearchName(countRangeMatch[3].trim());

    if (min !== undefined && max !== undefined && name) {
      return {
        name, quantity: min, quantityMin: min, quantityMax: max,
        quantityDisplay: `${formatParsedNumber(countRangeMatch[1])}–${formatParsedNumber(countRangeMatch[2])}`,
        unit: "pcs", searchName: name,
      };
    }
  }

  const countMatch = cleaned.match(new RegExp("^(" + NUMBER_PATTERN + ")\\s+(?!%)(.+)$", "i"));
  if (countMatch) {
    const quantity = fractionToNumber(countMatch[1]);
    const name = canonicalizeShoppingSearchName(countMatch[2].trim());

    if (quantity !== undefined && name) {
      return {
        name, quantity, quantityMin: quantity, quantityMax: quantity,
        quantityDisplay: formatParsedNumber(countMatch[1]), unit: "pcs", searchName: name
      };
    }
  }

  const searchName = canonicalizeShoppingSearchName(cleaned);
  return { name: searchName, searchName };
};

export function getShoppingSearchName(name: string, quantity?: number, unit?: string): string {
  return parseShoppingIngredient(name).searchName || name.trim();
}
