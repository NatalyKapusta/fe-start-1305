"""Збирає лендинг для блоку «Сторонній код» у Weblium.

Скрипт бере gym-landing і створює ОДИН файл vitamin-tilky-zal.html,
який цілком вставляється у вкладку «Фрагмент коду / HTML»:
  <style>  — стилі, усі селектори сховані під .vtm, щоб не ламати сайт
  <div>    — розмітка лендингу
  <script> — скрипт, шукає елементи тільки всередині лендингу

Картинки беруться з GitHub через CDN jsDelivr (репозиторій публічний).
Запуск: python3 gym-landing/weblium/build.py <commit-hash>
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(HERE)
COMMIT = sys.argv[1]
CDN = f'https://cdn.jsdelivr.net/gh/NatalyKapusta/fe-start-1305@{COMMIT}/gym-landing/img/'

ROOT = '.vtm'
IDS = ['hero', 'form', 'lead-form', 'form-error', 'form-success']
KEYFRAMES = ['fade-up', 'slow-zoom', 'spin', 'glow', 'pulse', 'gallery-move', 'shake', 'shine']


def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()


def write(name, text):
    with open(os.path.join(HERE, name), 'w', encoding='utf-8') as f:
        f.write(text)


# ---------- CSS ----------

def prefix_selector(selector):
    parts = []
    for part in selector.split(','):
        part = part.strip()
        if not part:
            continue
        if part == 'html':
            continue
        if part in (':root', 'body'):
            parts.append(ROOT)
        elif part.startswith('.js '):
            parts.append(ROOT + '.js ' + part[4:])
        else:
            parts.append(ROOT + ' ' + part)
    return ',\n'.join(parts)


def split_blocks(css):
    """Ділить CSS на блоки верхнього рівня: (заголовок, тіло)."""
    blocks = []
    i = 0
    while True:
        start = css.find('{', i)
        if start == -1:
            break
        head = css[i:start].strip()
        depth = 1
        j = start + 1
        while depth:
            if css[j] == '{':
                depth += 1
            elif css[j] == '}':
                depth -= 1
            j += 1
        blocks.append((head, css[start + 1:j - 1]))
        i = j
    return blocks


def transform(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out = []
    for head, body in split_blocks(css):
        if head.startswith('@keyframes'):
            out.append(f'{head} {{{body}}}')
        elif head.startswith('@media'):
            out.append(f'{head} {{\n{transform(body)}\n}}')
        else:
            selector = prefix_selector(head)
            if selector:
                out.append(f'{selector} {{{body}}}')
    return '\n\n'.join(out)


css = transform(read('style/reset.css')) + '\n\n' + transform(read('style/style.css'))

# Обгортка поводиться як body; шапка позиціонується відносно неї
css = css.replace(f'{ROOT} {{', f'{ROOT} {{\n    position: relative;\n    text-align: left;', 1)

# Заголовки й текст не беруть колір і шрифт із загальних стилів сайту
css += '''

.vtm h1,
.vtm h2,
.vtm h3,
.vtm p,
.vtm li,
.vtm label,
.vtm span,
.vtm summary {
    color: inherit;
    letter-spacing: inherit;
}'''

# Унікальні імена анімацій, щоб не перетнутися з сайтом
for name in KEYFRAMES:
    css = re.sub(r'@keyframes ' + name + r'\b', '@keyframes vtm-' + name, css)
    css = re.sub(r'(animation:\s*)' + name + r'\b', r'\1vtm-' + name, css)

css = re.sub(r"url\('\.\./img/([^']+)'\)", lambda m: f"url('{CDN}{m.group(1)}')", css)


# ---------- HTML ----------

html = read('index.html')
body = html[html.index('<body>') + 6:html.index('</body>')]
body = re.sub(r'\s*<script src="[^"]+"></script>', '', body)
body = re.sub(r'(src|href)="img/([^"]+)"', lambda m: f'{m.group(1)}="{CDN}{m.group(2)}"', body)
for id_ in IDS:
    body = body.replace(f'id="{id_}"', f'id="vtm-{id_}"')
body = body.replace('href="#form"', 'href="#vtm-form"')

fonts = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800'
         '&family=Oswald:wght@500;700&display=swap" rel="stylesheet">\n')

markup = '<div class="vtm" id="vtm">' + body.rstrip() + '\n</div>\n'

# ---------- JS ----------

js = read('js/main.js')
endpoint = re.search(r"^const FORM_ENDPOINT = .*$", js, flags=re.M).group(0)
js = js.replace(endpoint + '\n', '')
js = js.replace('document.getElementById(', 'root.querySelector(')
for id_ in IDS:
    js = js.replace(f"root.querySelector('{id_}')", f"root.querySelector('#vtm-{id_}')")
js = js.replace('document.querySelector(', 'root.querySelector(')
js = js.replace('document.querySelectorAll(', 'root.querySelectorAll(')
js = '\n'.join(('    ' + line) if line else line for line in js.strip().split('\n'))

script = (endpoint.replace('const', 'var') + '\n\n'
          '(function () {\n'
          "    var root = document.getElementById('vtm');\n"
          '    if (!root) {\n'
          '        return;\n'
          '    }\n'
          "    root.classList.add('js');\n\n"
          + js + '\n})();\n')

write('vitamin-tilky-zal.html',
      '<!-- Vitamin — «Тільки тренажерний зал». Вставити цілком у «Фрагмент коду / HTML» -->\n'
      + fonts
      + '<style>\n' + css + '\n</style>\n\n'
      + markup
      + '\n<script>\n' + script + '</script>\n')

print('OK:', os.path.getsize(os.path.join(HERE, 'vitamin-tilky-zal.html')) // 1024, 'KB')
