import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import club2 from "@/assets/club2.jpg.asset.json";

export const Route = createFileRoute("/informace")({
  head: () => ({
    meta: [
      { title: "Informace, ceny a provozní řád – Kostka Prokletá" },
      {
        name: "description",
        content:
          "Jak funguje klub Kostka Prokletá: vstupné 50 Kč, členství 250 Kč měsíčně, provozní řád a pravidla klubu ve Strakonicích.",
      },
      { property: "og:title", content: "Informace a pravidla – Kostka Prokletá" },
      {
        property: "og:description",
        content: "Vstupné, členství, provozní řád a pravidla strakonického herního klubu.",
      },
    ],
  }),
  component: Informace,
});

const provozniRad = [
  "Provozovatelem klubu je KostkaProkletá, z.s. na adrese Lidická 194, Strakonice, 386 01",
  "Kontaktní osoba: Michal Krametbauer, kostka.prokleta@gmail.com",
  "Klub nemá pevně stanovenou otevírací dobu.",
  "Klub je otevřen v předem vyhlášených termínech akcí – deskohraní, turnaje a další. Mimo vyhlášené akce je možné si návštěvu klubu domluvit předem.",
  "Termíny akcí a další informace o provozu klubu najdete na webových stránkách.",
  "Do klubu mohou vstoupit všichni zájemci o deskové hry nebo jiné aktivity pořádané v klubu. Děti do 10 let mohou vstoupit v doprovodu a pod trvalým dozorem rodičů nebo jiné dospělé osoby.",
  "Osobám podnapilým, pod vlivem omamných a psychotropních látek a nemocným infekční nebo jinou přenosnou nemocí je vstup zakázán.",
  "Návštěvník má právo používat v souladu s provozním řádem prostory klubu, jeho vybavení a zařízení.",
];

const obecnaPravidla = [
  "V klubu jsou k dispozici pro návštěvníky k zapůjčení deskové hry. Návštěvníci si hru mohou podat sami z regálů. Hry neničí ani nijak nepoškozují a v původním stavu je vrátí na původní místo do regálu.",
  "Pokud návštěvníci hru zničí, jsou povinni pořídit další kus této hry do klubu.",
  "Hry, které jsou k dispozici na klubu, není možné zapůjčovat návštěvníkům domů.",
  "Součástí prostoru klubu je i bar a varná konvice. Návštěvníci tato zařízení mohou používat, jsou povinni si po sobě uklidit a udržovat pořádek. Nápoje si nalévají do sklenic, které jsou k dispozici na baru.",
  "Pochutiny si návštěvníci přendají do misek, které jsou k dispozici na baru. Za zkonzumované nápoje nebo pochutiny nechají návštěvníci určený dobrovolný příspěvek.",
  "Návštěvníci jsou povinni vybavení klubu nepoškozovat ani nijak ničit. V případě poškození nebo zničení vybavení jsou povinni pořídit nový kus nebo uhradit aktuální kupní cenu.",
];

const penize = [
  "Stálí členové přispívají částkou 250 Kč měsíčně. Tato částka je splatná každý měsíc k 20. dni daného měsíce. Odložení příspěvku je možné, ale musí být nahlášeno hlavnímu pokladníkovi. Odložení je možné pouze o dobu tří měsíců, kdy se musí celá částka zaplatit najednou (tři měsíce z důvodu placení nájmu jednou za 3 měsíce). V případě nedostatečných kapacit na placení nájmu může být tato měsíční částka zvýšena. Pokud ani po zvýšení nebudeme moci plnit závazek, podáváme měsíční výpovědní lhůtu z daných prostor.",
  "Náhodní kolemjdoucí přispívají částkou 50 Kč, tato částka se vybírá pomocí QR.",
  "Pro zlepšení zázemí a vybavenosti klubu je možné, že budeme vybírat dobrovolný příspěvek (např. nové stoly). Tato skutečnost bude ohlášena.",
  "Přeplatky budou použity pro účely klubu.",
  "Nedoplatky se budou vymáhat rovným dílem.",
  "Do popisku prosím dávejte pouze hesla. V bankovnictví nepotřebujeme Tolkiena. (Nájem, Donate + na co...)",
];

const chovani = [
  "Zákaz kouření je v celém objektu – když už musíš, jdi na křižovatku.",
  "Pij s Mírou: když si chceš dát pivo, tak střídmě... nechceme, aby někdo padal na rozestavěnou deskovku a nedejbože na armádu.",
  "Alkohol prosíme konzumovat od 18 let a pouze v prostorách klubovny a v nepřítomnosti mladistvých osob.",
  "Přísný zákaz podávání alkoholu osobám mladším 18 let. V případě, že se tak stane, dojde k okamžitému vykázání a ztrátě klubového členství. Jakýkoliv člen, který by se jevil příliš podnapilý či pod vlivem jiných látek a mohl by ohrožovat majetek či pohodu ostatních členů, bude požádán o opuštění areálu a případně i vyveden.",
  "Když už si tu budeš chtít něco sníst, nenechávej po sobě bordel a postarej se o svůj odpad – pozor na mastný pařáty.... jinými slovy myjte si ruce!!",
  "Nevoď si sem různé neověřené existence – za návštěvu ručí člen.",
  "Ve společných prostorách dodržujte klid.",
  "Chodíme tu bos nebo v přezůvkách... doma taky nechceš mít bordel.",
  "Chovej se ke všemu (nábytku, vybavení, deskovkám) tak, jako by to bylo tvé vlastní – pokud něco zničíš vlastní neopatrností či bezohledností, prostě to zaplatíš!!!",
];

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-14">
      <h2 className="text-2xl">{title}</h2>
      <ul className="mt-6 space-y-4">
        {items.map((t) => (
          <li key={t} className="surface rounded-md p-5 text-sm leading-relaxed">
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Informace() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-4xl">Jak to u nás funguje?</h1>
        <div className="ember-rule mt-5 h-px w-24" />

        <div className="mt-10 grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="surface rounded-md p-7">
            <h2 className="text-xl">Jak funguje klub?</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Klub zatím nemá pevně stanovenou otevírací dobu! Veškeré informace o akcích a
              otevřených dnech jsou na našem{" "}
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
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Vstupné je <strong className="text-foreground">50,-/osoba</strong>, pro stálé členy je
              to <strong className="text-foreground">250,-/měsíčně</strong>. Během hraní můžete
              libovolně přicházet a odcházet, budeme si vás pamatovat.
            </p>
          </div>
          <img
            src={club2.url}
            alt="Interiér klubu Kostka Prokletá"
            className="h-full min-h-56 w-full rounded-md object-cover"
            loading="lazy"
          />
        </div>

        <Section title="Provozní řád klubu KostkaProkletá z.s." items={provozniRad} />
        <p className="mt-6 text-sm text-muted-foreground">
          Tento provozní řád je závazný pro všechny návštěvníky klubu. Návštěvník klubu vyjadřuje
          vstupem do klubu souhlas s provozním řádem.
        </p>
        <Section title="Obecná pravidla klubu" items={obecnaPravidla} />
        <Section title="Peníze točí světem" items={penize} />
        <Section title="Nechovej se nevhodně" items={chovani} />
      </main>
      <SiteFooter />
    </div>
  );
}
