export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const BOT_TOKEN_1 = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID_1   = process.env.TELEGRAM_CHAT_ID;
  const BOT_TOKEN_2 = process.env.TELEGRAM_BOT_TOKEN_2;
  const CHAT_ID_2   = process.env.TELEGRAM_CHAT_ID_2;
  const THREAD_ID_2 = process.env.TELEGRAM_THREAD_ID_2;

  if (!BOT_TOKEN_1 || !CHAT_ID_1) {
    return res.status(500).json({
      ok: false,
      error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID"
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

    const ticker = String(body.ticker || "").trim();
    const side   = String(body.side   || "").trim();
    const entry  = String(body.entry  || "").trim();
    const sl     = String(body.sl     || "").trim();
    const tp     = String(body.tp     || "").trim();

    if (!ticker) {
      return res.status(400).json({ ok: false, error: "Empty alert payload" });
    }

    const emoji = side === "LONG" ? "🟢" : "🔴";
    const text  = `${emoji} <b>${ticker} ${side}</b>\n\n📥 Entry: <b>${entry}</b>\n🛑 SL: <b>${sl}</b>\n🎯 TP: <b>${tp}</b>`;

    const sends = [
      fetch(`https://api.telegram.org/bot${BOT_TOKEN_1}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID_1,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true
        })
      })
    ];

    if (BOT_TOKEN_2 && CHAT_ID_2) {
      const payload2 = {
        chat_id: CHAT_ID_2,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...(THREAD_ID_2 ? { message_thread_id: Number(THREAD_ID_2) } : {})
      };
      sends.push(
        fetch(`https://api.telegram.org/bot${BOT_TOKEN_2}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload2)
        })
      );
    }

    const results = await Promise.all(sends);
    const data    = await Promise.all(results.map(r => r.json()));

    const allOk = results.every(r => r.ok);
    if (!allOk) {
      return res.status(500).json({ ok: false, error: "Telegram API error", results: data });
    }

    return res.status(200).json({ ok: true, results: data });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
