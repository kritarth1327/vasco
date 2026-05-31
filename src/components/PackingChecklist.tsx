import { useMemo, useState } from "react";
import { Backpack, Check, FileDown, RotateCcw } from "lucide-react";
import { generatePackingList, SEASONS, type Season } from "@/lib/packing";
import { TRAVEL_MODES, type TravelMode } from "@/lib/travel-modes";
import { exportItineraryPDF } from "@/lib/pdf-export";

export function PackingChecklist({
  initialDestination = "",
  initialDays = 5,
  initialMode = "explorer" as TravelMode,
}: {
  initialDestination?: string;
  initialDays?: number;
  initialMode?: TravelMode;
}) {
  const [destination, setDestination] = useState(initialDestination);
  const [days, setDays] = useState(initialDays);
  const [mode, setMode] = useState<TravelMode>(initialMode);
  const [season, setSeason] = useState<Season>("summer");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const items = useMemo(
    () => (destination.trim() ? generatePackingList({ destination, days, mode, season }) : []),
    [destination, days, mode, season],
  );
  const groups = useMemo(() => {
    const map = new Map<string, string[]>();
    items.forEach((i) => {
      if (!map.has(i.group)) map.set(i.group, []);
      map.get(i.group)!.push(i.label);
    });
    return Array.from(map.entries());
  }, [items]);

  const completed = items.filter((i) => checked[i.label]).length;

  function exportPDF() {
    if (!items.length) return;
    const md = `# Packing Checklist — ${destination}\n\n*${days}-day ${mode} journey · ${season}*\n\n` +
      groups.map(([g, list]) => `## ${g}\n\n${list.map((l) => `- [ ] ${l}`).join("\n")}`).join("\n\n");
    exportItineraryPDF(`Packing — ${destination}`, md);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Backpack className="h-4 w-4 text-foreground" />
        <h3 className="text-sm font-semibold">Packing checklist</h3>
        <span className="text-xs text-muted-foreground">— a quick explorer's kit</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Destination"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground sm:col-span-2"
        />
        <input
          type="number"
          min={1}
          max={60}
          value={days}
          onChange={(e) => setDays(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value as Season)}
          className="rounded-md border border-border bg-background px-2 py-2 text-sm outline-none"
        >
          {SEASONS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {TRAVEL_MODES.map((m) => {
          const active = m.id === mode;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                active ? "border-foreground bg-secondary" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="mr-1">{m.emoji}</span>{m.label}
            </button>
          );
        })}
      </div>

      {!destination.trim() ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-background/40 p-6 text-center text-sm text-muted-foreground">
          Enter a destination to generate your packing kit.
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-center justify-between border-b border-border pb-2">
            <div className="text-xs text-muted-foreground">
              {completed} / {items.length} packed
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChecked({})}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-secondary"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
              <button
                onClick={exportPDF}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-secondary"
              >
                <FileDown className="h-3 w-3" /> PDF
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {groups.map(([group, list]) => (
              <div key={group}>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {group}
                </div>
                <ul className="space-y-1.5">
                  {list.map((label) => {
                    const isOn = !!checked[label];
                    return (
                      <li key={label}>
                        <button
                          onClick={() => setChecked((c) => ({ ...c, [label]: !c[label] }))}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-secondary/60"
                        >
                          <span
                            className={`grid h-4 w-4 place-items-center rounded border ${
                              isOn ? "border-foreground bg-foreground text-background" : "border-border"
                            }`}
                          >
                            {isOn && <Check className="h-3 w-3" />}
                          </span>
                          <span className={isOn ? "text-muted-foreground line-through" : ""}>{label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
