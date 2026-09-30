# promo.vitamincentr.pl.ua — як усе влаштовано

Лендинг «Клубна картка — тільки тренажерний зал» (`gym-landing/`) опублікований на Netlify.

## Публікація
1. `python3 promo-netlify/build.py <папка>` → `promo-vitamin-netlify.zip`.
2. Netlify → проект `bucolic-daffodil-2b3b91` → Project overview → «Already built it?» → перетягнути zip.

## Домен
- Weblium → Домени → DNS-записи `vitamincentr.pl.ua`:
  - `CNAME promo → bucolic-daffodil-2b3b91.netlify.app`
  - `TXT subdomain-owner-verification` — підтвердження для Netlify
- HTTPS видає Netlify автоматично.

## Заявки
Форма → Netlify Forms (форма `tilky-zal`, Form detection увімкнено).
Netlify → Forms → Submission notifications:
- **Email** → пошта власника;
- **HTTP POST** → Google Apps Script (`telegram-apps-script.js`) → Telegram-бот `@Vitaminpoltavabot`.
  Адреса скрипта в Netlify має закінчуватися на `?key=<SECRET_KEY>`.

⚠️ Токен бота, chat_id і ключ зберігаються тільки в Google Apps Script і в налаштуваннях Netlify,
**не в цьому (публічному) репозиторії**.

## Meta Pixel
ID `471147581311534`, тільки на лендингу.
- `PageView` — при відкритті сторінки;
- `Lead` — тільки після того, як Netlify підтвердив прийом заявки, один раз на заявку.

## Посилання для реклами
`https://promo.vitamincentr.pl.ua/?utm_source=instagram&utm_campaign=tilky-zal`
