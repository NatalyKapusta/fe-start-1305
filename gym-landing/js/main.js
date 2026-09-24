// Куди відправляти заявки (Formspree, Google Apps Script, CRM тощо).
// Поки порожньо — форма працює в демо-режимі і заявки нікуди не йдуть.
const FORM_ENDPOINT = '';

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

// Маска телефону: +380 XX XXX XX XX
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

function showError(input, message) {
    input.classList.add('is-invalid');
    errorBox.textContent = message;
    input.focus();
}

form.addEventListener('submit', async function (event) {
    event.preventDefault();
    nameInput.classList.remove('is-invalid');
    phoneInput.classList.remove('is-invalid');
    errorBox.textContent = '';

    const name = nameInput.value.trim();
    phoneInput.value = formatPhone(phoneInput.value);
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
        offer: 'Клубна картка — тільки тренажерний зал',
        page: location.href,
        ...utm,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Відправляємо...';

    try {
        if (FORM_ENDPOINT) {
            const response = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Помилка ' + response.status);
            }
        } else {
            console.warn('FORM_ENDPOINT не налаштований. Заявка:', data);
        }

        // Подія для Meta Pixel — реклама навчається на заявках
        if (typeof fbq === 'function') {
            fbq('track', 'Lead');
        }

        form.hidden = true;
        successBox.hidden = false;
    } catch (error) {
        errorBox.textContent = 'Не вдалося відправити. Зателефонуйте нам: +38 (050) 404 79 89';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Відправити';
    }
});

// Ховаємо нижню кнопку, поки на екрані перший блок або форма
const stickyCta = document.querySelector('.sticky-cta');
const visible = new Set();

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                visible.add(entry.target);
            } else {
                visible.delete(entry.target);
            }
        });
        stickyCta.classList.toggle('is-hidden', visible.size > 0);
    });
    observer.observe(document.getElementById('hero'));
    observer.observe(document.getElementById('form'));
}
