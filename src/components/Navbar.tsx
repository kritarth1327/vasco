import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Moon, Sun, MessageCircle, Bookmark, LogIn, LogOut, Menu, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/use-theme";
import type { User } from "@supabase/supabase-js";

const links = [
  { to: "/", label: "Home" },
  { to: "/chat", label: "Chat with Vasco", icon: MessageCircle },
  { to: "/explore", label: "Destinations", icon: Compass },
  { to: "/saved", label: "Saved", icon: Bookmark },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-[min(1200px,95%)] items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card text-foreground">
            <Compass className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm">Vasco da Gama</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card hover:bg-secondary"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="hidden items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-secondary md:flex"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="hidden items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 md:flex"
            >
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Open menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>


      {open && (
        <div className="border-t border-border bg-background p-3 md:hidden">
          <div className="mx-auto flex w-[min(1200px,95%)] flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            {!user && (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
              >
                Sign in
              </Link>
            )}
            {user && (
              <button
                onClick={() => {
                  setOpen(false);
                  supabase.auth.signOut();
                }}
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

