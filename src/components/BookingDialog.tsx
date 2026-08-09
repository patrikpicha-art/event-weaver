import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { requestBooking } from "@/lib/calendar.functions";
import { toast } from "sonner";

const TIMES = Array.from({ length: 15 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

function longDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(y!, m! - 1, d!, 12)));
}

export function BookingDialog({
  dateKey,
  onClose,
  onSent,
}: {
  dateKey: string;
  onClose: () => void;
  onSent?: () => void;
}) {
  const send = useServerFn(requestBooking);
  const [time, setTime] = useState("17:00");
  const [hours, setHours] = useState(3);
  const [people, setPeople] = useState(4);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await send({
        data: { name, email, date: dateKey, time, hours, people, note },
      });
      if (!res.ok) {
        toast.error(res.message ?? "Rezervaci se nepodařilo odeslat.");
        return;
      }
      setDone(true);
      onSent?.();
    } catch {
      toast.error("Rezervaci se nepodařilo odeslat.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="surface ember-frame rise-in relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg p-6 md:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít"
          className="absolute right-4 top-4 h-8 w-8 rounded-full border border-border text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          ×
        </button>

        {done ? (
          <div className="py-6 text-center">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
              Žádost odeslána
            </p>
            <h3 className="mt-3 font-display text-2xl text-primary">Držíme ti termín</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Poslali jsme dotaz do herny. Jakmile ho někdo z klubu odsouhlasí, termín se
              automaticky objeví v kalendáři.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-sm bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground"
            >
              Zavřít
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                Rezervace termínu
              </p>
              <h3 className="mt-1 font-display text-2xl">{longDate(dateKey)}</h3>
              <div className="ember-rule mt-4 h-px w-16" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                Od kdy
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-sm border border-input bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                >
                  {TIMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                Na kolik hodin
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="rounded-sm border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                Počet lidí
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={people}
                  onChange={(e) => setPeople(Number(e.target.value))}
                  className="rounded-sm border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jméno"
                className="rounded-sm border border-input bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="rounded-sm border border-input bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Co si chcete zahrát? (nepovinné)"
              className="rounded-sm border border-input bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />

            <button
              type="submit"
              disabled={busy}
              className="rounded-sm bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground shadow-[var(--shadow-forge)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {busy ? "Odesílám…" : "Poslat žádost do herny"}
            </button>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Žádost pošleme do herny ke schválení. Po odsouhlasení se termín sám propíše do
              kalendáře.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
