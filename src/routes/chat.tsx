import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Mic, Copy, Check, Bookmark, Loader2, Compass, FileDown, Gem } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { SUGGESTED_PROMPTS } from "@/lib/destinations";
import { TRAVEL_MODES, type TravelMode } from "@/lib/travel-modes";
import { exportItineraryPDF } from "@/lib/pdf-export";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type Msg = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/chat")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) ?? "",
    mode: (s.mode as string) ?? "",
  }),
  component: ChatPage,
});

function ChatPage() {
  const { q, mode: initialMode } = Route.useSearch();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<TravelMode>(
    (TRAVEL_MODES.find((m) => m.id === initialMode)?.id as TravelMode) ?? "explorer",
  );
  const [hiddenGems, setHiddenGems] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (q && messages.length === 0) {
      void send(q);
      navigate({ to: "/chat", search: { q: "", mode: "" } as never, replace: true });
    }
  }, [q]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content }, { role: "assistant", content: "" }];
    setMessages(next);
    setLoading(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/travel-chat`;

  const resp = await fetch(url, {
    method: "POST",
    signal: ctrl.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
    },
        body: JSON.stringify({
          mode,
          hiddenGems,
          messages: next
            .slice(0, -1)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.text().catch(() => "");
        throw new Error(err || `Request failed (${resp.status})`);
      }

      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let assistantText = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(data);
            if (p.text) {
              assistantText += p.text;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            }
          } catch { /* partial */ }
        }
      }

      if (user && assistantText) {
        try {
          const { data: conv } = await supabase
            .from("conversations")
            .insert({ user_id: user.id, title: content.slice(0, 60) })
            .select("id")
            .single();
          const convId = conv?.id ?? null;
          if (convId) {
            await supabase.from("messages").insert([
              { conversation_id: convId, user_id: user.id, role: "user", content },
              { conversation_id: convId, user_id: user.id, role: "assistant", content: assistantText },
            ]);
          }
        } catch (e) { console.warn("persist failed", e); }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
      setMessages((prev) => prev.slice(0, -2));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function startVoice() {
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition; SpeechRecognition?: new () => SpeechRecognition })
      .SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input not supported in this browser"); return; }
    const r = new SR();
    r.lang = "en-IN";
    r.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript;
      setInput((v) => (v ? `${v} ${text}` : text));
    };
    r.onerror = () => toast.error("Voice input failed");
    r.start();
    toast.info("🎤 Listening…");
  }

  const empty = messages.length === 0;
  const activeMode = TRAVEL_MODES.find((m) => m.id === mode)!;

  return (
    <div className="flex min-h-screen flex-col bg-travel-radial">
      <Navbar />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-44 pt-6">
        {empty ? (
          <EmptyState
            onPick={(p) => send(p)}
            mode={mode}
            setMode={setMode}
            hiddenGems={hiddenGems}
            setHiddenGems={setHiddenGems}
          />
        ) : (
          <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto pr-1">
            <div className="flex flex-col gap-5 pb-8">
              {messages.map((m, i) => (
                <Bubble key={i} msg={m} streaming={loading && i === messages.length - 1 && m.role === "assistant"} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky input */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-gradient-to-t from-background via-background/95 to-background/0 pb-4 pt-3 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4">
          {/* Mode + hidden gems row (always visible) */}
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {TRAVEL_MODES.map((m) => {
              const active = m.id === mode;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                  title={m.blurb}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setHiddenGems((v) => !v)}
              className={`ml-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
                hiddenGems
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
              title="Prioritise lesser-known spots"
            >
              <Gem className="h-3 w-3" /> Hidden gems {hiddenGems ? "on" : "off"}
            </button>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="glass flex items-end gap-2 rounded-2xl p-2 shadow-lg"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder={`Ask Vasco anything — ${activeMode.label.toLowerCase()} mode`}
              className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={startVoice}
              className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-secondary"
              aria-label="Voice input"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
          <div className="mt-2 text-center text-[11px] text-muted-foreground">
            Vasco is your AI travel companion · Itineraries are AI-generated, verify before booking.
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  onPick,
  mode,
  setMode,
  hiddenGems,
  setHiddenGems,
}: {
  onPick: (p: string) => void;
  mode: TravelMode;
  setMode: (m: TravelMode) => void;
  hiddenGems: boolean;
  setHiddenGems: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-border bg-card"
      >
        <Compass className="h-6 w-6 text-foreground" />
      </motion.div>
      <h1 className="text-2xl font-semibold md:text-3xl">Where to next, traveler?</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        I'm Vasco — your AI travel companion. Pick a travel style, then tell me where you'd like to wander.
      </p>

      {/* Mode picker */}
      <div className="mt-6 grid w-full max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
        {TRAVEL_MODES.map((m) => {
          const active = m.id === mode;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`group rounded-xl border p-3 text-left transition ${
                active
                  ? "border-foreground bg-card shadow-sm"
                  : "border-border bg-card/50 hover:border-foreground/40 hover:bg-card"
              }`}
            >
              <div className="text-lg">{m.emoji}</div>
              <div className="mt-1 text-sm font-medium">{m.label}</div>
              <div className="text-[11px] text-muted-foreground">{m.blurb}</div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setHiddenGems(!hiddenGems)}
        className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
          hiddenGems
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground hover:text-foreground"
        }`}
      >
        <Gem className="h-3.5 w-3.5" /> Hidden gems {hiddenGems ? "on" : "off"}
      </button>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-left text-sm hover:bg-secondary"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>{p}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Bubble({ msg, streaming }: { msg: Msg; streaming?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const isUser = msg.role === "user";

  async function copy() {
    await navigator.clipboard.writeText(msg.content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }
  async function save() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sign in to save trips"); return; }
    const title = (msg.content.match(/^#\s+(.+)$/m)?.[1] ?? "Saved trip").slice(0, 80);
    const { error } = await supabase.from("saved_trips").insert({
      user_id: user.id, title, content: msg.content,
    });
    if (error) toast.error(error.message); else { setSaved(true); toast.success("Trip saved"); }
  }
  function downloadPDF() {
    const title = (msg.content.match(/^#\s+(.+)$/m)?.[1] ?? "Vasco itinerary").slice(0, 80);
    exportItineraryPDF(title, msg.content);
    toast.success("PDF downloaded");
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div className={`group max-w-[90%] rounded-lg text-sm ${
          isUser
            ? "bg-primary px-4 py-3 text-primary-foreground"
            : "border border-border bg-card px-5 py-5 md:px-6 md:py-6"
        }`}>

          {isUser ? (
            <div className="whitespace-pre-wrap">{msg.content}</div>
          ) : (
            <>
              <div className="prose prose-sm max-w-none leading-relaxed dark:prose-invert
                prose-headings:font-semibold prose-headings:tracking-tight
                prose-h1:mt-2 prose-h1:mb-4 prose-h1:text-2xl
                prose-h2:mt-7 prose-h2:mb-3 prose-h2:text-lg prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-base
                prose-p:my-4 prose-p:leading-[1.75]
                prose-ul:my-4 prose-ul:space-y-3 prose-ul:pl-1
                prose-ol:my-4 prose-ol:space-y-3
                prose-li:my-0 prose-li:leading-[1.7] prose-li:pl-1
                prose-li:marker:text-primary
                prose-strong:text-foreground prose-strong:font-semibold
                prose-hr:my-6 prose-hr:border-border
                [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown>{msg.content || "…"}</ReactMarkdown>
              </div>
              {streaming && <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse rounded bg-foreground/40" />}
              {!streaming && msg.content && (
                <div className="mt-3 flex flex-wrap gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={copy} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary">
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                  </button>
                  <button onClick={save} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary">
                    <Bookmark className={`h-3 w-3 ${saved ? "fill-current" : ""}`} /> Save
                  </button>
                  <button onClick={downloadPDF} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary">
                    <FileDown className="h-3 w-3" /> PDF
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface SpeechRecognitionEvent { results: { [k: number  ]: { [k: number]: { transcript: string } } } }
interface SpeechRecognition { lang: string; onresult: (e: SpeechRecognitionEvent) => void; onerror: () => void; start: () => void }
