
import { useState, useEffect, useRef } from 'react';
import { Minus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRealiChef } from '@/contexts/RealiChefContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  page_context?: any;
}

// Simple markdown renderer for bold text
const renderMarkdown = (text: string) => {
  // Replace **text** with <strong>text</strong>
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts = text.split(boldRegex);
  
  return parts.map((part, index) => {
    // Every odd index is the content inside **
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
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom function
  const scrollToBottomInstantly = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  // Only scroll when loading indicator appears
  useEffect(() => {
    if (isLoading) {
      scrollToBottomInstantly();
    }
  }, [isLoading]);

  // Handle chat opening - scroll once and show welcome message once
  useEffect(() => {
    if (isOpen && !isLoadingHistory && user && !hasShownWelcome) {
      // Scroll to bottom once when chat opens
      scrollToBottomInstantly();
      
      // Show welcome message once per session
      generateContextualWelcome();
      setHasShownWelcome(true);
    }
  }, [isOpen, isLoadingHistory, user, hasShownWelcome, generateContextualWelcome]);

  // Reset welcome flag when chat closes
  useEffect(() => {
    if (!isOpen) {
      setHasShownWelcome(false);
    }
  }, [isOpen]);

  // Handle chat button click
  const handleChatButtonClick = () => {
    setIsOpen(!isOpen);
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

  return (
    <>
      {/* Floating Chef Hat Icon - Hide when chat is open */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 z-[60] md:bottom-12 md:right-8">
          <Button
            onClick={handleChatButtonClick}
            className={cn(
              "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
              "bg-gradient-to-r from-sage/40 to-terracotta/40 hover:from-sage/50 hover:to-terracotta/50",
              "pointer-events-auto cursor-pointer"
            )}
            size="sm"
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
                  <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearHistory}
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-0">
                {isLoadingHistory && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage"></div>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <div
                    key={message.id || index}
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
                        onClick={handleClearHistory}
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
    </>
  );
};
