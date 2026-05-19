export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ ok: false, error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

    const ticker = String(body.ticker || "").trim();
    const side   = String(body.side || "").trim();
    const entry  = String(body.entry || "").trim();
    const sl     = String(body.sl || "").trim();
    const tp     = String(body.tp || "").trim();

    if (!ticker) {
      return res.status(400).json({ ok: false, error: "Empty alert payload" });
    }

    const emoji = side === "LONG" ? "🟢" : "🔴";
    const text = `${emoji} <b>${ticker} ${side}</b>\n\n📥 Entry: <b>${entry}</b>\n🛑 SL: <b>${sl}</b>\n🎯 TP: <b>${tp}</b>`;

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });

    const tgData = await tgRes.json();

    if (!tgRes.ok) {
      return res.status(500).json({ ok: false, error: "Telegram API error", telegram: tgData });
    }

    return res.status(200).json({ ok: true, telegram: tgData });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
