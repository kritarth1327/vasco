import goaImg from "@/assets/dest-goa.jpg";
import kashmirImg from "@/assets/dest-kashmir.jpg";
import jaipurImg from "@/assets/dest-jaipur.jpg";
import keralaImg from "@/assets/dest-kerala.jpg";
import ladakhImg from "@/assets/dest-ladakh.jpg";
import greeceImg from "@/assets/dest-greece.jpg";
import japanImg from "@/assets/dest-japan.jpg";
import switzerlandImg from "@/assets/dest-switzerland.jpg";
import maldivesImg from "@/assets/dest-maldives.jpg";
import andamanImg from "@/assets/dest-andaman.webp";
import baliImg from "@/assets/dest-bali.webp";
import coorgImg from "@/assets/dest-coorg.webp";
import darjeelingImg from "@/assets/dest-darjeeling.webp";
import delhiImg from "@/assets/dest-delhi.webp";
import dubaiImg from "@/assets/dest-dubai.webp";
import italyImg from "@/assets/dest-italy.webp";
import manaliImg from "@/assets/dest-manali.webp";
import meghalayaImg from "@/assets/dest-meghalaya.webp";
import mumbaiImg from "@/assets/dest-mumbai.webp";
import ootyImg from "@/assets/dest-ooty.webp";
import parisImg from "@/assets/dest-paris.webp";
import pondicherryImg from "@/assets/dest-pondicherry.webp";
import rishikeshImg from "@/assets/dest-rishikesh.webp";
import shimlaImg from "@/assets/dest-shimla.webp";
import sikkimImg from "@/assets/dest-sikkim.webp";
import singaporeImg from "@/assets/dest-singapore.webp";
import spitivalleyImg from "@/assets/dest-spiti valley.webp";
import thailandImg from "@/assets/dest-thailand.webp";
import udaipurImg from "@/assets/dest-udaipur.webp";
import varanasiImg from "@/assets/dest-varanasi.webp";



export type Destination = {
  slug: string;
  name: string;
  country: string;
  region: "India" | "International";
  categories: string[];
  tagline: string;
  emoji: string;
  hue: string; // gradient fallback
  image?: string;
};

const IMAGES: Record<string, string> = {
  goa: goaImg,
  kashmir: kashmirImg,
  jaipur: jaipurImg,
  kerala: keralaImg,
  "leh-ladakh": ladakhImg,
  greece: greeceImg,
  japan: japanImg,
  switzerland: switzerlandImg,
  maldives: maldivesImg,
  andaman: andamanImg,
  bali: baliImg,
  coorg: coorgImg,
  darjeeling: darjeelingImg,
  delhi: delhiImg,
  dubai: dubaiImg,
  italy: italyImg,
  manali: manaliImg,
  meghalaya: meghalayaImg,
  mumbai: mumbaiImg,
  ooty: ootyImg,
  paris: parisImg,
  pondicherry: pondicherryImg,
  rishikesh: rishikeshImg,
  shimla: shimlaImg,
  sikkim: sikkimImg,
  singapore: singaporeImg,
  spitivalley: spitivalleyImg,
  thailand: thailandImg,
  udaipur: udaipurImg,
  varanasi: varanasiImg
};

export const getDestinationImage = (slug: string): string | undefined => IMAGES[slug];

export const CATEGORIES = [
  "All",
  "Beaches",
  "Mountains",
  "Luxury",
  "Adventure",
  "Road Trips",
  "Backpacking",
  "Budget Trips",
  "Food Tours",
  "Honeymoon",
  "Spiritual",
  "Historical",
  "Solo Travel",
] as const;

export const DESTINATIONS: Destination[] = [
  // India
  { slug: "goa", name: "Goa", country: "India", region: "India", emoji: "🏖️", categories: ["Beaches","Backpacking","Honeymoon","Food Tours"], tagline: "Sun-soaked beaches, susegad vibes & Portuguese charm", hue: "from-orange-400 to-pink-500" },
  { slug: "kashmir", name: "Kashmir", country: "India", region: "India", emoji: "🏔️", categories: ["Mountains","Honeymoon","Luxury","Adventure"], tagline: "Heaven on earth — Dal Lake, Gulmarg & saffron valleys", hue: "from-sky-400 to-indigo-500" },
  { slug: "manali", name: "Manali", country: "India", region: "India", emoji: "🌲", categories: ["Mountains","Adventure","Backpacking","Road Trips"], tagline: "Hippie cafés, snowy peaks & Solang adventures", hue: "from-emerald-400 to-cyan-500" },
  { slug: "shimla", name: "Shimla", country: "India", region: "India", emoji: "🚂", categories: ["Mountains","Historical","Honeymoon"], tagline: "Colonial charm on the toy-train hills", hue: "from-rose-400 to-orange-400" },
  { slug: "leh-ladakh", name: "Leh-Ladakh", country: "India", region: "India", emoji: "🏍️", categories: ["Mountains","Adventure","Road Trips","Solo Travel"], tagline: "Moonscapes, monasteries & the legendary Khardung La", hue: "from-amber-400 to-rose-500" },
  { slug: "jaipur", name: "Jaipur", country: "India", region: "India", emoji: "🏰", categories: ["Historical","Luxury","Food Tours"], tagline: "The Pink City of forts, bazaars & royal palaces", hue: "from-pink-400 to-fuchsia-500" },
  { slug: "udaipur", name: "Udaipur", country: "India", region: "India", emoji: "🛶", categories: ["Luxury","Honeymoon","Historical"], tagline: "Lake palaces and Rajasthani romance", hue: "from-violet-400 to-indigo-500" },
  { slug: "kerala", name: "Kerala", country: "India", region: "India", emoji: "🌴", categories: ["Beaches","Honeymoon","Luxury","Spiritual"], tagline: "Backwaters, houseboats & God's own country", hue: "from-emerald-400 to-teal-500" },
  { slug: "rishikesh", name: "Rishikesh", country: "India", region: "India", emoji: "🧘", categories: ["Spiritual","Adventure","Backpacking"], tagline: "Yoga capital of the world on the Ganges", hue: "from-orange-400 to-amber-500" },
  { slug: "varanasi", name: "Varanasi", country: "India", region: "India", emoji: "🪔", categories: ["Spiritual","Historical","Food Tours"], tagline: "Eternal city of ghats, aarti & ancient soul", hue: "from-amber-500 to-red-500" },
  { slug: "meghalaya", name: "Meghalaya", country: "India", region: "India", emoji: "🌧️", categories: ["Mountains","Adventure","Backpacking"], tagline: "Living root bridges & cleanest village on earth", hue: "from-teal-400 to-green-500" },
  { slug: "sikkim", name: "Sikkim", country: "India", region: "India", emoji: "🏔️", categories: ["Mountains","Spiritual","Adventure"], tagline: "Kanchenjunga views & monastery trails", hue: "from-sky-400 to-emerald-500" },
  { slug: "andaman", name: "Andaman", country: "India", region: "India", emoji: "🐚", categories: ["Beaches","Honeymoon","Luxury","Adventure"], tagline: "Turquoise waters, coral reefs & Radhanagar sunsets", hue: "from-cyan-400 to-blue-500" },
  { slug: "pondicherry", name: "Pondicherry", country: "India", region: "India", emoji: "🌸", categories: ["Beaches","Backpacking","Honeymoon"], tagline: "French quarters, scooters & boho cafés", hue: "from-yellow-400 to-orange-500" },
  { slug: "coorg", name: "Coorg", country: "India", region: "India", emoji: "☕", categories: ["Mountains","Honeymoon","Food Tours"], tagline: "Coffee plantations of South India", hue: "from-green-500 to-emerald-600" },
  { slug: "darjeeling", name: "Darjeeling", country: "India", region: "India", emoji: "🍃", categories: ["Mountains","Historical","Honeymoon"], tagline: "Tea gardens with Himalayan sunrise", hue: "from-emerald-400 to-lime-500" },
  { slug: "spitivalley", name: "Spiti Valley", country: "India", region: "India", emoji: "🛣️", categories: ["Mountains","Road Trips","Adventure","Solo Travel"], tagline: "The middle land — cold desert, ancient gompas", hue: "from-orange-400 to-rose-500" },
  { slug: "ooty", name: "Ooty", country: "India", region: "India", emoji: "🌼", categories: ["Mountains","Honeymoon","Historical"], tagline: "Queen of the Nilgiris", hue: "from-pink-400 to-rose-500" },
  { slug: "mumbai", name: "Mumbai", country: "India", region: "India", emoji: "🌃", categories: ["Food Tours","Historical","Solo Travel"], tagline: "City of dreams, vada pav & Marine Drive", hue: "from-indigo-500 to-blue-600" },
  { slug: "delhi", name: "Delhi", country: "India", region: "India", emoji: "🕌", categories: ["Historical","Food Tours","Spiritual"], tagline: "Mughal monuments & Chandni Chowk chaos", hue: "from-red-400 to-orange-500" },
  // International
  { slug: "japan", name: "Japan", country: "Japan", region: "International", emoji: "🗼", categories: ["Luxury","Food Tours","Historical","Solo Travel"], tagline: "Where ancient temples meet neon futures", hue: "from-pink-400 to-rose-600" },
  { slug: "switzerland", name: "Switzerland", country: "Switzerland", region: "International", emoji: "🏔️", categories: ["Mountains","Luxury","Honeymoon"], tagline: "Alpine perfection — Jungfrau, Interlaken, Zermatt", hue: "from-sky-400 to-blue-600" },
  { slug: "paris", name: "Paris", country: "France", region: "International", emoji: "🗼", categories: ["Luxury","Honeymoon","Historical","Food Tours"], tagline: "The eternal city of light & love", hue: "from-rose-400 to-amber-500" },
  { slug: "bali", name: "Bali", country: "Indonesia", region: "International", emoji: "🌺", categories: ["Beaches","Honeymoon","Spiritual","Backpacking"], tagline: "Rice terraces, temples & Canggu sunsets", hue: "from-emerald-400 to-orange-400" },
  { slug: "dubai", name: "Dubai", country: "UAE", region: "International", emoji: "🌆", categories: ["Luxury","Food Tours","Adventure"], tagline: "Skyline of superlatives in the desert", hue: "from-amber-400 to-orange-600" },
  { slug: "thailand", name: "Thailand", country: "Thailand", region: "International", emoji: "🏝️", categories: ["Beaches","Backpacking","Food Tours","Budget Trips"], tagline: "Land of smiles, islands & street food", hue: "from-orange-400 to-pink-500" },
  { slug: "italy", name: "Italy", country: "Italy", region: "International", emoji: "🍝", categories: ["Food Tours","Historical","Honeymoon","Luxury"], tagline: "Pasta, piazzas & ruins under Tuscan sun", hue: "from-green-500 to-red-500" },
  { slug: "greece", name: "Greece", country: "Greece", region: "International", emoji: "🏛️", categories: ["Beaches","Honeymoon","Historical","Luxury"], tagline: "Santorini blues & Athenian myths", hue: "from-sky-400 to-blue-500" },
  { slug: "maldives", name: "Maldives", country: "Maldives", region: "International", emoji: "🐠", categories: ["Beaches","Honeymoon","Luxury"], tagline: "Overwater villas in turquoise paradise", hue: "from-cyan-400 to-teal-500" },
  { slug: "singapore", name: "Singapore", country: "Singapore", region: "International", emoji: "🦁", categories: ["Food Tours","Luxury","Solo Travel"], tagline: "Future city of gardens & hawker stalls", hue: "from-rose-400 to-pink-500" },
];

export const SUGGESTED_PROMPTS = [
  "Plan a 5-day Kashmir trip",
  "Best cafes in Goa",
  "Weekend roadtrip from Delhi",
  "Backpacking Himachal itinerary",
  "Luxury Kerala honeymoon plan",
  "Plan a 7-day Japan itinerary",
  "Europe trip under ₹2 lakhs",
  "Best places to visit during monsoon in India",
  "South India temple tour",
  "Hidden gems in Northeast India",
];
