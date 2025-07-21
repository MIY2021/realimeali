
import { useState, useEffect, useRef } from 'react';
import { Minus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRealiChef } from '@/contexts/RealiChefContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ClearChatHistoryDialog } from './ClearChatHistoryDialog';
import { ChatHistoryIndicator } from './ChatHistoryIndicator';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  page_context?: any;
}

// Simple markdown renderer for bold text
const renderMarkdown = (text: string) => {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts = text.split(boldRegex);
  
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

export const RealiChef = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    pageContext, 
    isOpen, 
    setIsOpen, 
    messages, 
    addMessage, 
    convertTemporaryToPermanent,
    clearChatHistory, 
    isLoadingHistory,
    generateContextualWelcome,
    applyRecipeUpdate
  } = useRealiChef();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [clearHistoryDialogOpen, setClearHistoryDialogOpen] = useState(false);
  const [showHistoryIndicator, setShowHistoryIndicator] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [historyHidden, setHistoryHidden] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 RealiChef DEBUG: isOpen changed to:', isOpen);
    console.log('🔍 RealiChef DEBUG: Component re-rendered with isOpen:', isOpen);
  }, [isOpen]);

  // Scroll position tracking
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      setScrollPosition(scrollTop);
      
      // Check if we should show the history indicator - simplified logic
      if (messages.length > 1) {
        const lastMessage = messages[messages.length - 1];
        const hasWelcomeMessage = lastMessage.role === 'assistant' && isWelcomeMessage(lastMessage.content);
        
        if (hasWelcomeMessage) {
          // Show indicator when we have previous messages and welcome is at top
          const welcomeMessageElement = container.querySelector(`[data-message-index="${messages.length - 1}"]`);
          
          if (welcomeMessageElement) {
            const welcomeRect = welcomeMessageElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const welcomeTopPosition = welcomeRect.top - containerRect.top;
            
            // Show indicator when welcome message is positioned near the top (meaning history is hidden above)
            const isWelcomeAtTop = welcomeTopPosition >= 0 && welcomeTopPosition <= 30;
            setShowHistoryIndicator(isWelcomeAtTop);
          }
        } else {
          setShowHistoryIndicator(false);
        }
      } else {
        setShowHistoryIndicator(false);
      }
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

  // Scroll to bottom function - only for specific cases
  const scrollToBottomInstantly = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  // Position welcome message in the upper-middle area as shown in screenshot
  const scrollToShowWelcomeMessage = () => {
    if (messagesContainerRef.current && messages.length > 0) {
      const container = messagesContainerRef.current;
      const lastMessage = messages[messages.length - 1];
      
      // Check if the last message is a welcome message
      if (lastMessage.role === 'assistant' && isWelcomeMessage(lastMessage.content)) {
        setTimeout(() => {
          const containerHeight = container.clientHeight;
          
          if (messages.length > 1) {
            // Find the welcome message element
            const welcomeMessageElement = container.querySelector(`[data-message-index="${messages.length - 1}"]`);
            
            if (welcomeMessageElement) {
              const welcomeMessageOffsetTop = (welcomeMessageElement as HTMLElement).offsetTop;
              
              // Position welcome message at 20% down from top (as shown in screenshot)
              const targetScrollTop = welcomeMessageOffsetTop - (containerHeight * 0.2);
              
              container.scrollTo({
                top: Math.max(0, targetScrollTop),
                behavior: 'smooth'
              });
              
              console.log('🔍 Positioned welcome message in upper-middle area as per screenshot');
            }
          } else {
            // Only welcome message exists, position it naturally in upper area
            container.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
            
            console.log('🔍 Single welcome message positioned in upper area');
          }
          
          // Update scroll position and indicator visibility after scroll
          setTimeout(() => handleScroll(), 300);
        }, 100);
      }
    }
  };

  // Only scroll when loading indicator appears or chat first opens
  useEffect(() => {
    if (isLoading) {
      scrollToBottomInstantly();
    }
  }, [isLoading]);

  // Handle initial chat opening and welcome message positioning
  useEffect(() => {
    if (isOpen && !isLoadingHistory && user && messages.length > 0) {
      console.log('🔍 Chat opened, checking for welcome message positioning');
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && isWelcomeMessage(lastMessage.content)) {
        console.log('🔍 Welcome message detected, positioning for fresh chat experience');
        scrollToShowWelcomeMessage();
      } else {
        setTimeout(() => {
          scrollToBottomInstantly();
        }, 100);
      }
    }
  }, [isOpen, isLoadingHistory, user, messages]);

  // Watch for new welcome messages being added and hide history
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && isWelcomeMessage(lastMessage.content) && isOpen) {
        // Hide history when welcome message is generated
        if (messages.length > 1) {
          setHistoryHidden(true);
          setShowHistoryIndicator(true);
        }
        scrollToShowWelcomeMessage();
      }
    }
  }, [messages, isOpen]);

  // COMPLETELY REBUILT BUTTON CLICK HANDLER
  const handleChatButtonClick = (event: React.MouseEvent) => {
    console.log('🔍 DESKTOP BUTTON DEBUG: Click event triggered');
    console.log('🔍 DESKTOP BUTTON DEBUG: Event details:', {
      type: event.type,
      target: event.target,
      currentTarget: event.currentTarget
    });
    console.log('🔍 DESKTOP BUTTON DEBUG: Current isOpen state before click:', isOpen);
    
    // Prevent any event bubbling issues
    event.preventDefault();
    event.stopPropagation();
    
    try {
      console.log('🔍 DESKTOP BUTTON DEBUG: About to call setIsOpen with:', !isOpen);
      setIsOpen(!isOpen);
      console.log('🔍 DESKTOP BUTTON DEBUG: setIsOpen called successfully');
      
    } catch (error) {
      console.error('🔍 DESKTOP BUTTON DEBUG: Error in click handler:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Convert any temporary messages to permanent before adding user message
    convertTemporaryToPermanent();

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      page_context: pageContext
    };

    addMessage(userMessage);
    setInputMessage('');
    setIsLoading(true);
    setHasError(false);

    // Scroll for new user message
    setTimeout(() => {
      scrollToBottomInstantly();
    }, 50);

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
      setHasError(true);
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

  console.log('🔍 RealiChef RENDER DEBUG: isOpen =', isOpen, 'shouldShowButton =', !isOpen);

  return (
    <>
      {/* Floating Chef Hat Icon - FIXED FOR DESKTOP */}
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
                  isVisible={historyHidden && showHistoryIndicator}
                  onClick={() => setHistoryHidden(false)}
                />
                
                <div 
                  ref={messagesContainerRef} 
                  className="h-full overflow-y-auto bg-gray-50 p-4 space-y-3"
                  onScroll={handleScroll}
                >
                  {isLoadingHistory && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage"></div>
                    </div>
                  )}
                  
                  {messages.map((message, index) => {
                    // Hide previous messages when history is hidden and this is not the welcome message
                    if (historyHidden && index < messages.length - 1) {
                      return null;
                    }
                    
                    // Check if this message contains a recipe update
                    const recipeUpdate = message.role === 'assistant' ? parseRecipeUpdate(message.content) : null;
                    
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
