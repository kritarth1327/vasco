import type { TravelMode } from "./travel-modes";

export type Season = "summer" | "winter" | "monsoon" | "spring" | "autumn";

export const SEASONS: { id: Season; label: string }[] = [
  { id: "summer", label: "Summer" },
  { id: "spring", label: "Spring" },
  { id: "monsoon", label: "Monsoon / Rainy" },
  { id: "autumn", label: "Autumn" },
  { id: "winter", label: "Winter" },
];

export type PackingItem = { label: string; group: string };

const ESSENTIALS: string[] = [
  "Passport / Government ID",
  "Wallet, cards & local currency",
  "Phone + charger",
  "Power bank",
  "Universal travel adapter",
  "Reusable water bottle",
  "Daypack / sling bag",
  "Travel insurance & emergency contacts",
];

const TOILETRIES: string[] = [
  "Toothbrush & toothpaste",
  "Deodorant & basic skincare",
  "Sunscreen SPF 30+",
  "Personal medication & first-aid",
  "Hand sanitiser & wet wipes",
];

const SEASON_ITEMS: Record<Season, string[]> = {
  summer: ["Light breathable clothing", "Sunglasses", "Wide-brim hat", "After-sun lotion", "Cooling towel"],
  spring: ["Light jacket / hoodie", "Layered clothing", "Light scarf", "Comfortable walking shoes"],
  monsoon: ["Compact umbrella", "Waterproof jacket", "Quick-dry clothing", "Waterproof pouch for electronics", "Anti-fungal foot powder"],
  autumn: ["Mid-weight jacket", "Layered clothing", "Closed shoes", "Light gloves"],
  winter: ["Thermal innerwear", "Insulated jacket", "Beanie, gloves & wool socks", "Lip balm & moisturiser", "Hot-water flask"],
};

const MODE_ITEMS: Record<TravelMode, string[]> = {
  explorer: ["Trail-ready shoes", "Small flashlight / headlamp", "Notebook & pen", "Reusable cutlery"],
  backpacker: ["55–65L backpack with rain cover", "Quick-dry travel towel", "Padlock for hostels", "Multi-tool", "Laundry sheets", "Sleep mask & earplugs"],
  luxury: ["Smart-casual outfit", "Formal pair of shoes", "Quality fragrance", "Silk eye mask", "Premium travel pillow"],
  foodie: ["Compact food journal", "Wet wipes", "Antacids & probiotics", "Reusable cutlery", "Camera for plating shots"],
};

const DURATION_ITEMS = (days: number): string[] => {
  if (days <= 3) return ["1 pair of shoes", "2–3 outfits", "Small toiletry kit"];
  if (days <= 7) return ["2 pairs of shoes", "5–6 outfits + sleepwear", "Standard toiletry kit", "Laundry bag"];
  if (days <= 14) return ["2–3 pairs of shoes", "7 outfits + laundry plan", "Full toiletry kit", "Compact laundry detergent"];
  return ["Versatile capsule wardrobe", "Plan to do laundry weekly", "Compact detergent", "Vacuum-compress packing cubes"];
};

const REGION_HINTS = (destination: string): string[] => {
  const d = destination.toLowerCase();
  const out: string[] = [];
  if (/ladakh|spiti|leh|himalaya|nepal|bhutan|kashmir/.test(d)) out.push("Altitude sickness tablets (Diamox)", "Lip balm with SPF", "Heavy-duty gloves");
  if (/kerala|goa|maldives|bali|andaman|phuket|hawaii/.test(d)) out.push("Swimwear", "Reef-safe sunscreen", "Quick-dry sandals");
  if (/japan|korea|taiwan/.test(d)) out.push("IC transit card / Suica", "Pocket Wi-Fi or eSIM", "Small towel (public restrooms)");
  if (/europe|paris|rome|london|switzerland|greece|portugal|spain/.test(d)) out.push("EU plug adapter (Type C/F)", "Compact umbrella", "Crossbody anti-theft bag");
  if (/dubai|egypt|morocco|jordan|sahara/.test(d)) out.push("Modest layers", "Scarf for sun & mosques", "Lip & skin moisturiser");
  return out;
};

export function generatePackingList(opts: {
  destination: string;
  days: number;
  mode: TravelMode;
  season: Season;
}): PackingItem[] {
  const items: PackingItem[] = [];
  const push = (group: string, list: string[]) => list.forEach((label) => items.push({ group, label }));

  push("Essentials", ESSENTIALS);
  push("Toiletries & health", TOILETRIES);
  push(`For ${opts.season}`, SEASON_ITEMS[opts.season]);
  push(`${opts.mode[0].toUpperCase()}${opts.mode.slice(1)} mode`, MODE_ITEMS[opts.mode]);
  push(`${opts.days}-day trip`, DURATION_ITEMS(opts.days));
  const region = REGION_HINTS(opts.destination);
  if (region.length) push(`Tips for ${opts.destination}`, region);

  return items;
}
