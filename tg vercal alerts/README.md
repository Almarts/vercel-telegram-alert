# Vercel TradingView -> Telegram Webhook

## 1. Что делает
Этот endpoint принимает webhook из TradingView и пересылает алерт в Telegram-канал через вашего бота.

## 2. Структура
- `api/webhook.js` — serverless endpoint
- `vercel.json` — runtime config
- `package.json` — ESM config

## 3. Переменные окружения в Vercel
Добавьте в Project Settings -> Environment Variables:
- `TELEGRAM_BOT_TOKEN` = токен бота от BotFather
- `TELEGRAM_CHAT_ID` = id канала или группы (например `-100xxxxxxxxxx`)

## 4. Как задеплоить
1. Загрузите папку в GitHub.
2. Import Project в Vercel.
3. Добавьте env vars.
4. Deploy.
5. Ваш webhook URL будет таким:
   `https://YOUR-PROJECT.vercel.app/api/webhook`

## 5. Сообщение из TradingView
В alert message лучше отправлять JSON:

```json
{
  "title": "New signal",
  "ticker": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": "{{close}}",
  "take_profit": "0.1840",
  "time": "{{timenow}}",
  "message": "Lite version alert on XLMUSDT"
}
```

## 6. Настройка в TradingView
- Create Alert
- Condition: ваша стратегия
- Webhook URL: `https://YOUR-PROJECT.vercel.app/api/webhook`
- Message: JSON выше

## 7. Как получить chat id канала
1. Добавьте бота админом в канал.
2. Отправьте сообщение в канал.
3. Откройте:
   `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Найдите `chat.id`.

## 8. Важный момент
Для приватного канала бот должен быть администратором, иначе сообщение не отправится.