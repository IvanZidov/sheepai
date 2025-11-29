import { useChatStore, getHistoryForContext, ChatMessage } from './chat-store';
import { useUserPreferences } from './user-preferences';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface ChatFilters {
  categories?: string[];
  technologies?: string[];
  regions?: string[];
  priority?: string[];
}

interface StreamEvent {
  type: 'metadata' | 'content' | 'error';
  content?: string;
  articles?: { id: string; title: string; url: string }[];
  error?: string;
}

/**
 * Send a chat message and stream the response
 */
export async function sendChatMessage(
  query: string,
  filters: ChatFilters,
  history: { role: 'user' | 'assistant'; content: string }[],
  onChunk: (chunk: string) => void,
  onComplete: (sources?: { id: string; title: string; url: string }[]) => void,
  onError: (error: string) => void
) {
  const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/chat-rag`;

  try {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        query,
        filters,
        history,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chat API error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let sources: { id: string; title: string; url: string }[] | undefined;
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const event: StreamEvent = JSON.parse(trimmed.slice(6));

          if (event.type === 'metadata' && event.articles) {
            sources = event.articles;
          } else if (event.type === 'content' && event.content) {
            onChunk(event.content);
          } else if (event.type === 'error') {
            onError(event.error || 'Unknown error');
            return;
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }

    onComplete(sources);
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Failed to send message');
  }
}

/**
 * Hook to use the chat functionality with the store
 */
export function useChat() {
  const {
    messages,
    isOpen,
    isLoading,
    streamingContent,
    addMessage,
    updateStreamingContent,
    finalizeAssistantMessage,
    clearMessages,
    toggleChat,
    openChat,
    closeChat,
    setLoading,
  } = useChatStore();

  const {
    categoryFilter,
    regionFilter,
    technologyFilter,
    priorityFilter,
  } = useUserPreferences();

  const sendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return;

    // Add user message
    addMessage({ role: 'user', content: query });
    setLoading(true);

    // Get current filters
    const filters: ChatFilters = {
      categories: categoryFilter.length > 0 ? categoryFilter : undefined,
      technologies: technologyFilter.length > 0 ? technologyFilter : undefined,
      regions: regionFilter.length > 0 ? regionFilter : undefined,
      priority: priorityFilter.length > 0 ? priorityFilter : undefined,
    };

    // Get conversation history (last 5 messages)
    const history = getHistoryForContext(messages, 5);

    await sendChatMessage(
      query,
      filters,
      history,
      (chunk) => updateStreamingContent(chunk),
      (sources) => finalizeAssistantMessage(sources),
      (error) => {
        console.error('Chat error:', error);
        addMessage({ 
          role: 'assistant', 
          content: `Sorry, I encountered an error: ${error}` 
        });
        setLoading(false);
      }
    );
  };

  return {
    messages,
    isOpen,
    isLoading,
    streamingContent,
    sendMessage,
    clearMessages,
    toggleChat,
    openChat,
    closeChat,
  };
}

