const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  email: `You are a professional email writer. Generate a polished email based on the user's request. Always respond with a JSON object using the provided tool.`,
  summarize: `You are a meeting notes analyst. Summarize the provided notes into structured sections. Always respond using the provided tool.`,
  planner: `You are an AI productivity coach. Build a prioritized schedule from the user's tasks. Always respond using the provided tool.`,
  research: `You are a research assistant. Analyze the provided content and return structured insights using the provided tool.`,
  chat: `You are a helpful workplace productivity assistant. Be concise, practical, and friendly. Use markdown formatting.`,
};

const TOOLS: Record<string, any> = {
  email: {
    name: "generate_email",
    description: "Generate a professional email",
    parameters: {
      type: "object",
      properties: {
        subject: { type: "string" },
        body: { type: "string" },
      },
      required: ["subject", "body"],
      additionalProperties: false,
    },
  },
  summarize: {
    name: "summarize_notes",
    description: "Summarize meeting notes",
    parameters: {
      type: "object",
      properties: {
        keyPoints: { type: "array", items: { type: "string" } },
        decisions: { type: "array", items: { type: "string" } },
        actionItems: {
          type: "array",
          items: {
            type: "object",
            properties: {
              task: { type: "string" },
              owner: { type: "string" },
              deadline: { type: "string" },
            },
            required: ["task", "owner", "deadline"],
          },
        },
      },
      required: ["keyPoints", "decisions", "actionItems"],
      additionalProperties: false,
    },
  },
  planner: {
    name: "create_schedule",
    description: "Create a prioritized schedule",
    parameters: {
      type: "object",
      properties: {
        schedule: {
          type: "array",
          items: {
            type: "object",
            properties: {
              time: { type: "string" },
              task: { type: "string" },
              priority: { type: "string", enum: ["high", "medium", "low"] },
              duration: { type: "string" },
            },
            required: ["time", "task", "priority", "duration"],
          },
        },
        tips: { type: "array", items: { type: "string" } },
      },
      required: ["schedule", "tips"],
      additionalProperties: false,
    },
  },
  research: {
    name: "research_analysis",
    description: "Analyze research content",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string" },
        keyInsights: { type: "array", items: { type: "string" } },
        recommendations: { type: "array", items: { type: "string" } },
        simplified: { type: "string" },
      },
      required: ["summary", "keyInsights", "recommendations", "simplified"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { feature, prompt, messages: chatMessages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const system = SYSTEM_PROMPTS[feature] ?? SYSTEM_PROMPTS.chat;
    const isChat = feature === "chat";

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages: isChat
        ? [{ role: "system", content: system }, ...(chatMessages ?? [])]
        : [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
    };

    if (isChat) {
      body.stream = true;
    } else {
      const tool = TOOLS[feature];
      body.tools = [{ type: "function", function: tool }];
      body.tool_choice = { type: "function", function: { name: tool.name } };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (response.status === 402)
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      const t = await response.text();
      console.error("Gateway error", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isChat) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : {};
    return new Response(JSON.stringify({ result: args }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assist error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
