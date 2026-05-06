export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(500).json({ ok: false, error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    const lines = [
      '🐋 <b>WHALE DCA PRO</b>',
      '',
      payload.title ? `<b>Signal:</b> ${payload.title}` : null,
      payload.ticker ? `<b>Ticker:</b> ${payload.ticker}` : null,
      payload.action ? `<b>Action:</b> ${payload.action}` : null,
      payload.price ? `<b>Price:</b> ${payload.price}` : null,
      payload.take_profit ? `<b>Take Profit:</b> ${payload.take_profit}` : null,
      payload.time ? `<b>Time:</b> ${payload.time}` : null,
      payload.message ? '' : null,
      payload.message ? payload.message : null
    ].filter(Boolean);

    const text = lines.join('\n');

    const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const tgData = await tgResponse.json();

    if (!tgResponse.ok) {
      return res.status(500).json({ ok: false, telegram: tgData });
    }

    return res.status(200).json({ ok: true, telegram: tgData.result?.message_id || true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
