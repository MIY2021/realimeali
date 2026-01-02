
import { useState, useEffect, useRef } from 'react';
import { Minus, Sparkles, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRealiChef } from '@/contexts/RealiChefContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ClearChatHistoryDialog } from './ClearChatHistoryDialog';
import { ChatHistoryIndicator } from './ChatHistoryIndicator';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  page_context?: any;
}

// Enhanced markdown renderer for bold text and headers
const renderMarkdown = (text: string) => {
  // First handle headers (### Header Text) - remove double colons
  const headerRegex = /^### (.+)$/gm;
  let processedText = text.replace(headerRegex, '**$1:**');
  
  // Fix double colons in specific sections (Ingredients::, Instructions::, Tips::, etc.)
  processedText = processedText.replace(/\*\*(Ingredients|Instructions|Tips|Gravy|Sides)::\*\*/g, '**$1:**');
  
  // Then handle bold text
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts = processedText.split(boldRegex);
  
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index}>{part}</strong>;
    }
    return part;
  });
};

// Helper function to detect if a message is a welcome message
const isWelcomeMessage = (content: string): boolean => {
  const welcomePatterns = [
    "Hi! I'm RealiChef",
    "I'm RealiChef, your cooking assistant",
    "I see you're looking at your recipes!",
    "Ready to plan some meals?",
    "Need help with your shopping list?",
    "Looking at a specific recipe?",
    "Let's find you something delicious!",
    "What can I help you with today?",
    "I can see you're editing a recipe!",
    "I'm here to help you create an amazing recipe!"
  ];
  
  return welcomePatterns.some(pattern => content.includes(pattern));
};

// Helper function to parse recipe updates from AI responses
const parseRecipeUpdate = (content: string): any | null => {
  if (!content.includes('MODIFIED RECIPE:') || !content.includes('Would you like me to update your recipe with these changes?')) {
    return null;
  }

  try {
    const recipeMatch = content.match(/\*\*MODIFIED RECIPE:\*\*(.*?)\*\*Ingredients:\*\*(.*?)\*\*Instructions:\*\*(.*?)(?=Would you like|$)/s);
    if (!recipeMatch) return null;

    const [, headerSection, ingredientsSection, instructionsSection] = recipeMatch;
    
    // Parse header fields
    const title = headerSection.match(/Title:\s*(.*)/)?.[1]?.trim();
    const servings = parseInt(headerSection.match(/Servings:\s*(\d+)/)?.[1] || '1');
    const prep_time = parseInt(headerSection.match(/Prep Time:\s*(\d+)/)?.[1] || '0');
    const cook_time = parseInt(headerSection.match(/Cook Time:\s*(\d+)/)?.[1] || '0');
    const meal_types = headerSection.match(/Meal Types:\s*(.*)/)?.[1]?.split(',').map(s => s.trim().toLowerCase()) || [];
    const cuisine_region = headerSection.match(/Cuisine:\s*(.*)/)?.[1]?.trim();
    
    const diet_lifestyle = headerSection.match(/Diet\/Lifestyle:\s*(.*)/)?.[1]?.split(',').map(s => s.trim().toLowerCase()).filter(s => s) || [];

    // Parse ingredients
    const ingredients = ingredientsSection
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0);

    // Parse instructions
    const instructions = instructionsSection
      .split(/\d+\.\s/)
      .map(inst => inst.trim())
      .filter(inst => inst.length > 0);

    return {
      title,
      ingredients,
      instructions,
      servings,
      prep_time,
      cook_time,
      meal_types,
      cuisine_region,
      
      diet_lifestyle
    };
  } catch (error) {
    console.error('Error parsing recipe update:', error);
    return null;
  }
};

// Helper function to parse complete recipes from AI responses
const parseFullRecipe = (content: string): any | null => {
  // Look for recipe patterns in AI responses
  const hasRecipePattern = 
    (content.includes('### Ingredients:') || content.includes('**Ingredients:**')) && 
    (content.includes('### Instructions:') || content.includes('**Instructions:**'));
  
  if (!hasRecipePattern) return null;

  try {
    // Better title extraction for recipe book style names
    let title = 'AI Generated Recipe';
    
    // Look for recipe names in various patterns - prioritize simple, clear names
    const titlePatterns = [
      // Look for "Sunday Roast Chicken", "Classic Beef Stew", etc.
      /(?:classic|perfect|traditional|easy|homemade|sunday|roast)\s+([^.!?\n]{10,40}?)(?:\s+(?:recipe|dish|dinner)|\.|!|\n)/i,
      // Look for direct food names "Chicken Tikka Masala", "Beef Bourguignon"
      /(?:^|\n)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})(?:\s*-|\s+is|\s+recipe|\.|!|\n)/,
      // Look for "Here's a Classic Beef Stew" patterns
      /here's\s+(?:a\s+)?(?:classic\s+|perfect\s+|easy\s+)?([^.!?\n]{10,40})(?:\s+recipe|\.|!)/i,
      // Look for cooking method + ingredient patterns
      /(?:roasted?|grilled?|baked?|pan[- ]?seared?|braised?)\s+([^.!?\n]{8,35})(?:\s+(?:recipe|dish)|\.|!|\n)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        title = match[1].trim();
        // Clean up common words that shouldn't be in title
        title = title.replace(/\b(recipe|dish|meal|dinner|lunch|with|that|this)\b/gi, '').trim();
        // Remove extra spaces
        title = title.replace(/\s+/g, ' ');
        if (title.length > 5 && title.length < 50) {
          break;
        }
      }
    }
    
    // If still generic, try to extract from ingredients (e.g., "Chicken" from chicken recipe)
    if (title === 'AI Generated Recipe') {
      const ingredientsSection = content.match(/(?:### Ingredients:|Ingredients:)\s*((?:(?!### |Instructions:|$).)*)/is);
      if (ingredientsSection) {
        const mainIngredient = ingredientsSection[1].match(/(?:whole\s+|boneless\s+)?([a-z]+(?:\s+[a-z]+)?)\s*(?:breast|thigh|fillet|steak|chop)/i);
        if (mainIngredient) {
          title = `Roasted ${mainIngredient[1].charAt(0).toUpperCase() + mainIngredient[1].slice(1)}`;
        }
      }
    }
    
    // Ensure proper capitalization for recipe book style
    title = title.replace(/\b\w+/g, word => {
      // Common small words that should stay lowercase in titles (except at start)
      const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'up', 'via', 'with'];
      const isFirstWord = title.split(' ')[0].toLowerCase() === word.toLowerCase();
      
      if (isFirstWord || !smallWords.includes(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    });
    
    // Extract ingredients section
    const ingredientsMatch = content.match(/(?:### Ingredients:|Ingredients:)\s*((?:(?!### |Instructions:|Tips:|$).)*)/is);
    const ingredients = ingredientsMatch ? 
      ingredientsMatch[1]
        .split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line.length > 0 && !line.includes('#')) : [];

    // Extract instructions section with better formatting
    const instructionsMatch = content.match(/(?:### Instructions:|Instructions:)\s*((?:(?!### |Tips:|$).)*)/is);
    const instructions = instructionsMatch ?
      instructionsMatch[1]
        .split(/\n+/)
        .map(line => {
          // Remove numbered prefixes (1., 2., etc.)
          let cleaned = line.replace(/^\d+\.\s*/, '').trim();
          // Remove any remaining leading dashes or bullets
          cleaned = cleaned.replace(/^[-•*]\s*/, '').trim();
          return cleaned;
        })
        .filter(line => line.length > 0 && !line.includes('#') && !line.match(/^-+$/)) : [];

    // Extract tips section
    const tipsMatch = content.match(/(?:### Tips:|Tips:)\s*((?:(?!### |$).)*)/is);
    let tipsText = '';
    if (tipsMatch) {
      tipsText = tipsMatch[1]
        .split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line.length > 0 && !line.includes('#'))
        .join(' ');
    }

    // Only return if we found meaningful content
    if (ingredients.length > 0 && instructions.length > 0) {
      // Determine meal types based on content and title
      const mealTypes = [];
      const lowerContent = content.toLowerCase();
      const lowerTitle = title.toLowerCase();
      
      if (lowerContent.includes('breakfast') || lowerContent.includes('morning') || lowerTitle.includes('breakfast')) {
        mealTypes.push('breakfast');
      }
      if (lowerContent.includes('lunch') || lowerContent.includes('brunch') || lowerTitle.includes('lunch')) {
        mealTypes.push('lunch');
      }
      if (lowerContent.includes('dinner') || lowerContent.includes('supper') || lowerContent.includes('evening') || 
          lowerTitle.includes('roast') || lowerTitle.includes('dinner')) {
        mealTypes.push('dinner');
      }
      if (lowerContent.includes('snack') || lowerContent.includes('appetizer') || lowerTitle.includes('snack')) {
        mealTypes.push('snack');
      }
      
      // Default to dinner if no meal type detected
      if (mealTypes.length === 0) mealTypes.push('dinner');
      
      // Determine cuisine based on ingredients/content with better mapping
      let cuisine = 'British'; // Default for roast dishes
      if (lowerContent.includes('pasta') || lowerContent.includes('italian') || lowerContent.includes('parmesan') || 
          lowerContent.includes('basil') || lowerContent.includes('mozzarella')) {
        cuisine = 'Italian';
      } else if (lowerContent.includes('curry') || lowerContent.includes('indian') || lowerContent.includes('garam masala') || 
                 lowerContent.includes('turmeric') || lowerContent.includes('tikka')) {
        cuisine = 'Indian';
      } else if (lowerContent.includes('chinese') || lowerContent.includes('soy sauce') || lowerContent.includes('ginger') || 
                 lowerContent.includes('stir fry')) {
        cuisine = 'Chinese';
      } else if (lowerContent.includes('mexican') || lowerContent.includes('cumin') || lowerContent.includes('chili') || 
                 lowerContent.includes('cilantro') || lowerContent.includes('lime')) {
        cuisine = 'Mexican';
      } else if (lowerContent.includes('french') || lowerContent.includes('herbs de provence') || lowerContent.includes('bourguignon')) {
        cuisine = 'French';
      } else if (lowerContent.includes('roast') || lowerContent.includes('yorkshire') || lowerContent.includes('sunday') || 
                 lowerTitle.includes('roast') || lowerTitle.includes('sunday')) {
        cuisine = 'British';
      } else if (lowerContent.includes('mediterranean') || lowerContent.includes('olive oil') || lowerContent.includes('herbs') || 
                 lowerContent.includes('greek') || lowerContent.includes('olives')) {
        cuisine = 'Mediterranean';
      } else if (lowerContent.includes('thai') || lowerContent.includes('coconut milk') || lowerContent.includes('fish sauce')) {
        cuisine = 'Thai';
      } else {
        cuisine = 'International';
      }
      
      
      // Determine diet/lifestyle based on ingredients
      const dietLifestyle = [];
      const hasAnimalProducts = lowerContent.includes('meat') || lowerContent.includes('chicken') || 
                              lowerContent.includes('beef') || lowerContent.includes('pork') || 
                              lowerContent.includes('fish') || lowerContent.includes('seafood');
      
      if (!hasAnimalProducts) {
        dietLifestyle.push('vegetarian');
      }
      if (lowerContent.includes('vegan') || (!hasAnimalProducts && !lowerContent.includes('cheese') && 
          !lowerContent.includes('butter') && !lowerContent.includes('cream') && !lowerContent.includes('egg'))) {
        dietLifestyle.push('vegan');
      }
      if (lowerContent.includes('gluten-free') || lowerContent.includes('gluten free')) {
        dietLifestyle.push('gluten-free');
      }
      if (lowerContent.includes('dairy-free') || lowerContent.includes('dairy free')) {
        dietLifestyle.push('dairy-free');
      }
      
      // Generate better description that includes tips if available
      const baseDescription = `A delicious ${cuisine.toLowerCase()} recipe for ${title.toLowerCase()}. This dish is perfect for ${mealTypes.join(' or ')} and brings together wonderful flavors that are sure to impress.`;
      const finalDescription = tipsText ? `${baseDescription}\n\nTop Tip: ${tipsText}` : baseDescription;
      
      return {
        title,
        ingredients,
        instructions,
        servings: 4,
        prep_time: 20,
        cook_time: 45,
        description: finalDescription,
        meal_types: mealTypes,
        cuisine_region: cuisine,
        
        diet_lifestyle: dietLifestyle,
        equipment: [],
        import_method: 'ai' as const
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing full recipe:', error);
    return null;
  }
};

export const RealiChef = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    pageContext, 
    isOpen, 
    setIsOpen, 
    messages, 
    addMessage, 
    clearChatHistory, 
    isLoadingHistory,
    applyRecipeUpdate
  } = useRealiChef();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clearHistoryDialogOpen, setClearHistoryDialogOpen] = useState(false);
  const [showHistoryIndicator, setShowHistoryIndicator] = useState(false);
  const [hasUnsavedWelcome, setHasUnsavedWelcome] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Generate contextual welcome message
  const getContextualWelcomeMessage = (page: string, contextData?: any) => {
    // Handle special recipe editing mode
    if (contextData?.mode === 'recipe-edit') {
      const recipe = contextData?.recipe;
      const hasContent = recipe?.title || recipe?.ingredients?.length > 0 || recipe?.instructions?.length > 0;
      
      if (hasContent) {
        return "👩‍🍳 I can see you're editing a recipe! How would you like me to help? I can suggest:\n• Ingredient quantity adjustments\n• Recipe simplification or enhancement\n• Dietary modifications (gluten-free, vegan, etc.)\n• Cooking technique improvements\n• Flavour enhancements\n\nWhat changes would you like to make?";
      } else {
        return "👩‍🍳 I'm here to help you create an amazing recipe! What would you like me to help you with? I can assist with ingredient suggestions, cooking methods, or recipe structure.";
      }
    }
    
    const welcomes = {
      'my-recipes': "👩‍🍳 I see you're looking at your recipes! I can help with cooking tips, ingredient swaps, or suggest new recipes to try.",
      'meal-planner': "👩‍🍳 Ready to plan some meals? I can help you decide what to cook this week!",
      'shopping-list': "👩‍🍳 Need help with your shopping list? I can assist with ingredient substitutions or shopping tips!",
      'recipe-detail': "👩‍🍳 Looking at a specific recipe? I can help with cooking techniques or ingredient alternatives.",
      'find-recipes': "👩‍🍳 Let's find you something delicious! What are you in the mood for?",
      'home': "👩‍🍳 Hi! I'm RealiChef, your cooking assistant. What can I help you with today?",
      'default': "👩‍🍳 Hi! I'm RealiChef, your cooking assistant. What can I help you with today?"
    };
    return welcomes[page as keyof typeof welcomes] || welcomes.default;
  };

  // Generate welcome message when chat opens
  const generateWelcomeMessage = () => {
    if (!user || !isFirstOpen) return;

    const shouldAddWelcome = 
      messages.length === 0 || 
      (messages.length > 0 && messages[messages.length - 1].role === 'user');

    if (shouldAddWelcome) {
      // Remove any existing unsaved welcome message
      if (hasUnsavedWelcome) {
        const filteredMessages = messages.filter(msg => 
          !(msg.role === 'assistant' && isWelcomeMessage(msg.content) && !msg.id)
        );
        // Update messages without the unsaved welcome
        // We'll add the new one below
      }

      const welcomeContent = getContextualWelcomeMessage(pageContext.page, pageContext.data);
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date(),
        page_context: pageContext
      };

      addMessage(welcomeMessage);
      setHasUnsavedWelcome(true);
      console.log('🔍 Generated welcome message');
    }
  };

  // Handle scroll for history indicator
  const handleScroll = () => {
    if (messagesContainerRef.current && messages.length > 1) {
      const container = messagesContainerRef.current;
      const scrollTop = container.scrollTop;
      setShowHistoryIndicator(scrollTop > 50);
    } else {
      setShowHistoryIndicator(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Attach scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages]);

  // Handle chat opening
  useEffect(() => {
    if (isOpen && !isLoadingHistory && user) {
      if (isFirstOpen) {
        generateWelcomeMessage();
        setIsFirstOpen(false);
      }
      // Scroll to bottom after messages load
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, isLoadingHistory, user, isFirstOpen]);

  // Scroll to bottom for new messages
  useEffect(() => {
    if (isLoading || messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length, isLoading]);

  const handleChatButtonClick = () => {
    setIsOpen(true);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Save any unsaved welcome message when user sends first message
    if (hasUnsavedWelcome) {
      setHasUnsavedWelcome(false);
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      page_context: pageContext
    };

    addMessage(userMessage);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('realichef-chat', {
        body: {
          message: inputMessage,
          pageContext,
          conversationHistory
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || "👩‍🍳 Sorry, I had trouble with that. Could you try asking again?",
        timestamp: new Date(),
        page_context: pageContext
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('Error sending message to RealiChef:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "👩‍🍳 Oops! I had trouble processing that. Please try again in a moment!",
        timestamp: new Date(),
        page_context: pageContext
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory();
      setHasUnsavedWelcome(false);
      setIsFirstOpen(true);
      toast({
        title: "Chat history cleared",
        description: "Your chat history has been cleared successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear chat history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Interface */}
      {isOpen && (
        <>
          {/* Backdrop overlay - Only on mobile */}
          <div 
            className="fixed inset-0 bg-black/30 z-40 md:hidden animate-in fade-in-0 duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Container */}
          <div className={cn(
            "fixed z-50",
            "top-4 bottom-20 left-4 right-4 animate-in slide-in-from-bottom-full duration-300 ease-out",
            "md:bottom-24 md:right-8 md:w-80 md:left-auto md:h-96 md:top-auto md:inset-auto",
            "md:animate-in md:fade-in-0 md:scale-in-95 md:duration-200"
          )}>
            <div className="bg-white rounded-lg md:rounded-lg shadow-xl border border-gray-200 overflow-hidden h-full flex flex-col">
              {/* Header - Desktop only */}
              <div className="hidden md:block bg-gradient-to-r from-sage to-terracotta p-4 text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/lovable-uploads/48f73020-608a-4375-a69f-2e7bc147e319.png" 
                      alt="Chef Hat"
                      className="h-5 w-5"
                    />
                    <span className="font-semibold">RealiChef | AI Assistant</span>
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </div>
                   <div className="flex items-center gap-2">
                     {messages.length > 0 && (
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => setClearHistoryDialogOpen(true)}
                         className="text-white hover:bg-white/20 h-6 w-6 p-0"
                         title="Clear chat history"
                       >
                         <Trash2 className="h-3 w-3" />
                       </Button>
                     )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-white/20 h-6 w-6 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages with History Indicator */}
              <div className="relative flex-1 min-h-0">
                <ChatHistoryIndicator 
                  isVisible={showHistoryIndicator}
                />
                
                <div 
                  ref={messagesContainerRef} 
                  className="h-full overflow-y-auto bg-gray-50 p-4 space-y-3"
                >
                  {isLoadingHistory && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage"></div>
                    </div>
                  )}
                  
                  {messages.map((message, index) => {
                    // Check if this message contains a recipe update
                    const recipeUpdate = message.role === 'assistant' ? parseRecipeUpdate(message.content) : null;
                    // Check if this message contains a full recipe
                    const fullRecipe = message.role === 'assistant' ? parseFullRecipe(message.content) : null;
                    
                    return (
                      <div
                        key={message.id || index}
                        data-message-index={index}
                        className={cn(
                          "flex",
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed",
                            message.role === 'user'
                              ? 'bg-sage text-white'
                              : 'bg-white text-gray-800 shadow-sm border'
                          )}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {message.role === 'assistant' ? renderMarkdown(message.content) : message.content}
                          </div>
                          
                          {/* Show Apply Changes button for recipe updates */}
                          {recipeUpdate && applyRecipeUpdate && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Button
                                onClick={() => {
                                  applyRecipeUpdate(recipeUpdate);
                                  toast({
                                    title: "Recipe Updated",
                                    description: "Your recipe has been updated with the AI suggestions!",
                                  });
                                  setIsOpen(false); // Close chat after applying
                                }}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                ✓ Apply Changes
                              </Button>
                            </div>
                          )}
                          
                          {/* Show Add Recipe button for complete recipes */}
                          {fullRecipe && !recipeUpdate && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Button
                                 onClick={() => {
                                   // Navigate to create recipe page with pre-populated data
                                   const searchParams = new URLSearchParams({
                                     title: fullRecipe.title || '',
                                     ingredients: JSON.stringify(fullRecipe.ingredients || []),
                                     instructions: JSON.stringify(fullRecipe.instructions || []),
                                     servings: (fullRecipe.servings || 4).toString(),
                                     prep_time: (fullRecipe.prep_time || 15).toString(),
                                     cook_time: (fullRecipe.cook_time || 20).toString(),
                                     description: fullRecipe.description || '',
                                     meal_types: JSON.stringify(fullRecipe.meal_types || []),
                                     cuisine_region: fullRecipe.cuisine_region || '',
                                     // complexity_level removed
                                     diet_lifestyle: JSON.stringify(fullRecipe.diet_lifestyle || []),
                                     equipment: JSON.stringify(fullRecipe.equipment || []),
                                     import_method: 'ai',
                                     tab: 'manual'
                                   });
                                   navigate(`/create-recipe?${searchParams.toString()}`);
                                   setIsOpen(false); // Close chat after navigating
                                 }}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                              >
                                 <Plus className="h-3 w-3" />
                                 Save to My Recipes
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg px-4 py-3 text-sm shadow-sm border">
                        <div className="flex items-center gap-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-sage rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-white flex-shrink-0">
                <div className="flex gap-2 mb-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask RealiChef anything..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    size="sm"
                    className="bg-sage hover:bg-sage/90"
                  >
                    ➤
                  </Button>
                </div>

                {/* Mobile footer */}
                <div className="md:hidden flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <img 
                      src="/lovable-uploads/48f73020-608a-4375-a69f-2e7bc147e319.png" 
                      alt="Chef Hat"
                      className="h-3 w-3"
                    />
                    <span className="text-xs text-gray-500">RealiChef | AI Assistant</span>
                    <Sparkles className="h-3 w-3 text-yellow-400" />
                  </div>
                  <div className="flex items-center gap-1">
                     {messages.length > 0 && (
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => setClearHistoryDialogOpen(true)}
                         className="text-gray-500 hover:bg-gray-100 h-6 w-6 p-0"
                         title="Clear chat history"
                       >
                         <Trash2 className="h-3 w-3" />
                       </Button>
                     )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-gray-500 hover:bg-gray-100 h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      <ClearChatHistoryDialog
        open={clearHistoryDialogOpen}
        onOpenChange={setClearHistoryDialogOpen}
        onConfirm={handleClearHistory}
      />
    </>
  );
};
