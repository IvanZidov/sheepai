import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare, Send, Bot, User } from "lucide-react";
import { useState } from "react";

export function ShepherdChat() {
  const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([
    { role: 'bot', text: "Hello! I'm your CyberShepherd. Ask me anything about the latest threats." }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput("");
    
    // Mock Response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm analyzing the flock... Based on recent reports, this vulnerability affects Python 3.9+ environments using setuptools < 65.0. You should patch immediately." }]);
    }, 1000);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg shadow-emerald-500/20 bg-primary hover:bg-primary/90 z-50 text-primary-foreground">
          <MessageSquare className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] flex flex-col p-0 sm:w-[540px] bg-zinc-950 border-l border-border/40">
        <SheetHeader className="p-6 border-b border-border/40">
            <SheetTitle className="flex items-center gap-2 text-foreground">
                <Bot className="w-5 h-5 text-primary" />
                Shepherd Assistant
            </SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             {m.role === 'bot' && <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary" /></div>}
                             <div className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-zinc-800 text-zinc-100'}`}>
                                {m.text}
                             </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t border-border/40 bg-zinc-900/50">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <Input 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        placeholder="Ask about a threat..." 
                        className="bg-zinc-900 border-zinc-700 focus-visible:ring-primary" 
                    />
                    <Button type="submit" size="icon" variant="default">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

