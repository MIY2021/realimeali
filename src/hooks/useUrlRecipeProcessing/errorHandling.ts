
import { useToast } from "@/hooks/use-toast";

export const handleProcessingError = (error: any, toast: any) => {
  console.error('Error processing recipe:', error);
  
  // Handle specific error types
  const message = error?.message || error?.toString() || 'Unknown error occurred';
  
  if (message.includes('Resource unavailable') || message.includes('busy')) {
    toast({
      title: "AI Service Busy",
      description: "The AI service is temporarily busy. Please try again in a moment.",
      variant: "destructive",
    });
  } else if (message.includes('timeout') || message.includes('timed out')) {
    toast({
      title: "Import Timeout",
      description: "Website took too long to process. Please try again.",
      variant: "destructive",
    });
  } else if (message.includes('Could not extract content') || message.includes('Failed to fetch')) {
    toast({
      title: "Website Access Error",
      description: "Could not access the website content. Please check the URL or try a different recipe website.",
      variant: "destructive",
    });
  } else if (message.includes('rate limit') || message.includes('429')) {
    toast({
      title: "Rate Limit",
      description: "Too many requests. Please wait a moment before trying again.",
      variant: "destructive",
    });
  } else {
    toast({
      title: "Import Failed",
      description: `Failed to import from website: ${message}. Please try again or use a different URL.`,
      variant: "destructive",
    });
  }
};
