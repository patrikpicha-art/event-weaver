import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ClubCalendar } from "@/components/ClubCalendar";
import { EmberSparks } from "@/components/EmberSparks";
import club1 from "@/assets/club1.jpg.asset.json";
import club2 from "@/assets/club2.jpg.asset.json";
import club3 from "@/assets/club3.jpg.asset.json";
import logo from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kostka Prokletá – deskoherní klub ve Strakonicích" },
      {
        name: "description",
        content:
          "Herní klub ve Strakonicích: wargaming, malování figurek, D&D, deskové a karetní hry. Lidická 194, vstupné 50 Kč, členství 250 Kč měsíčně.",
      },
      { property: "og:title", content: "Kostka Prokletá – deskoherní klub ve Strakonicích" },
      {
        property: "og:description",
        content: "Wargaming, D&D, deskovky a malování miniatur. Lidická 194, Strakonice.",
      },
    ],
  }),
  component: Index,
});

const activities = [
  {
    title: "Turnaje a herní večery",
    text: "Pravidelně pořádáme eventy pro hráče TCG Star Wars i novinku RIFTBOUND. Prostor tu mají i fanoušci Magic: The Gathering.",
  },
  {
    title: "Wargamingová komunita",
    text: "Taktické bitvy, terén a armády miniatur – hrajeme CONQUEST i Warhammer. Máme stoly, terén i hráče, kteří rádi poradí.",
  },
  {
    title: "Deskovky pro malé i velké",
    text: "Naše sbírka deskových her je k dispozici všem návštěvníkům – klasiky i novinky, rychlá zábava i několikahodinová strategie.",
  },
  {
    title: "Hobby & kreativita",
    text: "Pořádáme workshopy malování miniatur, kde se naučíte postupy od základu až po pokročilé techniky.",
  },
  {
    title: "RPG zóna",
    text: "Vyhrazený koutek s gauči je ideální pro Dungeons & Dragons a další RPG kampaně – i pro klidné posezení u komiksu.",
  },
];

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-border/70">
          <img
            src={club1.url}
            alt="Hráči u stolu v klubu Kostka Prokletá"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-linear-to-b from-background/70 via-background/80 to-background" />
          <EmberSparks />
          <div className="relative mx-auto max-w-6xl px-5 py-24 md:py-32">
            <div className="logo-halo relative inline-block">
              <img
                src={logo.url}
                alt="Logo Kostka Prokletá"
                className="logo-float h-44 w-44 object-contain md:h-64 md:w-64"
              />
            </div>
            <h1 className="rise-in mt-8 max-w-3xl text-4xl leading-tight md:text-6xl">
              Vítejte na stránkách <span className="text-ember">strakonického</span> deskoherního
              klubu
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Jsme herní klub, kde se potkávají lidé, které spojuje vášeň pro wargaming, malování
              figurek, D&D a hraní deskových a karetních her. Přijď si zahrát, odpočinout si od
              všedních dnů a užít si skvělou atmosféru kolem stolu.
            </p>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Ať už jsi zkušený stratég nebo úplný nováček – v Kostce Prokleté máš místo jisté.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/kalendar"
                className="rounded-sm bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground shadow-[var(--shadow-forge)] transition-transform hover:-translate-y-0.5"
              >
                Kalendář akcí
              </Link>
              <Link
                to="/informace"
                className="rounded-sm border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] hover:border-primary hover:text-primary"
              >
                Jak to u nás funguje
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { k: "Vstupné", v: "50 Kč / osoba" },
              { k: "Členství", v: "250 Kč / měsíc" },
              { k: "Kde nás najdete", v: "Lidická 194, Strakonice" },
            ].map((i) => (
              <div key={i.k} className="surface lift-card ember-frame rounded-md p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{i.k}</p>
                <p className="mt-3 font-display text-xl text-primary">{i.v}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Klub zatím nemá pevně stanovenou otevírací dobu. Veškeré informace o akcích a otevřených
            dnech najdete na našem{" "}
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="https://discord.gg/h9zFYFCXjK"
              target="_blank"
              rel="noreferrer"
            >
              Discordu
            </a>{" "}
            a{" "}
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="https://www.facebook.com/profile.php?id=61558689437212"
              target="_blank"
              rel="noreferrer"
            >
              Facebooku
            </a>
            .
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="text-3xl">Co u nás najdete?</h2>
          <div className="ember-rule mt-5 h-px w-24" />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {activities.map((a) => (
              <article key={a.title} className="surface lift-card ember-frame rounded-md p-7">
                <h3 className="text-lg text-primary">{a.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="text-3xl">Co se u nás děje?</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Zajímá vás, co se u nás děje a nebo dělo? Chcete se dozvědět novinky v klubu nebo ve
            hrách? Přečtěte si náš blog.
          </p>
          <Link
            to="/blog"
            className="group mt-8 grid gap-6 overflow-hidden rounded-md border border-border md:grid-cols-[1fr_1.2fr]"
          >
            <img
              src={club1.url}
              alt="24hodinová painting challenge v klubu"
              className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-full"
              loading="lazy"
            />
            <div className="p-7">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Blog</p>
              <h3 className="mt-3 text-2xl">24hodinová painting challenge</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Z pátku na sobotu jsme v Kostce Prokleté absolvovali intenzivní 24hodinovou
                malířskou výzvu – tentokrát pod vedením talentovaného Jakuba Houšky.
              </p>
              <span className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-primary">
                Číst více
              </span>
            </div>
          </Link>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20">
          <h2 className="text-3xl">
            Kalendář <span className="text-ember">akcí</span>
          </h2>
          <div className="ember-rule mt-5 h-px w-24" />
          <div className="mt-8">
            <ClubCalendar />
          </div>
        </section>


        <section className="mx-auto max-w-6xl px-5 pb-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[club1, club2, club3].map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt={`Fotografie z klubu Kostka Prokletá ${i + 1}`}
                className="h-64 w-full rounded-md object-cover transition-all duration-500 hover:-translate-y-1 hover:brightness-110"
                loading="lazy"
              />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
