/**
 * Заявки з лендингу (Netlify Forms) → Telegram.
 *
 * Як працює: Netlify після кожної заявки робить POST на адресу цього скрипта
 * (Forms → Submission notifications → HTTP POST request), скрипт надсилає
 * повідомлення боту в Telegram.
 *
 * Куди вставляти: script.google.com → New project → вставити цей код цілком.
 * Deploy → New deployment → Web app: Execute as — Me, Who has access — Anyone.
 *
 * ⚠️ Токен бота і ключ НЕ зберігати в публічному репозиторії —
 * вписувати тільки в Google Apps Script.
 */

// Токен від @BotFather, наприклад 1234567890:AAE...
var TELEGRAM_TOKEN = 'ВСТАВТЕ_ТОКЕН_БОТА';

// Кому надсилати: ваш chat_id або id групи (у групи він починається з мінуса)
var TELEGRAM_CHAT_ID = 'ВСТАВТЕ_CHAT_ID';

// Секретний ключ: має збігатися з ?key=... в адресі, яку вказуєте в Netlify.
// Без нього будь-хто, хто дізнається адресу, міг би слати спам у бот.
var SECRET_KEY = 'ВСТАВТЕ_КЛЮЧ';

function doPost(e) {
    if (!e || !e.parameter || e.parameter.key !== SECRET_KEY) {
        return reply({ ok: false, error: 'forbidden' });
    }

    var body = {};
    try {
        body = JSON.parse(e.postData.contents);
    } catch (err) {
        return reply({ ok: false, error: 'bad json' });
    }

    // Netlify кладе поля форми в body.data
    var data = body.data || {};

    // Netlify не розуміє переадресацію, яку повертає Google, і повторює той самий запит.
    // Запамʼятовуємо id заявки на 6 годин і повтори ігноруємо: одна заявка — одне повідомлення.
    var id = body.id || [data.name, data.phone, body.created_at].join('|');
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
        var cache = CacheService.getScriptCache();
        if (cache.get('lead:' + id)) {
            return reply({ ok: true, duplicate: true });
        }
        cache.put('lead:' + id, '1', 21600);
    } finally {
        lock.releaseLock();
    }

    sendToTelegram(formatMessage(data, body));
    return reply({ ok: true });
}

// Перевірка, що скрипт опублікований: відкрийте адресу в браузері
function doGet() {
    return reply({ ok: true, message: 'Скрипт працює' });
}

function formatMessage(data, body) {
    var phone = String(data.phone || '').trim();
    var lines = [
        '🔥 <b>Нова заявка</b> — ' + escapeHtml(data.offer || body.form_name || 'лендинг'),
        '',
        '👤 Імʼя: <b>' + escapeHtml(data.name || '—') + '</b>',
        '📞 Телефон: <b>' + escapeHtml(phone || '—') + '</b>',
    ];

    var source = [data.utm_source, data.utm_campaign, data.utm_content]
        .filter(function (v) { return v; })
        .map(escapeHtml)
        .join(' / ');
    if (source) {
        lines.push('📣 Реклама: ' + source);
    }

    var time = Utilities.formatDate(
        body.created_at ? new Date(body.created_at) : new Date(),
        'Europe/Kyiv',
        'dd.MM.yyyy HH:mm'
    );
    lines.push('🕒 ' + time);

    return lines.join('\n');
}

function sendToTelegram(text) {
    UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        }),
        muteHttpExceptions: true,
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function reply(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}

// Ручна перевірка з редактора Apps Script: оберіть testMessage → Run.
// У Telegram має прийти тестове повідомлення.
function testMessage() {
    sendToTelegram(formatMessage(
        { name: 'Тест', phone: '+380501234567', offer: 'Клубна картка — тільки тренажерний зал', utm_source: 'instagram', utm_campaign: 'tilky-zal' },
        { created_at: new Date().toISOString() }
    ));
}
