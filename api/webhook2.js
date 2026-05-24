export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const BOT_TOKEN = process.env.WEBHOOK2_TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.WEBHOOK2_TELEGRAM_CHAT_ID;
  const THREAD_ID = process.env.WEBHOOK2_TELEGRAM_THREAD_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({
      ok: false,
      error: "Missing WEBHOOK2_TELEGRAM_BOT_TOKEN or WEBHOOK2_TELEGRAM_CHAT_ID"
    });
  }

  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body || "{}")
      : (req.body || {});

    const ticker  = String(body.ticker || "").trim();
    const side    = String(body.side || "").trim();
    const event   = String(body.event || "").trim();
    const entry   = String(body.entry || "").trim();
    const sl      = String(body.sl || "").trim();
    const tp      = String(body.tp || "").trim();
    const exit    = String(body.exit || "").trim();
    const message = String(body.message || "").trim();

    let text = "";

    if (message) {
      text = `ℹ️ <b>${message}</b>`;
    } else if (event === "ENTRY") {
      const emoji = side === "LONG" ? "🟢" : side === "SHORT" ? "🔴" : "⚪";
      text = `${emoji} <b>${ticker} ${side}</b>\n\n📌 Event: <b>${event}</b>\n📥 Entry: <b>${entry}</b>\n🛑 SL: <b>${sl}</b>\n🎯 TP: <b>${tp}</b>`;
    } else if (ticker && event && exit) {
      text = `📤 <b>${ticker}</b>\n\n🏁 Event: <b>${event}</b>\n💰 Exit: <b>${exit}</b>`;
    }

    if (!text) {
      return res.status(400).json({
        ok: false,
        error: "Unsupported or empty alert payload",
        body
      });
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...(THREAD_ID ? { message_thread_id: Number(THREAD_ID) } : {})
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        ok: false,
        error: "Telegram API error",
        result: data
      });
    }

    return res.status(200).json({ ok: true, result: data });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
