import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`;

export async function callAI(feature: string, prompt: string) {
  const { data, error } = await supabase.functions.invoke("ai-assist", {
    body: { feature, prompt },
  });
  if (error) {
    const msg = (error as any).message || "AI request failed";
    if (msg.includes("429")) toast.error("Rate limit reached. Please wait a moment.");
    else if (msg.includes("402")) toast.error("AI credits exhausted. Please add credits.");
    else toast.error(msg);
    throw error;
  }
  if ((data as any)?.error) {
    toast.error((data as any).error);
    throw new Error((data as any).error);
  }
  return (data as any).result;
}

export async function streamChat(
  messages: { role: string; content: string }[],
  onDelta: (chunk: string) => void
) {
  const resp = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ feature: "chat", messages }),
  });

  if (!resp.ok || !resp.body) {
    if (resp.status === 429) toast.error("Rate limit reached. Please wait.");
    else if (resp.status === 402) toast.error("AI credits exhausted.");
    else toast.error("Chat failed");
    throw new Error("Stream failed");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;

  while (!done) {
    const { done: d, value } = await reader.read();
    if (d) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
}
