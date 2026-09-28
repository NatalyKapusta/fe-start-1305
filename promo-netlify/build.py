"""Збирає сайт для Netlify: promo.vitamincentr.pl.ua

Структура готового сайту:
  /  — лендинг «Клубна картка — тільки тренажерний зал» у корені піддомену

Запуск: python3 promo-netlify/build.py <куди-покласти-zip>
Результат — zip-архів, який перетягується на app.netlify.com (Deploys).
"""
import os
import shutil
import sys
import zipfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_ZIP = os.path.join(sys.argv[1], 'promo-vitamin-netlify.zip')

# Шлях на сайті → папка лендингу ('' — корінь піддомену)
LANDINGS = {
    '': 'gym-landing',
}
# Файли, які на сайт не потрібні
SKIP = {'brief.md', 'poster.webp', 'poster.jpg', '.DS_Store'}
SKIP_DIRS = {'weblium'}

with zipfile.ZipFile(OUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
    for url_path, folder in LANDINGS.items():
        src = os.path.join(REPO, folder)
        # Беремо тільки ті картинки, на які є посилання в HTML/CSS
        used = open(os.path.join(src, 'index.html'), encoding='utf-8').read() + \
            open(os.path.join(src, 'style', 'style.css'), encoding='utf-8').read()
        for root, dirs, files in os.walk(src):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for name in files:
                if name in SKIP:
                    continue
                if os.path.basename(root) == 'img' and 'img/' + name not in used:
                    continue
                full = os.path.join(root, name)
                z.write(full, os.path.join('promo-vitamin', url_path, os.path.relpath(full, src)))

print('OK:', OUT_ZIP, os.path.getsize(OUT_ZIP) // 1024, 'KB')
