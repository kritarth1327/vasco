import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, FileDown, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { exportItineraryPDF } from "@/lib/pdf-export";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type Trip = { id: string; title: string; destination: string | null; content: string; created_at: string };

export const Route = createFileRoute("/saved")({
  component: SavedPage,
});

function SavedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    supabase
      .from("saved_trips")
      .select("id,title,destination,content,created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setTrips(data ?? []);
        setLoading(false);
      });
  }, [user]);

  async function remove(id: string) {
    const { error } = await supabase.from("saved_trips").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      setTrips((t) => t.filter((x) => x.id !== id));
      toast.success("Removed");
    }
  }

  function exportPdf(trip: Trip) {
    exportItineraryPDF(trip.title, trip.content);
    toast.success("PDF downloaded");
  }

  return (
    <div className="min-h-screen bg-travel-radial">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold md:text-4xl">
          Your saved <span className="text-gradient-travel">journeys</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">All your trips with Vasco, in one place.</p>

        {!user ? (
          <div className="glass mt-10 rounded-2xl p-8 text-center">
            <Bookmark className="mx-auto mb-3 h-8 w-8 text-blue-500" />
            <h2 className="text-lg font-semibold">Sign in to see saved trips</h2>
            <p className="mt-1 text-sm text-muted-foreground">Save AI-generated itineraries and access them anywhere.</p>
            <Link
              to="/auth"
              className="mt-4 inline-flex rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-medium text-white"
            >
              Sign in
            </Link>
          </div>
        ) : loading ? (
          <div className="mt-10 grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-secondary/60" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="glass mt-10 rounded-2xl p-8 text-center text-sm text-muted-foreground">
            No saved trips yet — head to <Link to="/chat" className="text-foreground underline">chat with Vasco</Link> and save your first plan.
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {trips.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{t.title}</h3>
                    <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => exportPdf(t)} className="rounded-md p-2 text-muted-foreground hover:bg-secondary" title="Download PDF">
                      <FileDown className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(t.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">View itinerary</summary>
                  <div className="prose prose-sm mt-3 max-w-none dark:prose-invert">
                    <ReactMarkdown>{t.content}</ReactMarkdown>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
