
import { useState, useEffect, useRef } from 'react';
import { Minus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRealiChef } from '@/contexts/RealiChefContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
  const { pageContext, isOpen, setIsOpen } = useRealiChef();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when chat is opened
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the chat UI is rendered before scrolling
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [isOpen]);

  // Welcome message based on page context
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = getWelcomeMessage(pageContext.page);
      setMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, pageContext.page, messages.length]);

  const getWelcomeMessage = (page: string) => {
    const welcomes = {
      'my-recipes': "👩‍🍳 Hey there! Looking for inspiration with your recipes? I can help with cooking tips, ingredient swaps, or suggest new recipes to try!",
      'meal-planner': "👩‍🍳 Need help filling in this week's meals? I've got tons of ideas—just let me know what you're craving or what you want to plan around!",
      'shopping-list': "👩‍🍳 Shopping list assistance at your service! Need help with ingredient substitutions, budget tips, or identifying items? I'm here to help!",
      'recipe-detail': "👩‍🍳 Looking at this recipe? I can help with ingredient swaps, cooking techniques, or suggest what to serve alongside it!",
      'find-recipes': "👩‍🍳 Ready to discover something delicious? I can help you find the perfect recipe based on your preferences or ingredients!",
      'default': "👩‍🍳 Hi! I'm RealiChef, your friendly cooking assistant. What can I help you cook up today?"
    };
    return welcomes[page as keyof typeof welcomes] || welcomes.default;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setHasError(false);

    try {
      // Get conversation history for context
      const conversationHistory = messages.map(msg => ({
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
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message to RealiChef:', error);
      setHasError(true);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "👩‍🍳 Oops! I had trouble processing that. Please try again in a moment!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
      <div className="fixed bottom-20 right-4 z-50 md:bottom-4">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
            "bg-gradient-to-r from-sage/70 to-terracotta/70 hover:from-sage/80 hover:to-terracotta/80",
            isOpen && "scale-95"
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

      {/* Chat Interface */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Container - Full screen on mobile, floating on desktop */}
          <div className={cn(
            "fixed z-50",
            "inset-4 md:bottom-36 md:right-4 md:w-80 md:bottom-20 md:inset-auto"
          )}>
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden h-full flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-sage to-terracotta p-4 text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/lovable-uploads/48f73020-608a-4375-a69f-2e7bc147e319.png" 
                      alt="Chef Hat"
                      className="h-5 w-5"
                    />
                    <span className="font-semibold">RealiChef</span>
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </div>
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

              {/* Messages - Flexible height */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-0">
                {messages.map((message, index) => (
                  <div
                    key={index}
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

              {/* Input - Fixed at bottom */}
              <div className="p-4 border-t bg-white flex-shrink-0">
                <div className="flex gap-2">
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
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
