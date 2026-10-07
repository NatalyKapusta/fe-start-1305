// Куди відправляти заявки:
// — форма з data-send="netlify" на Netlify → заявки приймає сам Netlify (нічого вказувати не треба);
// — інакше адреса Google Apps Script / CRM у FORM_ENDPOINT;
// — файл, відкритий з компʼютера (file://), працює в демо-режимі.
const FORM_ENDPOINT = '';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Форма заявки ---------- */

const form = document.getElementById('lead-form');
const nameInput = form.elements.name;
const phoneInput = form.elements.phone;
const errorBox = document.getElementById('form-error');
const successBox = document.getElementById('form-success');
const submitBtn = form.querySelector('button[type="submit"]');

// UTM-мітки з реклами (Instagram / Facebook), щоб бачити, звідки заявка
const utm = {};
new URLSearchParams(location.search).forEach(function (value, key) {
    if (key.startsWith('utm_') || key === 'fbclid') {
        utm[key] = value;
    }
});

// Формат телефону: +380 XX XXX XX XX
function formatPhone(value) {
    let rest = value.replace(/\D/g, '');

    // Відрізаємо код країни в будь-якому вигляді: 380..., 80..., 0...
    if (rest.startsWith('380')) {
        rest = rest.slice(3);
    } else if (rest.startsWith('80')) {
        rest = rest.slice(2);
    }
    // Код оператора не починається з 0, тож «050» → «50»
    rest = rest.replace(/^0/, '');

    const digits = ('380' + rest).slice(0, 12);

    const parts = [
        '+' + digits.slice(0, 3),
        digits.slice(3, 5),
        digits.slice(5, 8),
        digits.slice(8, 10),
        digits.slice(10, 12),
    ];
    return parts.filter(Boolean).join(' ');
}

// Під час введення лишаємо тільки цифри, пробіли та «+»,
// а у формат +380 XX XXX XX XX приводимо, коли людина виходить з поля
phoneInput.addEventListener('input', function () {
    phoneInput.value = phoneInput.value.replace(/[^\d+\s()-]/g, '');
});

phoneInput.addEventListener('blur', function () {
    if (phoneInput.value.trim()) {
        phoneInput.value = formatPhone(phoneInput.value);
    }
});

// Захист від дублів: поки заявка відправляється, повторне натискання ігнорується,
// а подія Lead відправляється в Meta Pixel тільки один раз
let isSending = false;
let leadTracked = false;

// Подія Lead — тільки після того, як сервер підтвердив, що заявку прийнято
function trackLead() {
    if (leadTracked) {
        return;
    }
    leadTracked = true;
    if (typeof fbq === 'function') {
        fbq('track', 'Lead');
    }
}

// Що обрала людина: картка чи гостьовий. Потрапляє в заголовок заявки
function chosenOffer() {
    const choice = form.querySelector('input[name="interest"]:checked');
    return choice ? choice.dataset.offer : form.dataset.offer;
}

// Кнопки «Хочу картку» / «Хочу на гостьовий» одразу відмічають потрібний варіант у формі
document.querySelectorAll('[data-choice]').forEach(function (link) {
    link.addEventListener('click', function () {
        const value = link.dataset.choice === 'guest' ? 'Пробний день' : 'Клубна картка';
        const radio = form.querySelector('input[name="interest"][value="' + value + '"]');
        if (radio) {
            radio.checked = true;
        }
    });
});

function showError(input, message) {
    input.classList.add('is-invalid');
    errorBox.textContent = message;
    input.focus();
}

form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (isSending || leadTracked) {
        return;
    }
    nameInput.classList.remove('is-invalid');
    phoneInput.classList.remove('is-invalid');
    errorBox.textContent = '';

    const name = nameInput.value.trim();
    if (phoneInput.value.trim()) {
        phoneInput.value = formatPhone(phoneInput.value);
    }
    const phone = phoneInput.value.replace(/\D/g, '');

    if (name.length < 2) {
        showError(nameInput, "Вкажіть, будь ласка, ваше ім'я");
        return;
    }
    if (phone.length !== 12) {
        showError(phoneInput, 'Вкажіть номер телефону повністю');
        return;
    }

    const data = {
        name: name,
        phone: '+' + phone,
        offer: chosenOffer(),
        page: location.href,
        ...utm,
    };

    isSending = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Відправляємо...';

    // Бот заповнив приховане поле — робимо вигляд, що все добре, і нічого не шлемо
    const trap = form.elements['bot-field'];
    const isBot = trap && trap.value;

    try {
        // true — сервер підтвердив, що заявку збережено
        let confirmed = false;

        if (isBot || location.protocol === 'file:') {
            console.warn('Демо-режим: заявка не відправляється.', data);
        } else if (FORM_ENDPOINT) {
            const response = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                // text/plain — щоб Google Apps Script прийняв запит без preflight
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Помилка ' + response.status);
            }
            confirmed = true;
        } else if (form.dataset.send === 'netlify') {
            // data-netlify Netlify прибирає зі сторінки, тому перевіряємо власну мітку.
            // Заповнюємо службові поля і шлемо форму як звичайну
            Object.keys(data).forEach(function (key) {
                if (form.elements[key] && form.elements[key].type === 'hidden') {
                    form.elements[key].value = data[key];
                }
            });
            form.elements.phone.value = data.phone;
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(new FormData(form)).toString(),
            });
            if (!response.ok) {
                throw new Error('Помилка ' + response.status);
            }
            confirmed = true;
        } else {
            console.warn('FORM_ENDPOINT не налаштований. Заявка:', data);
        }

        // Meta Pixel: Lead — лише коли заявку справді прийнято сервером
        if (confirmed) {
            trackLead();
        }

        form.hidden = true;
        successBox.hidden = false;
    } catch (error) {
        errorBox.textContent = 'Не вдалося відправити. Спробуйте ще раз за хвилину.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Відправити';
    } finally {
        isSending = false;
    }
});

/* ---------- Анімації ---------- */

// Цифри «набігають» від 0 до потрібного значення
function countUp(el) {
    const target = Number(el.dataset.count);
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
        const progress = Math.min(Math.max((now - start) / duration, 0), 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased).toLocaleString('uk-UA');
        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    }
    requestAnimationFrame(tick);
}

const counters = document.querySelectorAll('[data-count]');
const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !reduceMotion) {
    const counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                countUp(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });
    counters.forEach(function (el) {
        counterObserver.observe(el);
    });

    // Блоки плавно зʼявляються при прокрутці
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach(function (el) {
        revealObserver.observe(el);
    });
} else {
    revealItems.forEach(function (el) {
        el.classList.add('is-visible');
    });
}

// Стрічка фото їде по колу: дублюємо фото, щоб не було розриву
const gallery = document.querySelector('.gallery');

if (gallery && !reduceMotion) {
    Array.from(gallery.children).forEach(function (img) {
        const copy = img.cloneNode();
        copy.alt = '';
        copy.setAttribute('aria-hidden', 'true');
        gallery.appendChild(copy);
    });
}

/* ---------- Кнопка внизу екрана на телефоні ---------- */

// Ховаємо, поки на екрані перший блок або форма
const stickyCta = document.querySelector('.sticky-cta');
const visibleBlocks = new Set();

if ('IntersectionObserver' in window) {
    const ctaObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                visibleBlocks.add(entry.target);
            } else {
                visibleBlocks.delete(entry.target);
            }
        });
        stickyCta.classList.toggle('is-hidden', visibleBlocks.size > 0);
    });
    ctaObserver.observe(document.getElementById('hero'));
    ctaObserver.observe(document.getElementById('form'));
}
