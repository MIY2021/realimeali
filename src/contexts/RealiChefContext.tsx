
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
  isTemporary?: boolean;
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
  addTemporaryMessage: (message: ChatMessage) => void;
  replaceTemporaryWelcome: (message: ChatMessage) => void;
  convertTemporaryToPermanent: () => void;
  clearChatHistory: () => Promise<void>;
  isLoadingHistory: boolean;
  generateContextualWelcome: (contextData?: any) => void;
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

export const RealiChefProvider = ({ children }: RealiChefProviderProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const [pageContext, setPageContext] = useState<PageContext>({ page: 'home' });
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

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

  // Check if we need to add a welcome message after history is loaded
  useEffect(() => {
    if (isOpen && hasLoadedHistory && user) {
      const shouldAddWelcome = shouldAddWelcomeMessage();
      if (shouldAddWelcome) {
        console.log('🔍 Adding welcome message - conditions met');
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
      } else {
        console.log('🔍 Skipping welcome message - not needed');
      }
    }
  }, [isOpen, hasLoadedHistory, user, pageContext]);

  // Function to determine if we should add a welcome message
  const shouldAddWelcomeMessage = (): boolean => {
    // If no messages at all, add welcome
    if (messages.length === 0) {
      console.log('🔍 Welcome needed: No messages in history');
      return true;
    }

    // Get the last message
    const lastMessage = messages[messages.length - 1];
    
    // If last message is from user, we can add welcome
    if (lastMessage.role === 'user') {
      console.log('🔍 Welcome needed: Last message was from user');
      return true;
    }

    // If last message is from assistant but NOT a welcome message, we can add welcome
    if (lastMessage.role === 'assistant' && !isWelcomeMessage(lastMessage.content)) {
      console.log('🔍 Welcome needed: Last assistant message was not a welcome');
      return true;
    }

    // If last message is already a welcome message from assistant, don't add another
    if (lastMessage.role === 'assistant' && isWelcomeMessage(lastMessage.content)) {
      console.log('🔍 Welcome NOT needed: Last message was already a welcome');
      return false;
    }

    return false;
  };

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

  const generateContextualWelcome = (contextData?: any) => {
    console.log('🔍 CONTEXT DEBUG: generateContextualWelcome called with contextData:', contextData);
    
    // Use provided context data or fall back to current pageContext.data
    const dataToUse = contextData || pageContext.data;
    const welcomeMessage = getContextualWelcomeMessage(pageContext.page, dataToUse);
    
    const welcomeChatMessage: ChatMessage = {
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
      page_context: { ...pageContext, data: dataToUse }
    };
    
    // Use replace method to ensure only one temporary welcome message exists
    replaceTemporaryWelcome(welcomeChatMessage);
    console.log('🔍 CONTEXT DEBUG: Contextual welcome message added as temporary');
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

      console.log('🔍 Loaded chat history:', chatMessages.length, 'messages');
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
    
    // Only save to database if it's not temporary
    if (user && !message.isTemporary) {
      saveChatMessage(messageWithTimestamp);
    }
  };

  const addTemporaryMessage = (message: ChatMessage) => {
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || new Date(),
      isTemporary: true
    };
    
    setMessages(prev => [...prev, messageWithTimestamp]);
  };

  const replaceTemporaryWelcome = (message: ChatMessage) => {
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || new Date(),
      isTemporary: true
    };
    
    setMessages(prev => {
      // Remove any existing temporary welcome messages
      const withoutTempWelcomes = prev.filter(msg => 
        !(msg.isTemporary && isWelcomeMessage(msg.content))
      );
      return [...withoutTempWelcomes, messageWithTimestamp];
    });
  };

  const convertTemporaryToPermanent = () => {
    if (!user) return;
    
    setMessages(prev => {
      const updated = prev.map(msg => {
        if (msg.isTemporary) {
          const permanentMessage = { ...msg, isTemporary: false };
          // Save the now-permanent message to database
          saveChatMessage(permanentMessage);
          return permanentMessage;
        }
        return msg;
      });
      return updated;
    });
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
    const previousContext = pageContext.data;
    setPageContext(prev => ({ ...prev, data }));
    
    // If chat is open and context has meaningfully changed, generate new welcome message
    if (isOpen && previousContext !== data) {
      console.log('🔍 CONTEXT DEBUG: Page context changed while chat is open, generating new welcome');
      setTimeout(() => {
        generateContextualWelcome(data);
      }, 100);
    }
  };

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
      setIsOpen: debugSetIsOpen,
      messages,
      addMessage,
      addTemporaryMessage,
      replaceTemporaryWelcome,
      convertTemporaryToPermanent,
      clearChatHistory,
      isLoadingHistory,
      generateContextualWelcome,
      applyRecipeUpdate
    }}>
      {children}
    </RealiChefContext.Provider>
  );
};
