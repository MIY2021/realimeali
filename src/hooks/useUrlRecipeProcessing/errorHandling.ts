
import { useToast } from "@/hooks/use-toast";

export const handleProcessingError = (error: any, toast: any) => {
  console.error('Error processing recipe:', error);
  
  // Handle specific error types
  const message = error?.message || error?.toString() || 'Unknown error occurred';
  
  let title = "Import Failed";
  let description = "Failed to import recipe from website.";
  let helpText = "";

  if (message.includes('Resource unavailable') || message.includes('busy')) {
    title = "AI Service Temporarily Busy";
    description = "The AI service is currently processing many requests.";
    helpText = "💡 Try again in a few moments, or copy the recipe text and use the 'Paste Recipe Text' tab instead.";
  } else if (message.includes('timeout') || message.includes('timed out')) {
    title = "Website Timeout";
    description = "The website took too long to respond.";
    helpText = "💡 This often happens with slow websites. Try copying the recipe text manually and using the 'Paste Recipe Text' tab.";
  } else if (message.includes('Could not extract content') || message.includes('Failed to fetch')) {
    title = "Website Access Error";
    description = "Unable to access the website content.";
    helpText = "💡 This can happen if: 1) The website blocks automated access, 2) The URL is incorrect, 3) The page doesn't contain a recipe. Try copying the recipe text and using the 'Paste Recipe Text' tab.";
  } else if (message.includes('rate limit') || message.includes('429')) {
    title = "Too Many Requests";
    description = "You've made too many import attempts recently.";
    helpText = "💡 Please wait a few minutes before trying again, or use the 'Paste Recipe Text' tab for immediate results.";
  } else if (message.includes('No recipe data could be extracted')) {
    title = "No Recipe Found";
    description = "Couldn't find recipe content on this page.";
    helpText = "💡 Make sure the URL points to a recipe page (not a recipe list or homepage). Try copying the recipe text and using the 'Paste Recipe Text' tab.";
  } else if (message.includes('Invalid URL') || message.includes('malformed')) {
    title = "Invalid Website URL";
    description = "The URL format is not correct.";
    helpText = "💡 Make sure to include 'https://' at the beginning and check for typos in the URL.";
  } else {
    title = "Import Error";
    description = `Failed to import recipe: ${message}`;
    helpText = "💡 Try using the 'Paste Recipe Text' tab instead - copy the recipe text from the website and paste it there for reliable results.";
  }

  // Show the main error toast
  toast({
    title,
    description: `${description} ${helpText}`,
    variant: "destructive",
  });
};
