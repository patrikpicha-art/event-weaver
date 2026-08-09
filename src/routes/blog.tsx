import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import blog1 from "@/assets/blog1.jpg.asset.json";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog – novinky z klubu Kostka Prokletá" },
      {
        name: "description",
        content:
          "Články a novinky ze strakonického klubu Kostka Prokletá – reporty z akcí, malování miniatur a herních večerů.",
      },
      { property: "og:title", content: "Blog – Kostka Prokletá" },
      {
        property: "og:description",
        content: "Reporty z akcí, workshopů malování miniatur a herních večerů.",
      },
    ],
  }),
  component: Blog,
});

function Blog() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl">Blog</h1>
        <div className="ember-rule mt-5 h-px w-24" />

        <article className="mt-12">
          <img
            src={blog1.url}
            alt="Malování miniatur během 24hodinové painting challenge"
            className="w-full rounded-md object-cover"
          />
          <h2 className="mt-8 text-3xl">24hodinová painting challenge</h2>
          <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
            <p>
              Z pátku na sobotu jsme v Kostce Prokleté absolvovali intenzivní 24hodinovou malířskou
              výzvu – tentokrát pod vedením talentovaného Jakuba Houšky jsme se ponořili do světa
              olejových barev.
            </p>
            <p>
              Na rozdíl od předchozích akcí jsme se všichni pustili do stejné miniatury, abychom si
              mohli společně osvojit nové techniky. Pro většinu z nás to byla první zkušenost s
              olejovkami – a i když to byla výzva, byla to zároveň skvělá zábava!
            </p>
            <p>
              Figurka od Zabaart Lamberta nám perfektně posloužila jako model pro trénink míchání a
              tvorby realistické pleťové barvy.
            </p>
            <p>Výsledky? Překvapivě povedené a rozhodně inspirující!</p>
            <p>
              Další akce proběhne v listopadu! Pokud se chceš naučit něco nového, zlepšit se v
              malování nebo si prostě užít kreativní víkend s partou nadšenců, rozhodně doporučujeme
              se přidat.
            </p>
            <p>
              Atmosféra byla skvělá, inspirace všude kolem – a hlavně to byla fakt zábava. Díky
              všem, kdo se zúčastnili – a těšíme se na další společné malování!
            </p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
