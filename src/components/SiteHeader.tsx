import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png.asset.json";

const nav = [
  { to: "/", label: "Domů" },
  { to: "/informace", label: "Informace" },
  { to: "/kalendar", label: "Kalendář" },
  { to: "/blog", label: "Blog" },
];

export function SiteHeader() {
  const { session } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = async () => {
    setMenuOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5">
        <Link to="/" className="group flex items-center gap-3">
          <img
            src={logo.url}
            alt="Logo klubu Kostka Prokletá"
            className="h-12 w-12 object-contain transition-transform duration-500 group-hover:scale-110 sm:h-16 sm:w-16 md:h-20 md:w-20"
          />
          <span className="font-display text-sm leading-tight tracking-[0.2em] text-foreground sm:text-base md:text-lg">
            KOSTKA
            <br />
            PROKLETÁ
          </span>
        </Link>

        {/* Na mobilu se čtyři odkazy plus Discord do řádku nevejdou – schované do menu. */}
        <nav className="ml-auto hidden flex-wrap items-center gap-1 text-sm md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="rounded-sm px-3 py-2 uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://discord.gg/h9zFYFCXjK"
            target="_blank"
            rel="noreferrer"
            className="ml-2 rounded-sm border border-primary/60 px-4 py-2 text-xs uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Discord
          </a>
          {session && (
            <button
              type="button"
              onClick={signOut}
              className="ml-1 rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Odhlásit
            </button>
          )}
        </nav>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            aria-label="Otevřít menu"
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:border-primary hover:text-primary md:hidden"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-border bg-background">
            <SheetTitle className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
              Menu
            </SheetTitle>
            <nav className="mt-8 flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "text-primary" }}
                  className="rounded-sm px-3 py-3 text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-2 border-t border-border/70 pt-6">
              <a
                href="https://discord.gg/h9zFYFCXjK"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className="rounded-sm border border-primary/60 px-4 py-3 text-center text-xs uppercase tracking-widest text-primary"
              >
                Discord
              </a>
              {session && (
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-sm border border-border px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground"
                >
                  Odhlásit
                </button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
