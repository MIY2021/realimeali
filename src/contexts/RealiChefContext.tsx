
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
  generateContextualWelcome: () => void;
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
  const [hasShownWelcomeThisSession, setHasShownWelcomeThisSession] = useState(false);

  // DEBUG: Track isOpen state changes
  useEffect(() => {
    console.log('🔍 CONTEXT DEBUG: isOpen state changed to:', isOpen);
  }, [isOpen]);

  // DEBUG: Enhanced setIsOpen wrapper
  const debugSetIsOpen = (open: boolean) => {
    console.log('🔍 CONTEXT DEBUG: setIsOpen called with:', open);
    console.log('🔍 CONTEXT DEBUG: Current isOpen before update:', isOpen);
    try {
      setIsOpen(open);
      console.log('🔍 CONTEXT DEBUG: setIsOpen executed successfully');
    } catch (error) {
      console.error('🔍 CONTEXT DEBUG: Error in setIsOpen:', error);
    }
  };

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
    if (user && !hasLoadedHistory) {
      loadChatHistory();
    }
  }, [user, hasLoadedHistory]);

  // Add simple welcome message at start of each session
  useEffect(() => {
    if (isOpen && hasLoadedHistory && user && !hasShownWelcomeThisSession) {
      console.log('🔍 Adding welcome message for new session');
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: "👩‍🍳 Hi! I'm RealiChef, your cooking assistant. I'm here to help!",
        timestamp: new Date(),
        page_context: pageContext
      };
      
      // Add message to end in chronological order and save to database
      setMessages(prev => [...prev, welcomeMessage]);
      if (user) {
        saveChatMessage(welcomeMessage);
      }
      setHasShownWelcomeThisSession(true);
    }
  }, [isOpen, hasLoadedHistory, user, hasShownWelcomeThisSession]);

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

  const generateContextualWelcome = () => {
    console.log('🔍 CONTEXT DEBUG: generateContextualWelcome called');
    const welcomeMessage = getContextualWelcomeMessage(pageContext.page);
    const welcomeChatMessage: ChatMessage = {
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
      page_context: pageContext
    };
    
    addMessage(welcomeChatMessage);
    console.log('🔍 CONTEXT DEBUG: Welcome message added');
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
        .limit(100);

      if (error) throw error;

      const chatMessages: ChatMessage[] = data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        page_context: msg.page_context
      }));

      console.log('Loaded chat history:', chatMessages.length, 'messages');
      setMessages(chatMessages);
      setHasLoadedHistory(true);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setHasLoadedHistory(true);
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
      setHasShownWelcomeThisSession(false); // Reset welcome flag when clearing history
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
      setIsOpen: debugSetIsOpen,
      messages,
      addMessage,
      clearChatHistory,
      isLoadingHistory,
      generateContextualWelcome
    }}>
      {children}
    </RealiChefContext.Provider>
  );
};
