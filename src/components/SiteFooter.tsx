import { Link } from "@tanstack/react-router";
import { ContactForm } from "./ContactForm";
import logo from "@/assets/logo.png.asset.json";

const socials = [
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61558689437212" },
  { label: "Instagram", href: "https://www.instagram.com/kostkaprokleta/" },
  { label: "Discord", href: "https://discord.gg/h9zFYFCXjK" },
];

export function SiteFooter() {
  return (
    <footer id="kontakt" className="relative mt-24 overflow-hidden border-t border-border/70">
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-col items-center text-center">
          <div className="logo-halo relative">
            <img
              src={logo.url}
              alt="Logo klubu Kostka Prokletá"
              className="logo-float h-24 w-24 object-contain md:h-32 md:w-32"
              loading="lazy"
            />
          </div>
          <p className="mt-6 text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
            Napiš nám
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">
            Chcete se na něco <span className="text-ember">zeptat?</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Nevíš, jestli je otevřeno? Chceš přijít s partou, nebo si zkusit první hru? Napiš nám –
            rádi poradíme i úplným nováčkům.
          </p>
          <div className="ember-rule mt-7 h-px w-24" />
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <ContactForm />

          <div className="grid gap-4">
            <div className="surface lift-card rounded-lg p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                Kde nás najdeš
              </p>
              <p className="mt-3 font-display text-lg text-primary">Lidická 194, Strakonice</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                386 01 · zvonek v průchodu, 2. patro
              </p>
              <a
                href="https://maps.google.com/?q=Lidick%C3%A1%20194%20Strakonice"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-[0.65rem] uppercase tracking-widest text-primary underline-offset-4 hover:underline"
              >
                Otevřít v mapě
              </a>
            </div>
            <div className="surface lift-card rounded-lg p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                E-mail
              </p>
              <a
                href="mailto:kostka.prokleta@gmail.com"
                className="mt-3 inline-block font-display text-lg text-primary underline-offset-4 hover:underline"
              >
                kostka.prokleta@gmail.com
              </a>
              <div className="mt-5 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    className="rounded-sm border border-border px-4 py-2 text-[0.65rem] uppercase tracking-widest transition-colors hover:border-primary hover:text-primary"
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        <span>© 2025 KostkaProkletá, z.s. Všechna práva vyhrazena.</span>
        <span className="hidden sm:inline">·</span>
        <span>Design Kateřina Krametbauer</span>
        <span className="hidden sm:inline">·</span>
        <Link to="/prihlaseni" className="hover:text-primary">
          Správa kalendáře
        </Link>
      </div>
    </footer>
  );
}
