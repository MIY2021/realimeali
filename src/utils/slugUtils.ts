
/**
 * Generates a URL-friendly slug from a recipe title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Remove special characters and replace with hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces and multiple hyphens with single hyphen
    .replace(/[\s-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Ensures slug uniqueness by trying descriptive variations before numbers
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  // Try descriptive variations first
  const variations = [
    `${baseSlug}-recipe`,
    `${baseSlug}-dish`,
    `${baseSlug}-meal`,
    `${baseSlug}-special`,
    `${baseSlug}-homemade`,
    `${baseSlug}-classic`,
    `${baseSlug}-delicious`,
    `${baseSlug}-easy`,
    `${baseSlug}-quick`,
    `${baseSlug}-favorite`
  ];
  
  for (const variation of variations) {
    if (!existingSlugs.includes(variation)) {
      return variation;
    }
  }
  
  // Only as last resort, use numbers starting with 2
  let counter = 2;
  let slug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  
  return slug;
}

/**
 * Generates a unique slug from a title, trying variations before numbers
 */
export function generateUniqueSlug(title: string, existingSlugs: string[]): string {
  const baseSlug = generateSlug(title);
  return ensureUniqueSlug(baseSlug, existingSlugs);
}
