
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  page_context?: any;
}

interface PageContext {
  page: string;
  data?: any;
}

interface RealiChefContextType {
  pageContext: PageContext;
  updatePageContext: (data: any) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearChatHistory: () => Promise<void>;
  isLoadingHistory: boolean;
}

const RealiChefContext = createContext<RealiChefContextType | undefined>(undefined);

export const useRealiChef = () => {
  const context = useContext(RealiChefContext);
  if (!context) {
    throw new Error('useRealiChef must be used within a RealiChefProvider');
  }
  return context;
};

interface RealiChefProviderProps {
  children: ReactNode;
}

export const RealiChefProvider = ({ children }: RealiChefProviderProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const [pageContext, setPageContext] = useState<PageContext>({ page: 'home' });
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

  // Update page context based on current route
  useEffect(() => {
    const path = location.pathname;
    let page = 'home';
    
    if (path.includes('/my-recipes')) {
      page = path.includes('/my-recipes/') ? 'recipe-detail' : 'my-recipes';
    } else if (path.includes('/meal-planner')) {
      page = 'meal-planner';
    } else if (path.includes('/shopping-list')) {
      page = 'shopping-list';
    } else if (path.includes('/find-recipes')) {
      page = 'find-recipes';
    }

    const previousPage = pageContext.page;
    setPageContext(prev => ({ ...prev, page }));

    // Add context change message if user has existing conversation and page changed significantly
    if (user && hasLoadedHistory && messages.length > 0 && previousPage !== page && previousPage !== 'home') {
      const contextChangeMessage: ChatMessage = {
        role: 'assistant',
        content: getPageChangeMessage(page),
        timestamp: new Date(),
        page_context: { page, previous_page: previousPage }
      };
      addMessage(contextChangeMessage);
    }
  }, [location.pathname, user, hasLoadedHistory, messages.length, pageContext.page]);

  // Load chat history when user is authenticated
  useEffect(() => {
    if (user && !hasLoadedHistory) {
      loadChatHistory();
    }
  }, [user, hasLoadedHistory]);

  const getPageChangeMessage = (page: string) => {
    const messages = {
      'my-recipes': "👩‍🍳 I see you're now looking at your recipes! I can help with cooking tips, ingredient swaps, or recipe inspiration.",
      'meal-planner': "👩‍🍳 Now helping with meal planning! Let me know what you'd like to plan for this week.",
      'shopping-list': "👩‍🍳 I'm here to help with your shopping list! Need help with ingredients or substitutions?",
      'recipe-detail': "👩‍🍳 Looking at a specific recipe? I can help with cooking techniques or ingredient alternatives.",
      'find-recipes': "👩‍🍳 Ready to discover new recipes? I can help you find something perfect!",
      'default': "👩‍🍳 I'm here to help with whatever you're cooking up!"
    };
    return messages[page as keyof typeof messages] || messages.default;
  };

  const loadChatHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('realichef_chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(100); // Load last 100 messages

      if (error) throw error;

      const chatMessages: ChatMessage[] = data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        page_context: msg.page_context
      }));

      setMessages(chatMessages);
      setHasLoadedHistory(true);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setHasLoadedHistory(true); // Still mark as loaded to prevent infinite loops
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveChatMessage = async (message: ChatMessage) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('realichef_chat_messages')
        .insert({
          user_id: user.id,
          role: message.role,
          content: message.content,
          page_context: message.page_context || pageContext
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const addMessage = (message: ChatMessage) => {
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || new Date()
    };
    
    setMessages(prev => [...prev, messageWithTimestamp]);
    
    // Save to database if user is authenticated
    if (user) {
      saveChatMessage(messageWithTimestamp);
    }
  };

  const clearChatHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('realichef_chat_messages')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  };

  const updatePageContext = (data: any) => {
    setPageContext(prev => ({ ...prev, data }));
  };

  return (
    <RealiChefContext.Provider value={{
      pageContext,
      updatePageContext,
      isOpen,
      setIsOpen,
      messages,
      addMessage,
      clearChatHistory,
      isLoadingHistory
    }}>
      {children}
    </RealiChefContext.Provider>
  );
};
