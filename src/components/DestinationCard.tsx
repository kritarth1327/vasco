import type { Destination } from "@/lib/destinations";
import { getDestinationImage } from "@/lib/destinations";
import { MapPin } from "lucide-react";

export function DestinationCard({ d, onClick }: { d: Destination; onClick?: () => void }) {
  const image = getDestinationImage(d.slug);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl border border-border bg-card text-left transition hover:shadow-md hover:-translate-y-0.5 duration-300"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
        {image ? (
          <img
            src={image}
            alt={d.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${d.hue} text-5xl`}>
            <span className="drop-shadow-sm">{d.emoji}</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-900 backdrop-blur">
          {d.region}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="text-base font-semibold leading-tight">{d.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/80">
            <MapPin className="h-3 w-3" /> {d.country}
          </p>
        </div>
      </div>
      <div className="p-4">
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{d.tagline}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {d.categories.slice(0, 2).map((c) => (
            <span
              key={c}
              className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
