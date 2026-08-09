import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ClubCalendar } from "@/components/ClubCalendar";

export const Route = createFileRoute("/kalendar")({
  head: () => ({
    meta: [
      { title: "Kalendář akcí – Kostka Prokletá Strakonice" },
      {
        name: "description",
        content:
          "Termíny herních večerů, turnajů a wargamingových akcí klubu Kostka Prokletá na Lidické 194 ve Strakonicích.",
      },
      { property: "og:title", content: "Kalendář akcí – Kostka Prokletá" },
      {
        property: "og:description",
        content: "Herní večery, turnaje a wargaming ve strakonickém klubu Kostka Prokletá.",
      },
    ],
  }),
  component: Kalendar,
});

function Kalendar() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-16">
        <h1 className="text-4xl">
          Kalendář <span className="text-ember">akcí</span>
        </h1>
        <div className="ember-rule mt-5 h-px w-24" />
        <p className="mt-6 max-w-2xl text-muted-foreground">
          Klub nemá pevně stanovenou otevírací dobu – otevřeno je v předem vyhlášených termínech
          akcí. Mimo vyhlášené akce je možné si návštěvu domluvit předem na
          kostka.prokleta@gmail.com.
        </p>
        <div className="mt-10">
          <ClubCalendar />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
