import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
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

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
        <Link to="/" className="group flex items-center gap-3">
          <img src={logo.url} alt="Logo klubu Kostka Prokletá" className="h-16 w-16 object-contain transition-transform duration-500 group-hover:scale-110 md:h-20 md:w-20" />
          <span className="font-display text-base leading-tight tracking-[0.2em] text-foreground md:text-lg">
            KOSTKA
            <br />
            PROKLETÁ
          </span>
        </Link>

        <nav className="ml-auto flex flex-wrap items-center gap-1 text-sm">
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
      </div>
    </header>
  );
}
