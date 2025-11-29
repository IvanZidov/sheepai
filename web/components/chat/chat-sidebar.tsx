"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  X, 
  Trash2, 
  Sparkles,
  ExternalLink,
  Loader2,
  ChevronRight
} from "lucide-react";
import { useChat } from "@/lib/chat";
import { useUserPreferences } from "@/lib/user-preferences";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export function ChatSidebar() {
  const {
    messages,
    isOpen,
    isLoading,
    streamingContent,
    sendMessage,
    clearMessages,
    toggleChat,
    closeChat,
  } = useChat();

  const { categoryFilter, regionFilter, technologyFilter } = useUserPreferences();
  
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeChat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeChat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const hasActiveFilters = categoryFilter.length > 0 || regionFilter.length > 0 || technologyFilter.length > 0;

  // Toggle button (always visible)
  const toggleButton = (
    <Button
      onClick={toggleChat}
      className={cn(
        "fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-xl z-50 transition-all duration-300",
        isOpen 
          ? "bg-muted hover:bg-muted/80 text-foreground translate-x-[-420px]" 
          : "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-emerald-500/30"
      )}
    >
      {isOpen ? <ChevronRight className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
    </Button>
  );

  // Sidebar panel
  const sidebarPanel = isOpen && typeof document !== "undefined" && createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] lg:hidden"
        onClick={closeChat}
      />
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-[420px] max-w-[90vw] bg-card border-l border-border shadow-2xl z-[9999]",
          "flex flex-col",
          "animate-in slide-in-from-right duration-300"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-muted/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Bot className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">SheepAI Assistant</h2>
              <p className="text-[10px] text-muted-foreground">
                {hasActiveFilters ? "Filtered context active" : "Ask about security news"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearMessages}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeChat}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active filters indicator */}
        {hasActiveFilters && (
          <div className="px-4 py-2 border-b border-border bg-emerald-500/5">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span className="text-muted-foreground">Context:</span>
              <div className="flex flex-wrap gap-1">
                {categoryFilter.slice(0, 2).map(cat => (
                  <Badge key={cat} variant="secondary" className="text-[9px] px-1.5 h-4">
                    {cat}
                  </Badge>
                ))}
                {regionFilter.slice(0, 2).map(reg => (
                  <Badge key={reg} variant="outline" className="text-[9px] px-1.5 h-4">
                    {reg}
                  </Badge>
                ))}
                {(categoryFilter.length + regionFilter.length > 4) && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 h-4">
                    +{categoryFilter.length + regionFilter.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !streamingContent && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                <Bot className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-medium mb-2">Hi! I'm SheepAI</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ask me anything about the latest security news. I'll search through recent articles to answer your questions.
              </p>
              <div className="space-y-2 w-full max-w-xs">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Try asking:</p>
                {[
                  "What are the latest ransomware attacks?",
                  "Any critical vulnerabilities this week?",
                  "Summarize threats targeting US companies",
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="w-full text-left text-xs p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-emerald-500" />
                </div>
              )}
              
              <div
                className={cn(
                  "rounded-xl px-4 py-3 max-w-[85%]",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        code: ({ children }) => (
                          <code className="px-1 py-0.5 bg-background/50 rounded text-xs font-mono">
                            {children}
                          </code>
                        ),
                        a: ({ href, children }) => (
                          <a 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-500 hover:underline"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                
                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Sources</p>
                    <div className="space-y-1">
                      {message.sources.map((source) => (
                        <a
                          key={source.id}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-emerald-500 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="line-clamp-1">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
          ))}

          {/* Streaming message */}
          {streamingContent && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="rounded-xl px-4 py-3 max-w-[85%] bg-muted">
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown>{streamingContent}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !streamingContent && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="rounded-xl px-4 py-3 bg-muted">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching articles...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-muted/30">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about security news..."
              disabled={isLoading}
              className="bg-background border-border focus-visible:ring-emerald-500"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Powered by RAG • Searches your filtered articles
          </p>
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <>
      {toggleButton}
      {sidebarPanel}
    </>
  );
}

