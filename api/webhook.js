export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID_1 = process.env.TELEGRAM_CHAT_ID;
  const CHAT_ID_2 = process.env.TELEGRAM_CHAT_ID_2;

  if (!BOT_TOKEN || !CHAT_ID_1 || !CHAT_ID_2) {
    return res.status(500).json({
      ok: false,
      error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID / TELEGRAM_CHAT_ID_2"
    });
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

    const payload1 = {
      chat_id: CHAT_ID_1,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    };

    const payload2 = {
      chat_id: CHAT_ID_2,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    };

    const [tgRes1, tgRes2] = await Promise.all([
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload1)
      }),
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload2)
      })
    ]);

    const tgData1 = await tgRes1.json();
    const tgData2 = await tgRes2.json();

    if (!tgRes1.ok || !tgRes2.ok) {
      return res.status(500).json({
        ok: false,
        error: "Telegram API error",
        telegram1: tgData1,
        telegram2: tgData2
      });
    }

    return res.status(200).json({
      ok: true,
      telegram1: tgData1,
      telegram2: tgData2
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
