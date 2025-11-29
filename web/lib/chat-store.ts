import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: {
    id: string;
    title: string;
    url: string;
  }[];
}

interface ChatState {
  // State
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  streamingContent: string;
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateStreamingContent: (content: string) => void;
  finalizeAssistantMessage: (sources?: ChatMessage['sources']) => void;
  clearMessages: () => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  setLoading: (loading: boolean) => void;
}

const MAX_MESSAGES = 20;

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: [],
  isOpen: false,
  isLoading: false,
  streamingContent: '',

  addMessage: (message) => set((state) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    
    // Keep only last MAX_MESSAGES
    const messages = [...state.messages, newMessage].slice(-MAX_MESSAGES);
    
    return { messages };
  }),

  updateStreamingContent: (content) => set((state) => ({
    streamingContent: state.streamingContent + content,
  })),

  finalizeAssistantMessage: (sources) => set((state) => {
    if (!state.streamingContent) return state;
    
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: state.streamingContent,
      timestamp: new Date(),
      sources,
    };
    
    const messages = [...state.messages, assistantMessage].slice(-MAX_MESSAGES);
    
    return {
      messages,
      streamingContent: '',
      isLoading: false,
    };
  }),

  clearMessages: () => set({ messages: [], streamingContent: '' }),

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  
  openChat: () => set({ isOpen: true }),
  
  closeChat: () => set({ isOpen: false }),

  setLoading: (loading) => set({ isLoading: loading, streamingContent: loading ? '' : '' }),
}));

// Helper to get last N messages for context
export function getHistoryForContext(messages: ChatMessage[], count: number = 5) {
  return messages.slice(-count).map(m => ({
    role: m.role,
    content: m.content,
  }));
}

