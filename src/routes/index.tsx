import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Sparkles, Gem, Wallet, Map, Layers, Globe2, Backpack } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DestinationCard } from "@/components/DestinationCard";
import { DESTINATIONS } from "@/lib/destinations";
import { TRAVEL_MODES } from "@/lib/travel-modes";
import heroImg from "@/assets/hero-mountains.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const featured = DESTINATIONS.filter((d) =>
    ["kashmir", "kerala", "leh-ladakh", "jaipur", "goa", "japan", "switzerland", "greece"].includes(d.slug),
  );
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Himalayan valley at golden hour"
          width={1920}
          height={1280}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/35 to-background" />
        <div className="mx-auto max-w-6xl px-6 pb-28 pt-28 md:pb-40 md:pt-36">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur">
            <Sparkles className="h-3 w-3" /> Inspired by the spirit of discovery
          </div>
          <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-7xl">
            Discover the world beyond the obvious.
          </h1>
          <p className="mt-5 max-w-xl text-balance text-base text-white/85 md:text-lg">
            Inspired by the spirit of Vasco da Gama, Vasco helps you uncover hidden gems, build personalized itineraries, plan smarter budgets, and discover unforgettable experiences across India and the world.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-900 shadow-lg shadow-black/20 transition hover:bg-white/90"
            >
              Chat with Vasco <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/15"
            >
              Plan by budget
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4 text-white/90 sm:grid-cols-4">
            {[
              { k: "Personalized Itineraries", v: "Tailored to your travel style" },
              { k: "Hidden Gems", v: "Beyond the tourist trail" },
              { k: "Budget Planning", v: "Smart spending, richer experiences" },
              { k: "PDF Travel Guides", v: "Take your journey anywhere" },
            ].map((s) => (
              <div key={s.k} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="text-sm font-semibold text-white">{s.k}</div>
                <div className="mt-0.5 text-xs text-white/60">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEET VASCO */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1fr,1.4fr] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Compass className="h-3 w-3" /> Meet Vasco
            </div>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Your AI companion for the road less taken.
            </h2>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            Inspired by the legendary explorer Vasco da Gama, Vasco is your AI travel companion.
            From hidden gems and personalized itineraries to budget-conscious adventures,
            Vasco helps travelers discover more than just destinations.
          </p>
        </div>
      </section>

      {/* TRAVEL MODES */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Travel modes</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Four ways to journey. One companion.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Pick the mode that fits your trip — Vasco reshapes every recommendation around it.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { emoji: "🧭", label: "Explorer", desc: "Discover hidden gems and authentic local experiences." },
            { emoji: "🎒", label: "Backpacker", desc: "Maximize experiences while staying budget-conscious." },
            { emoji: "✨", label: "Luxury", desc: "Premium stays, curated experiences, and comfort-first journeys." },
            { emoji: "🍜", label: "Foodie", desc: "Explore destinations through local cuisine and food culture." },
          ].map((m) => (
            <Link
              key={m.label}
              to="/plan"
              className="group rounded-xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-md"
            >
              <div className="text-3xl">{m.emoji}</div>
              <div className="mt-4 text-base font-semibold">{m.label}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-foreground/70 transition group-hover:text-foreground">
                Plan in this mode <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
        <span className="hidden">{TRAVEL_MODES.length}</span>
      </section>

      {/* FEATURES */}
      <section>
        <div className="mx-auto max-w-6xl px-6 pb-20">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Why Vasco</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              An explorer's toolkit for every journey.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { i: Compass, t: "Explorer personality", d: "A seasoned travel mentor in your pocket — curious, practical, occasionally witty." },
              { i: Gem, t: "Hidden gems discovery", d: "Quiet viewpoints, neighbourhood cafés, and local rituals beyond the tourist trail." },
              { i: Wallet, t: "Budget planning", d: "Every itinerary respects your wallet — with a clear breakdown of where it goes." },
              { i: Map, t: "Personalized itineraries", d: "Day-by-day plans built around your pace, interests, and travel style." },
              { i: Layers, t: "Travel modes", d: "Explorer, Backpacker, Luxury or Foodie — Vasco adapts to how you wander." },
              { i: Globe2, t: "India & global destinations", d: "From Spiti to Santorini, with local insight wherever you go." },
            ].map((f) => (
              <div key={f.t} className="rounded-xl border border-border bg-card p-6 transition hover:shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <f.i className="h-4 w-4 text-foreground" />
                </div>
                <div className="mt-4 text-sm font-semibold">{f.t}</div>
                <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.d}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <Backpack className="h-3.5 w-3.5" />
            Plus a built-in packing checklist for every journey.
          </div>
        </div>
      </section>

      {/* FEATURED DESTINATIONS */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Curated journeys</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Featured destinations
            </h2>
          </div>
          <Link to="/explore" className="hidden text-sm font-medium text-foreground hover:underline md:inline-flex">
            View all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((d) => (
            <Link key={d.slug} to="/chat" search={{ q: `Plan a trip to ${d.name}` } as never}>
              <DestinationCard d={d} />
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">How it works</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              From spark to itinerary in three steps.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Tell Vasco", d: "Share your dream — destination, dates, budget or just a vibe." },
              { n: "02", t: "Get a plan", d: "Receive a clean day-by-day itinerary with stays, food and gems." },
              { n: "03", t: "Refine & save", d: "Chat to adjust the pace, swap days, save for later." },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-border bg-card p-6">
                <div className="text-xs font-mono text-muted-foreground">{s.n}</div>
                <div className="mt-3 text-lg font-semibold">{s.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>




      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-foreground p-10 text-background md:p-16">
          <Compass className="mb-5 h-7 w-7 opacity-70" />
          <h3 className="max-w-2xl text-balance text-3xl font-semibold leading-tight md:text-5xl">
            Where will your curiosity take you?
          </h3>
          <p className="mt-4 max-w-xl text-sm text-background/70 md:text-base">
            Tell Vasco your dream destination and get a personalized itinerary with budget,
            stays, food and hidden gems — in seconds.
          </p>
          <Link
            to="/chat"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground transition hover:opacity-90"
          >
            Chat with Vasco <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            <span className="font-semibold text-foreground">Vasco da Gama</span>
            <span>· Your explorer's compass</span>
          </div>
          <div className="flex gap-5">
            <Link to="/explore" className="hover:text-foreground">Explore</Link>
            <Link to="/chat" className="hover:text-foreground">Chat</Link>
            <Link to="/saved" className="hover:text-foreground">Saved</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
