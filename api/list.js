// GET /api/list?token=… (or Authorization: Bearer …) — pull the waitlist as JSON.
// Token-gated by LIST_TOKEN env. Reads the deduped `waitlist` set from Vercel KV.
module.exports = async (req, res) => {
  const token = process.env.LIST_TOKEN;
  const provided = (req.headers.authorization || "").replace(/^Bearer\s+/i, "") || (req.query && req.query.token) || "";
  if (!token || provided !== token) { res.statusCode = 401; return res.json({ error: "unauthorized" }); }

  const KV_URL = process.env.KV_REST_API_URL, KV_TOK = process.env.KV_REST_API_TOKEN;
  if (!KV_URL || !KV_TOK) { res.statusCode = 200; return res.json({ count: 0, emails: [], note: "no KV store attached yet" }); }
  try {
    const r = await fetch(`${KV_URL}/smembers/waitlist`, { headers: { Authorization: `Bearer ${KV_TOK}` } });
    const j = await r.json();
    const emails = (j && j.result) || [];
    res.statusCode = 200;
    return res.json({ count: emails.length, emails });
  } catch (e) {
    res.statusCode = 500;
    return res.json({ error: "kv read failed" });
  }
};
