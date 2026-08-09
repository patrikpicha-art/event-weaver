import { getRequest } from "@tanstack/react-start/server";

type BookingEmailInput = {
  to: string;
  token: string;
  name: string;
  email: string;
  people: number;
  note: string;
  startsAt: string;
  endsAt: string;
};

function siteOrigin(): string {
  try {
    const req = getRequest();
    const origin = req.headers.get("origin");
    if (origin) return origin;
    return new URL(req.url).origin;
  } catch {
    return process.env["SITE_URL"] ?? "";
  }
}

function fmt(iso: string): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: "Europe/Prague",
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function buildApprovalLinks(token: string) {
  const base = `${siteOrigin()}/api/public/rezervace`;
  return {
    approve: `${base}?token=${token}&action=approve`,
    reject: `${base}?token=${token}&action=reject`,
  };
}

export function renderBookingEmail(input: BookingEmailInput): string {
  const links = buildApprovalLinks(input.token);
  return `<!doctype html><html lang="cs"><body style="margin:0;background:#120d0b;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#f2e9e2">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <h1 style="font-size:20px;margin:0 0 4px">Nová žádost o rezervaci</h1>
    <p style="color:#b8a79c;margin:0 0 24px">Kostka Prokletá – Strakonice</p>
    <table style="width:100%;border-collapse:collapse;background:#1c1512;border-radius:12px;overflow:hidden">
      <tr><td style="padding:12px 16px;color:#b8a79c">Termín</td><td style="padding:12px 16px"><strong>${fmt(input.startsAt)}</strong></td></tr>
      <tr><td style="padding:12px 16px;color:#b8a79c">Do</td><td style="padding:12px 16px">${fmt(input.endsAt)}</td></tr>
      <tr><td style="padding:12px 16px;color:#b8a79c">Jméno</td><td style="padding:12px 16px">${input.name}</td></tr>
      <tr><td style="padding:12px 16px;color:#b8a79c">E-mail</td><td style="padding:12px 16px">${input.email}</td></tr>
      <tr><td style="padding:12px 16px;color:#b8a79c">Počet lidí</td><td style="padding:12px 16px">${input.people}</td></tr>
      ${input.note ? `<tr><td style="padding:12px 16px;color:#b8a79c">Poznámka</td><td style="padding:12px 16px">${input.note}</td></tr>` : ""}
    </table>
    <div style="margin:28px 0;text-align:center">
      <a href="${links.approve}" style="display:inline-block;padding:14px 26px;margin:0 6px 10px;border-radius:999px;background:#d98324;color:#1a1210;font-weight:700;text-decoration:none">Potvrdit termín</a>
      <a href="${links.reject}" style="display:inline-block;padding:14px 26px;margin:0 6px 10px;border-radius:999px;border:1px solid #4a3a33;color:#f2e9e2;text-decoration:none">Zamítnout</a>
    </div>
    <p style="color:#8d7d74;font-size:12px;text-align:center">Po potvrzení se termín automaticky objeví v kalendáři na webu.</p>
  </div></body></html>`;
}

/**
 * Odešle žádost o rezervaci na e-mail herny. Vyžaduje nastavenou e-mailovou
 * domému projektu (Lovable Emails). Dokud není k dispozici, žádost zůstává
 * v administraci ke schválení a odkazy se zaloguje.
 */
export async function sendBookingRequestEmail(input: BookingEmailInput): Promise<boolean> {
  const html = renderBookingEmail(input);
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["EMAIL_FROM"];
  if (!apiKey || !from) {
    console.log(
      "[booking] e-mail neodeslán (chybí e-mailová domény). Odkazy:",
      buildApprovalLinks(input.token),
    );
    return false;
  }
  try {
    const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${process.env["LOVABLE_API_KEY"]}`,
        "X-Connection-Api-Key": apiKey,
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        reply_to: input.email,
        subject: `Žádost o rezervaci – ${input.name}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[booking] odeslání e-mailu selhalo", res.status);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[booking] odeslání e-mailu selhalo", e);
    return false;
  }
}
