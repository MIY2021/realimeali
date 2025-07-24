
// Content sanitization utilities
export const sanitizeHtml = (html: string): string => {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^>]*/gi, '');
  sanitized = sanitized.replace(/\sjavascript:\s*[^>]*/gi, '');
  sanitized = sanitized.replace(/\svbscript:\s*[^>]*/gi, '');
  sanitized = sanitized.replace(/\sexpression\s*\(/gi, '');
  
  // Remove style tags
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove dangerous tags
  sanitized = sanitized.replace(/<(iframe|object|embed|form|meta|link)[^>]*>.*?<\/\1>/gi, '');
  sanitized = sanitized.replace(/<(iframe|object|embed|form|meta|link)[^>]*>/gi, '');
  
  // Remove references to sensitive browser APIs
  sanitized = sanitized.replace(/document\.cookie/gi, '');
  sanitized = sanitized.replace(/localStorage/gi, '');
  sanitized = sanitized.replace(/sessionStorage/gi, '');
  
  return sanitized.trim();
};

export const sanitizeText = (text: string): string => {
  // Remove potential XSS patterns from plain text
  let sanitized = text.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  sanitized = sanitized.replace(/expression\(/gi, '');
  sanitized = sanitized.replace(/document\.cookie/gi, '');
  sanitized = sanitized.replace(/localStorage/gi, '');
  sanitized = sanitized.replace(/sessionStorage/gi, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
};

export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    
    // Remove dangerous query parameters
    const dangerousParams = ['javascript', 'data', 'vbscript'];
    dangerousParams.forEach(param => {
      parsed.searchParams.delete(param);
    });
    
    return parsed.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
};

export const sanitizeRecipeData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
