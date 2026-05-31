export type TravelMode = "explorer" | "backpacker" | "luxury" | "foodie";

export const TRAVEL_MODES: { id: TravelMode; label: string; emoji: string; blurb: string }[] = [
  { id: "explorer", label: "Explorer", emoji: "🧭", blurb: "Balanced adventure" },
  { id: "backpacker", label: "Backpacker", emoji: "🎒", blurb: "Light on the wallet" },
  { id: "luxury", label: "Luxury", emoji: "💎", blurb: "Refined & unhurried" },
  { id: "foodie", label: "Foodie", emoji: "🍜", blurb: "Plan around the table" },
];
