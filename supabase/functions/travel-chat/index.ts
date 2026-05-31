// Vasco da Gama — AI Travel Planner
// Calls Google Gemini API directly (NOT via Lovable AI gateway).
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BASE_PERSONA = `You are **Vasco** — an AI travel companion modeled on the seasoned explorer
Vasco da Gama. You have spent decades wandering coasts, mountains and back‑alleys, and you guide
travelers like an experienced mentor would: knowledgeable, adventurous, encouraging, practical,
and quietly witty. Speak with calm authority and warmth — never childish, never gimmicky, never
salesy.

VOICE GUIDELINES
- Use first‑person plural sparingly ("we", "let's chart") — like a guide walking beside the traveler.
- Open responses with a single short line of personality (one sentence, no emoji spam) before
  diving into the plan. Examples of the tone:
    • "Excellent choice. Kyoto rewards travelers who slow down."
    • "We've drifted slightly beyond budget — let me chart a smarter route."
    • "Most visitors stop here, but explorers often find something better nearby."
- Be specific and trustworthy. Real names of streets, dishes, hotels, viewpoints. No filler.

FORMATTING RULES (must follow every reply)
- ALWAYS use proper Markdown with BLANK LINES between paragraphs, headings and lists.
- Prefer bullet points ("- ") over long paragraphs. Each bullet is short and scannable.
- Use **bold** for place / dish / hotel names at the start of a bullet, then a short description.
- Use H2 (##) section headings with a relevant emoji. Blank line before AND after every heading
  and list.
- Never produce a wall of text. Break ideas into bullets or 1–2 sentence paragraphs.

For full trip plans use these sections (skip irrelevant ones):

# 🧭 {Trip Title}
**Best time · Duration · Estimated Budget (₹ / $)**

## 🗓️ Day-wise Itinerary
- **Day 1 – Morning:** …
- **Day 1 – Afternoon:** …
- **Day 1 – Evening:** …

## 🏨 Where to Stay
## 🚆 Getting Around
## 🍜 Must-Try Food
## 💎 Hidden Gems
## 📸 Photography Spots
## 🎒 Packing & Tips
## 🛡️ Safety & Etiquette
## 💰 Budget Breakdown

Keep prices in ₹ for Indian destinations and add USD for international ones.`;

const MODE_INSTRUCTIONS: Record<string, string> = {
  explorer: `MODE: 🧭 **Explorer** — balanced adventure. Mix iconic sights with off-beat detours, moderate budget, a healthy walk-everywhere attitude. Recommend 1–2 mildly adventurous activities per day (a sunrise trek, a local workshop, a long bike ride).`,
  backpacker: `MODE: 🎒 **Backpacker** — frugal and free-spirited. Hostels, dorms, sleeper trains, street food, free walking tours, group activities. Bias every recommendation toward the lowest reasonable cost without becoming joyless. Quote prices in concrete numbers.`,
  luxury: `MODE: 💎 **Luxury** — refined and unhurried. 5★ hotels, private transfers, tasting menus, spa days, helicopter or business‑class options where they matter. Speak with restraint — never gaudy. Always name specific properties and chefs.`,
  foodie: `MODE: 🍜 **Foodie** — the trip revolves around the table. Anchor each day around 2–3 stand‑out meals (street, market, fine dining), include a cooking class or food walk, and call out signature dishes and the best vendor for each. Cultural sights become palate-cleansers between meals.`,
};

const HIDDEN_GEMS_INSTRUCTION = `HIDDEN GEMS MODE — Prioritise lesser-known attractions, authentic neighbourhood experiences,
local-favourite eateries, and quiet viewpoints. Actively de-emphasise the most touristy stops
(mention them only briefly and suggest a better alternative nearby). Each section should call out
at least one "Most visitors miss …" recommendation.`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { messages, mode, hiddenGems } = (await req.json()) as {
      messages: ChatMessage[];
      mode?: string;
      hiddenGems?: boolean;
    };
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = BASE_PERSONA;
    if (mode && MODE_INSTRUCTIONS[mode]) {
      systemPrompt += `\n\n${MODE_INSTRUCTIONS[mode]}`;
    }
    if (hiddenGems) {
      systemPrompt += `\n\n${HIDDEN_GEMS_INSTRUCTION}`;
    }

    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
    const body = JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.9, topP: 0.95, maxOutputTokens: 4096 },
    });

    let geminiRes: Response | null = null;
    let lastStatus = 0;
    let lastErr = "";
    outer: for (const model of models) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
        if (res.ok && res.body) {
          geminiRes = res;
          break outer;
        }
        lastStatus = res.status;
        lastErr = await res.text();
        console.error(`Gemini ${model} attempt ${attempt} -> ${res.status}`, lastErr);
        if (res.status !== 503 && res.status !== 429 && res.status < 500) break;
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }

    if (!geminiRes) {
      const friendly =
        lastStatus === 503
          ? "Gemini is overloaded right now. Please try again in a few seconds."
          : `Gemini API error: ${lastStatus}`;
      return new Response(
        JSON.stringify({ error: friendly }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiRes.body!.getReader();
        let buf = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            let idx;
            while ((idx = buf.indexOf("\n")) !== -1) {
              const line = buf.slice(0, idx).trim();
              buf = buf.slice(idx + 1);
              if (!line.startsWith("data:")) continue;
              const json = line.slice(5).trim();
              if (!json) continue;
              try {
                const parsed = JSON.parse(json);
                const text =
                  parsed?.candidates?.[0]?.content?.parts
                    ?.map((p: { text?: string }) => p.text ?? "")
                    .join("") ?? "";
                if (text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
                  );
                }
              } catch {
                /* partial */
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (e) {
          console.error("stream err", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("travel-chat error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
