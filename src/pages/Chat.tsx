import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Sparkles, User } from "lucide-react";
import { streamChat } from "@/lib/ai";
import { AIDisclaimer } from "@/components/AIDisclaimer";

interface Msg { role: "user" | "assistant"; content: string }

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    let acc = "";
    try {
      await streamChat(next, (chunk) => {
        acc += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m));
          }
          return [...prev, { role: "assistant", content: acc }];
        });
      });
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Chat Assistant</h1>
          <p className="text-sm text-muted-foreground">Ask anything about your workplace and tasks.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
              <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mb-3 shadow-glow">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <p className="font-medium text-foreground">How can I help you today?</p>
              <p className="text-sm mt-1">Try: "Help me prep for a 1:1 with my manager."</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && (
                    <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm whitespace-pre-wrap ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    {m.content || (
                      <span className="inline-flex gap-1">
                        <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" style={{ animationDelay: "0.2s" }} />
                        <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" style={{ animationDelay: "0.4s" }} />
                      </span>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-3 space-y-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Message FlowAI..."
              disabled={loading}
              maxLength={2000}
            />
            <Button onClick={send} disabled={loading || !input.trim()} className="gradient-primary">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <AIDisclaimer />
        </div>
      </Card>
    </div>
  );
}
