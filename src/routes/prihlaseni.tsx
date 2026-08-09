import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useSession } from "@/hooks/useSession";
import logo from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/prihlaseni")({
  head: () => ({
    meta: [
      { title: "Přihlášení správce – Kostka Prokletá" },
      {
        name: "description",
        content:
          "Přihlášení do správy kalendáře deskoherního klubu Kostka Prokletá ve Strakonicích.",
      },
      { property: "og:title", content: "Přihlášení správce – Kostka Prokletá" },
      { property: "og:description", content: "Správa kalendáře a rezervací klubu." },
    ],
  }),
  component: Prihlaseni,
});

function Prihlaseni() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkMail, setCheckMail] = useState(false);

  useEffect(() => {
    if (session) void navigate({ to: "/kalendar" });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error("Přihlášení se nepovedlo. Zkontroluj e-mail a heslo.");
          return;
        }
        toast.success("Přihlášeno.");
        void navigate({ to: "/kalendar" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        if (!data.session) setCheckMail(true);
      }
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Přihlášení Googlem se nepovedlo.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/kalendar" });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col items-center px-5 py-20">
        <div className="logo-halo relative">
          <img src={logo.url} alt="Logo Kostka Prokletá" className="logo-float h-28 w-28 object-contain" />
        </div>
        <h1 className="mt-8 text-center text-3xl">
          Správa <span className="text-ember">kalendáře</span>
        </h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Přihlas se a můžeš přidávat, upravovat i mazat akce a schvalovat rezervace.
        </p>

        {checkMail ? (
          <div className="surface mt-8 w-full rounded-lg p-6 text-center text-sm text-muted-foreground">
            Poslali jsme ti potvrzovací e-mail. Klikni na odkaz v něm a pak se přihlas.
          </div>
        ) : (
          <form onSubmit={submit} className="surface mt-8 grid w-full gap-3 rounded-lg p-6">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="rounded-sm border border-input bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Heslo"
              className="rounded-sm border border-input bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-sm bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-60"
            >
              {mode === "in" ? "Přihlásit se" : "Vytvořit účet"}
            </button>
            <button
              type="button"
              onClick={google}
              className="rounded-sm border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] hover:border-primary hover:text-primary"
            >
              Pokračovat s Google
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "in" ? "up" : "in")}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              {mode === "in" ? "Nemám účet – zaregistrovat se" : "Už mám účet – přihlásit se"}
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
