import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DestinationCard } from "@/components/DestinationCard";
import { CATEGORIES, DESTINATIONS } from "@/lib/destinations";

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
});

function ExplorePage() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [region, setRegion] = useState<"All" | "India" | "International">("All");

  const filtered = useMemo(() => {
    return DESTINATIONS.filter((d) => {
      if (region !== "All" && d.region !== region) return false;
      if (cat !== "All" && !d.categories.includes(cat)) return false;
      if (q && !`${d.name} ${d.country} ${d.tagline}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, cat, region]);

  return (
    <div className="min-h-screen bg-travel-radial">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold md:text-4xl">
            Explore <span className="text-gradient-travel">destinations</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Handpicked places across India and the world — tap any to ask Vasco for a plan.
          </p>
        </motion.div>

        {/* Search + region toggle */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="glass flex flex-1 items-center gap-2 rounded-xl px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Goa, Switzerland, beach…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="glass flex items-center gap-1 rounded-xl p-1">
            {(["All", "India", "International"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  region === r ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="scrollbar-thin mt-4 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
                cat === c
                  ? "border-transparent bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((d) => (
            <DestinationCard
              key={d.slug}
              d={d}
              onClick={() => nav({ to: "/chat", search: { q: `Plan a detailed trip to ${d.name}` } as never })}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="mt-12 text-center text-muted-foreground">No destinations match those filters.</div>
        )}
      </div>
    </div>
  );
}
