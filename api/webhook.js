export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({
      ok: false,
      error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID"
    });
  }

  try {
    const body = req.body || {};

    const title = String(body.title || "").trim();
    const ticker = String(body.ticker || "").trim();
    const action = String(body.action || "").trim();
    const comment = String(body.comment || "").trim();
    const message = String(body.message || "").trim();

    const lines = [title, ticker, action, comment, message].filter(Boolean);
    const text = lines.join("\n");

    if (!text) {
      return res.status(400).json({
        ok: false,
        error: "Empty alert payload"
      });
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text
      })
    });

    const tgData = await tgRes.json();

    if (!tgRes.ok) {
      return res.status(500).json({
        ok: false,
        error: "Telegram API error",
        telegram: tgData
      });
    }

    return res.status(200).json({
      ok: true,
      telegram: tgData
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
