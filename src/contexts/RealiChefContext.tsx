
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
  applyRecipeUpdate?: (recipe: any) => void;
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

    setPageContext(prev => ({ ...prev, page }));
  }, [location.pathname]);

  // Load chat history when user is authenticated
  useEffect(() => {
    if (user && messages.length === 0) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('realichef_chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const chatMessages: ChatMessage[] = data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        page_context: msg.page_context
      }));

      console.log('🔍 Loaded chat history:', chatMessages.length, 'messages');
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
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

  const updatePageContext = useCallback((data: any) => {
    setPageContext(prev => {
      // Only update if the data has actually changed
      if (JSON.stringify(prev.data) === JSON.stringify(data)) {
        return prev;
      }
      console.log('📝 RealiChef: Updating page context', { page: prev.page, data });
      return { ...prev, data };
    });
  }, []);

  const applyRecipeUpdate = (recipe: any) => {
    if (pageContext.data?.onRecipeUpdate) {
      pageContext.data.onRecipeUpdate(recipe);
    }
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
      isLoadingHistory,
      applyRecipeUpdate
    }}>
      {children}
    </RealiChefContext.Provider>
  );
};
