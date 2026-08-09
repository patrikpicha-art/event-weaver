import { useState } from "react";

const TOPICS = ["Chci se stavit na hru", "Rezervace stolu", "Workshop malování", "Něco jiného"];

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]!);
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Jméno: ${name}\nE-mail: ${email}\nTéma: ${topic}\n\n${message}`;
    window.location.href = `mailto:kostka.prokleta@gmail.com?subject=${encodeURIComponent(
      `Dotaz z webu – ${topic}`,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={onSubmit} className="surface ember-frame grid gap-4 rounded-lg p-6 md:p-7">
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            className={`rounded-full border px-3 py-1.5 text-[0.65rem] uppercase tracking-widest transition-colors ${
              topic === t
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          Jméno
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jak ti máme říkat?"
            className="rounded-sm border border-input bg-background/60 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </label>
        <label className="grid gap-1.5 text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          E-mail
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tvuj@email.cz"
            className="rounded-sm border border-input bg-background/60 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </label>
      </div>
      <label className="grid gap-1.5 text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        Zpráva
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Na co se chceš zeptat?"
          className="rounded-sm border border-input bg-background/60 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="rounded-sm bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground shadow-[var(--shadow-forge)] transition-transform hover:-translate-y-0.5"
        >
          Odeslat dotaz
        </button>
        <p className="text-xs text-muted-foreground">
          Odpovídáme obvykle do 24 hodin.
        </p>
      </div>
    </form>
  );
}
