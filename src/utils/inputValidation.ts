
import { z } from 'zod';

// URL validation schema
export const urlSchema = z.string()
  .url('Invalid URL format')
  .min(1, 'URL is required')
  .max(2048, 'URL too long')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, 'Only HTTP and HTTPS URLs are allowed');

// Recipe text validation schema
export const recipeTextSchema = z.string()
  .min(10, 'Recipe text must be at least 10 characters')
  .max(50000, 'Recipe text too long')
  .refine((text) => {
    // Enhanced security checks for suspicious patterns
    const suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /expression\(/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<form[^>]*>/gi,
      /document\.cookie/gi,
      /localStorage/gi,
      /sessionStorage/gi
    ];
    return !suspiciousPatterns.some(pattern => pattern.test(text));
  }, 'Text contains suspicious content');

// AI prompt validation schema
export const aiPromptSchema = z.string()
  .min(5, 'Prompt must be at least 5 characters')
  .max(1000, 'Prompt too long')
  .refine((prompt) => {
    // Basic content filtering
    const blockedWords = ['ignore', 'system', 'prompt', 'instructions'];
    const lowerPrompt = prompt.toLowerCase();
    return !blockedWords.some(word => lowerPrompt.includes(`ignore ${word}`) || lowerPrompt.includes(`override ${word}`));
  }, 'Prompt contains blocked content');

// Recipe data validation schema
export const recipeDataSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  ingredients: z.array(z.string().max(500)).min(1).max(50),
  instructions: z.array(z.string().max(1000)).min(1).max(50),
  prepTime: z.number().min(0).max(1440), // Max 24 hours
  cookTime: z.number().min(0).max(1440),
  servings: z.number().min(1).max(100)
});

// Password strength validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .refine((password) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    return hasUpper && hasLower && hasNumber && hasSpecial;
  }, 'Password must contain uppercase, lowercase, number and special character');

// Validation helper functions
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' };
    }
    return { success: false, error: 'Unknown validation error' };
  }
};

// Rate limiting helper
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const userRequests = requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    return true;
  };
};
