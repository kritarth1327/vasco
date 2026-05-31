import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Compass, Wallet, Calendar, MapPin, Loader2, FileDown, Bookmark } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { PackingChecklist } from "@/components/PackingChecklist";
import { TRAVEL_MODES, type TravelMode } from "@/lib/travel-modes";
import { exportItineraryPDF } from "@/lib/pdf-export";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Plan a Trip — Vasco AI Travel Companion" },
      { name: "description", content: "Tell Vasco your destination, days and budget — get a complete itinerary with a clear cost breakdown." },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(40000);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [mode, setMode] = useState<TravelMode>("explorer");
  const [hiddenGems, setHiddenGems] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim()) { toast.error("Please enter a destination"); return; }
    setOutput("");
    setLoading(true);

    const sym = currency === "INR" ? "₹" : "$";
    const userPrompt = `Plan a ${days}-day trip to ${destination}.
Travel style: ${mode}.
Total budget: ${sym}${budget.toLocaleString()} (${currency}).
${hiddenGems ? "Prioritise hidden gems and authentic local experiences over typical tourist spots." : ""}

Important: include a **💰 Budget Breakdown** section with these line items as a markdown table or clear bullets:
- Accommodation
- Food
- Transportation
- Activities & entry fees
- Miscellaneous
- **Total projected cost** (must respect the budget; flag if tight)

Each line should have a concrete ${sym} figure and a one-line note.`;

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/travel-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          mode,
          hiddenGems,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });
      if (!resp.ok || !resp.body) throw new Error(`Request failed (${resp.status})`);

      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let text = "";
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
              text += p.text;
              setOutput(text);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function saveTrip() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sign in to save trips"); return; }
    const title = `${days}-day ${destination}`.slice(0, 80);
    const { error } = await supabase.from("saved_trips").insert({
      user_id: user.id, title, destination, content: output,
    });
    if (error) toast.error(error.message); else toast.success("Trip saved");
  }

  function downloadPDF() {
    const title = `${days}-day trip to ${destination}`;
    exportItineraryPDF(title, output);
  }

  return (
    <div className="min-h-screen bg-travel-radial">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <Compass className="h-3 w-3" /> Budget-aware planner
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Chart a journey, on your budget.</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Three inputs, one explorer-crafted itinerary — complete with where to stay, eat, move, and a clear cost breakdown.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[360px,1fr]">
          {/* FORM */}
          <form onSubmit={generate} className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <Field label="Destination" icon={MapPin}>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kerala, Kyoto, Lisbon"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                required
              />
            </Field>

            <Field label="Days" icon={Calendar}>
              <input
                type="number"
                min={1}
                max={60}
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </Field>

            <Field label="Budget" icon={Wallet}>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "INR" | "USD")}
                  className="rounded-md border border-border bg-background px-2 py-2 text-sm outline-none"
                >
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                </select>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={budget}
                  onChange={(e) => setBudget(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                />
              </div>
            </Field>

            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">Travel mode</div>
              <div className="grid grid-cols-2 gap-1.5">
                {TRAVEL_MODES.map((m) => {
                  const active = m.id === mode;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`rounded-md border px-2 py-1.5 text-left text-xs transition ${
                        active ? "border-foreground bg-secondary" : "border-border hover:border-foreground/40"
                      }`}
                    >
                      <span className="mr-1">{m.emoji}</span>{m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs">
              <input
                type="checkbox"
                checked={hiddenGems}
                onChange={(e) => setHiddenGems(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              <span>Prioritise hidden gems over tourist spots</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />}
              {loading ? "Charting your route…" : "Plan my trip"}
            </button>
          </form>

          {/* OUTPUT */}
          <div className="min-h-[400px] rounded-2xl border border-border bg-card p-6">
            {!output && !loading && (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <Compass className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Your itinerary will appear here.</p>
              </div>
            )}
            {loading && !output && (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <Loader2 className="mb-3 h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Vasco is charting your route…</p>
              </div>
            )}
            {output && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-4 flex flex-wrap gap-2 border-b border-border pb-3">
                  <button onClick={downloadPDF} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary">
                    <FileDown className="h-3.5 w-3.5" /> Download PDF
                  </button>
                  <button onClick={saveTrip} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary">
                    <Bookmark className="h-3.5 w-3.5" /> Save
                  </button>
                </div>
                <div className="prose prose-sm max-w-none leading-relaxed dark:prose-invert
                  prose-headings:font-semibold prose-headings:tracking-tight
                  prose-h1:mt-2 prose-h1:mb-4 prose-h1:text-2xl
                  prose-h2:mt-7 prose-h2:mb-3 prose-h2:text-lg prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                  prose-p:my-4 prose-p:leading-[1.75]
                  prose-ul:my-4 prose-ul:space-y-2
                  prose-li:my-0 prose-li:marker:text-primary
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-table:text-xs prose-th:text-left
                  [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{output}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <PackingChecklist initialDestination={destination} initialDays={days} initialMode={mode} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      {children}
    </div>
  );
}
