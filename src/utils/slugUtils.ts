
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
 * Ensures slug uniqueness by appending a minimal number if needed
 * Now uses a more elegant approach with smaller increments
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  // Only add a number if absolutely necessary, and start with 2
  let counter = 2;
  let slug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  
  return slug;
}

/**
 * Alternative approach: try variations before adding numbers
 */
export function generateUniqueSlug(title: string, existingSlugs: string[]): string {
  const baseSlug = generateSlug(title);
  
  // First try the base slug
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  // Try some variations before adding numbers
  const variations = [
    `${baseSlug}-recipe`,
    `${baseSlug}-dish`,
  ];
  
  for (const variation of variations) {
    if (!existingSlugs.includes(variation)) {
      return variation;
    }
  }
  
  // Fall back to the numbered approach
  return ensureUniqueSlug(baseSlug, existingSlugs);
}
