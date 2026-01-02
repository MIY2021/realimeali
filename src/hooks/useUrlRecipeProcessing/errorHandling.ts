
import { useToast } from "@/hooks/use-toast";

export const handleProcessingError = (error: any, toast: any) => {
  console.error('Error processing recipe:', error);
  
  // Handle specific error types
  const message = error?.message || error?.toString() || 'Unknown error occurred';
  
  let title = "Import Failed";
  let description = "Failed to import recipe from website.";
  let helpText = "";

  if (message.includes('Resource unavailable') || message.includes('busy')) {
    title = "Sorry, service is busy";
    description = "The AI service is currently processing many requests.";
    helpText = "Please try again in a few moments, or import the recipe text manually using the 'Paste Recipe Text' tab.";
  } else if (message.includes('timeout') || message.includes('timed out')) {
    title = "Sorry, the website took too long";
    description = "We couldn't access the website in time.";
    helpText = "Please try importing the recipe text manually using the 'Paste Recipe Text' tab instead.";
  } else if (message.includes('Could not extract content') || message.includes('Failed to fetch')) {
    title = "Sorry, we couldn't access this website";
    description = "We weren't able to extract the recipe content.";
    helpText = "Please try importing the recipe text manually using the 'Paste Recipe Text' tab instead.";
  } else if (message.includes('rate limit') || message.includes('429')) {
    title = "Sorry, too many requests";
    description = "You've made too many import attempts recently.";
    helpText = "Please wait a few minutes before trying again, or import the recipe text manually using the 'Paste Recipe Text' tab.";
  } else if (message.includes('No recipe data could be extracted')) {
    title = "Sorry, we couldn't import this recipe";
    description = "We weren't able to extract the recipe from this website.";
    helpText = "Please try importing the recipe text manually using the 'Paste Recipe Text' tab instead.";
  } else if (message.includes('Invalid URL') || message.includes('malformed')) {
    title = "Invalid Website URL";
    description = "The URL format is not correct.";
    helpText = "💡 Make sure to include 'https://' at the beginning and check for typos in the URL.";
  } else {
    title = "Sorry, import failed";
    description = `We couldn't import the recipe from this website.`;
    helpText = "Please try importing the recipe text manually using the 'Paste Recipe Text' tab instead.";
  }

  // Show the main error toast
  toast({
    title,
    description: `${description} ${helpText}`,
    variant: "destructive",
  });
};
