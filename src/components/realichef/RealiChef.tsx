
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
  // First handle headers (### Header Text)
  const headerRegex = /^### (.+)$/gm;
  let processedText = text.replace(headerRegex, '**$1:**');
  
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
    const complexity_level = headerSection.match(/Complexity:\s*(.*)/)?.[1]?.trim();
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
      complexity_level,
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
    // Try to extract title (look for recipe name at the beginning)
    const titleMatch = content.match(/^.*?(?:is a|recipe|classic|delicious)\s+(.+?)(?:\.|!|\n|Here's)/i) ||
                      content.match(/^.*?(?:Beans on toast|[A-Z][a-z\s]+(?:recipe|dish))[\s:]/i);
    let title = titleMatch ? titleMatch[0].replace(/is a|recipe|classic|delicious|Here's|[.:!]/gi, '').trim() : 'AI Generated Recipe';
    
    // Clean up title
    title = title.replace(/^.*?(?:🍳|👩‍🍳)\s*/, '').trim();
    
    // Extract ingredients section
    const ingredientsMatch = content.match(/(?:### Ingredients:|Ingredients:)\s*((?:(?!### |Instructions:|$).)*)/is);
    const ingredients = ingredientsMatch ? 
      ingredientsMatch[1]
        .split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line.length > 0 && !line.includes('#')) : [];

    // Extract instructions section
    const instructionsMatch = content.match(/(?:### Instructions:|Instructions:)\s*((?:(?!### |$).)*)/is);
    const instructions = instructionsMatch ?
      instructionsMatch[1]
        .split(/\n+/)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0 && !line.includes('#')) : [];

    // Only return if we found meaningful content
    if (ingredients.length > 0 && instructions.length > 0) {
      return {
        title,
        ingredients,
        instructions,
        servings: 4, // Default
        prep_time: 15, // Default
        cook_time: 20, // Default
        description: `A delicious recipe shared by AI Chef`,
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
        return "👩‍🍳 I can see you're editing a recipe! How would you like me to help? I can suggest:\n• Ingredient quantity adjustments\n• Recipe simplification or enhancement\n• Dietary modifications (gluten-free, vegan, etc.)\n• Cooking technique improvements\n• Flavor enhancements\n\nWhat changes would you like to make?";
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
      {/* Floating Chef Hat Icon */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 z-[60] md:bottom-16 md:right-8">
          <button
            onClick={handleChatButtonClick}
            className={cn(
              "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
              "bg-gradient-to-r from-sage/40 to-terracotta/40 hover:from-sage/50 hover:to-terracotta/50",
              "pointer-events-auto cursor-pointer border-2 border-white/20",
              "flex items-center justify-center"
            )}
            type="button"
            aria-label="Open RealiChef AI Assistant"
          >
            <div className="relative">
              <img 
                src="/lovable-uploads/48f73020-608a-4375-a69f-2e7bc147e319.png" 
                alt="Chef Hat"
                className="h-6 w-6 text-white"
              />
              <Sparkles 
                className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse" 
              />
            </div>
          </button>
        </div>
      )}

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
                                    import_method: 'ai'
                                  });
                                  navigate(`/create-recipe?${searchParams.toString()}`);
                                  setIsOpen(false); // Close chat after navigating
                                }}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                Add Recipe
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
