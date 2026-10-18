/* OPTIONAL: makes AI Gem answer ANY question with a real AI model.
   This is a Cloudflare Worker (free plan is enough to start).
   Your API key stays secret here, never inside the website files.

   Setup:
   1. Create a Cloudflare Worker and paste this file.
   2. Settings > Variables > add a secret named ANTHROPIC_API_KEY.
   3. Change ALLOWED_ORIGIN below to your site address.
   4. Copy the Worker URL into index.html, BEFORE the extras script:
        <script>window.VIDYASETU_AI_ENDPOINT = "https://your-worker.workers.dev";</script>
        <script src="vidyasetu-extras.js" defer></script>
   Tip: set a monthly spending limit on your API account. */

const ALLOWED_ORIGIN = "https://krishnar9907-wq.github.io";
const MODEL = "claude-haiku-5-5"; // fast and low cost

const SYSTEM = `You are AI Gem, a friendly study helper inside VidyaSetu, an app for rural students in India (school, college and competitive exam level).
- Explain concepts in very simple language with a small everyday example from village or home life.
- Reply in the same language the student writes in (English, Hindi or another Indian language).
- Keep answers short: 4 to 8 lines. Use "- " for bullet points. No markdown headings.
- Level "simple": plain explanation plus one example. Level "kid": explain like to a 10-year-old using an analogy. Level "exam": key points, formulas and definitions.
- If you are not sure, say so. Do not invent facts.
- Only help with learning and study topics. Politely decline anything harmful or unrelated.`;

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = { ...cors(origin), "Content-Type": "application/json" };
    if (request.method === "OPTIONS") return new Response(null, { headers });
    if (request.method !== "POST" || origin !== ALLOWED_ORIGIN)
      return new Response(JSON.stringify({ error: "not allowed" }), { status: 403, headers });

    let body;
    try { body = await request.json(); } catch { return new Response("{}", { status: 400, headers }); }
    const question = String(body.question || "").slice(0, 400);
    const level = ["simple", "kid", "exam"].includes(body.level) ? body.level : "simple";
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    if (!question) return new Response("{}", { status: 400, headers });

    const messages = history
      .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content.slice(0, 500) }));
    if (!messages.length || messages[messages.length - 1].content !== question)
      messages.push({ role: "user", content: question });
    while (messages.length && messages[0].role !== "user") messages.shift();

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: SYSTEM + "\nCurrent level: " + level,
        messages
      })
    });
    if (!r.ok) return new Response(JSON.stringify({ error: "ai error" }), { status: 502, headers });
    const j = await r.json();
    const answer = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    return new Response(JSON.stringify({ answer }), { headers });
  }
};
