import { createFileRoute } from "@tanstack/react-router";

function page(title: string, body: string, accent = "#d98324"): Response {
  return new Response(
    `<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#120d0b;color:#f2e9e2;font-family:system-ui,-apple-system,'Segoe UI',sans-serif">
<div style="max-width:460px;padding:40px 28px;text-align:center">
<div style="width:56px;height:56px;margin:0 auto 20px;border-radius:16px;background:${accent};opacity:.9"></div>
<h1 style="font-size:22px;margin:0 0 10px">${title}</h1>
<p style="color:#b8a79c;line-height:1.6;margin:0 0 24px">${body}</p>
<a href="/#kalendar" style="display:inline-block;padding:12px 24px;border-radius:999px;background:${accent};color:#1a1210;font-weight:700;text-decoration:none">Zobrazit kalendář</a>
</div></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/api/public/rezervace")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token") ?? "";
        const action = url.searchParams.get("action") ?? "";
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
        if (!isUuid || (action !== "approve" && action !== "reject")) {
          return page("Neplatný odkaz", "Odkaz na potvrzení rezervace je neplatný nebo nekompletní.", "#8d7d74");
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: existing } = await supabaseAdmin
          .from("club_events")
          .select("id, status, title")
          .eq("approve_token", token)
          .maybeSingle();
        if (!existing) {
          return page("Rezervace nenalezena", "Tato žádost už neexistuje.", "#8d7d74");
        }
        const status = action === "approve" ? "confirmed" : "rejected";
        const { error } = await supabaseAdmin
          .from("club_events")
          .update({ status })
          .eq("approve_token", token);
        if (error) {
          console.error("approval failed", error.message);
          return page("Něco se pokazilo", "Stav rezervace se nepodařilo změnit. Zkuste to prosím znovu.", "#a8452c");
        }
        return action === "approve"
          ? page("Termín potvrzen", `„${existing.title}“ je teď vidět v kalendáři na webu.`)
          : page("Termín zamítnut", `„${existing.title}“ byl zamítnut a v kalendáři se nezobrazí.`, "#8d7d74");
      },
    },
  },
});
