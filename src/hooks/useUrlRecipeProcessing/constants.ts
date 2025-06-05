
// Remove the restrictive domain list - let the edge function handle parsing attempts
export const SUPPORTED_DOMAINS: string[] = [];

// We'll let the parse-recipe-ai edge function attempt to parse any website
// and only show errors if the actual parsing fails, not based on domain restrictions
