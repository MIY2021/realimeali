
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

export const RealiChef = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    pageContext, 
    isOpen, 
    setIsOpen, 
    messages, 
    addMessage, 
    clearChatHistory, 
    isLoadingHistory,
    generateContextualWelcome
  } = useRealiChef();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [clearHistoryDialogOpen, setClearHistoryDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 RealiChef DEBUG: isOpen changed to:', isOpen);
    console.log('🔍 RealiChef DEBUG: Component re-rendered with isOpen:', isOpen);
  }, [isOpen]);

  // Scroll to bottom function - only for specific cases
  const scrollToBottomInstantly = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  // Scroll to position welcome message at top of viewport
  const scrollToShowWelcomeAtTop = () => {
    if (messagesContainerRef.current && messages.length > 0) {
      const container = messagesContainerRef.current;
      const lastMessage = messages[messages.length - 1];
      
      // Check if the last message is a welcome message
      if (lastMessage.role === 'assistant' && lastMessage.content.includes("Hi! I'm RealiChef")) {
        // Use a simple viewport-based approach
        setTimeout(() => {
          const containerHeight = container.clientHeight;
          const scrollHeight = container.scrollHeight;
          
          // Position the welcome message at the top of the visible viewport
          // This leaves all previous history above, accessible by scrolling up
          const targetScrollTop = scrollHeight - containerHeight;
          
          container.scrollTop = Math.max(0, targetScrollTop);
          console.log('🔍 Positioned welcome message at top of viewport. ContainerHeight:', containerHeight, 'ScrollHeight:', scrollHeight, 'TargetScrollTop:', targetScrollTop);
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
      if (lastMessage.role === 'assistant' && lastMessage.content.includes("Hi! I'm RealiChef")) {
        console.log('🔍 Welcome message detected, scrolling to show at top of viewport');
        scrollToShowWelcomeAtTop();
      } else {
        setTimeout(() => {
          scrollToBottomInstantly();
        }, 100);
      }
    }
  }, [isOpen, isLoadingHistory, user, messages]);

  // Watch for new welcome messages being added
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content.includes("Hi! I'm RealiChef") && isOpen) {
        scrollToShowWelcomeAtTop();
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

  const getContextualWelcomeMessage = (page: string) => {
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

  console.log('🔍 RealiChef RENDER DEBUG: isOpen =', isOpen, 'shouldShowButton =', !isOpen);

  return (
    <>
      {/* Floating Chef Hat Icon - COMPLETELY REBUILT */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 z-[60] md:bottom-16 md:right-8">
          <Button
            onClick={handleChatButtonClick}
            className={cn(
              "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
              "bg-gradient-to-r from-sage/40 to-terracotta/40 hover:from-sage/50 hover:to-terracotta/50",
              "pointer-events-auto cursor-pointer border-2 border-white/20"
            )}
            size="sm"
            type="button"
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
          </Button>
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

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-gray-50 min-h-0 p-4 space-y-3">
                  {isLoadingHistory && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage"></div>
                    </div>
                  )}
                  
                  {messages.map((message, index) => (
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
                      </div>
                    </div>
                  ))}
                  
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
