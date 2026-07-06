// POST /api/subscribe { email, source?, ref? } — waitlist capture.
// Stores to Vercel KV (Upstash Redis, free tier) if attached, and/or forwards to an
// optional webhook (e.g. a Google Sheet Apps Script). The email is ALSO captured in
// Amplitude client-side, so the list exists even before a store is attached.
module.exports = async (req, res) => {
  if (req.method !== "POST") { res.statusCode = 405; return res.json({ error: "method not allowed" }); }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { res.statusCode = 400; return res.json({ error: "invalid email" }); }

  const rec = { email, source: body.source || "", ref: body.ref || "", ts: Date.now(), ua: (req.headers && req.headers["user-agent"]) || "" };
  let stored = false;

  // Vercel KV / Upstash Redis (REST) — free tier. Env auto-set when you attach a KV store.
  const KV_URL = process.env.KV_REST_API_URL, KV_TOK = process.env.KV_REST_API_TOKEN;
  if (KV_URL && KV_TOK) {
    const h = { Authorization: `Bearer ${KV_TOK}` };
    try {
      await fetch(`${KV_URL}/sadd/waitlist/${encodeURIComponent(email)}`, { headers: h });         // deduped set of emails
      await fetch(`${KV_URL}/lpush/waitlist:log/${encodeURIComponent(JSON.stringify(rec))}`, { headers: h }); // full log
      stored = true;
    } catch (e) {}
  }
  // Optional webhook (Google Sheet Apps Script / Zapier / etc.)
  const HOOK = process.env.WAITLIST_WEBHOOK;
  if (HOOK) { try { await fetch(HOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rec) }); stored = true; } catch (e) {} }

  res.statusCode = 200;
  res.json({ ok: true, stored });
};
