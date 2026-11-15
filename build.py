"""Assemble index.html from src/. Run: python3 build.py"""
from pathlib import Path
src = Path(__file__).parent / 'src'
read = lambda n: (src / n).read_text()
strip = lambda t: '\n'.join(l for l in t.split('\n') if not l.startswith('if(typeof module'))
page = read('page.src.html')
for marker, text in [('/*ENGINE*/', strip(read('engine.js'))), ('/*NOUNDATA*/', strip(read('nouns.js'))),
                     ('/*ADJDATA*/', read('adjs.js')), ('/*CTX*/', read('ctx.js')),
                     ('/*NOMINALUI*/', read('nominal-ui.js')), ('/*TB*/', read('tb.js'))]:
    assert marker in page, marker
    page = page.replace(marker, text)
import json, re
page = re.sub(r'<title>.*?</title>\n?', '', page, count=1)  # the page's own title moves into <head> below
URL = 'https://greekdrills.ijfen.com/'
TITLE = 'Greek Drills: Ancient Greek Paradigm and Parsing Practice'
DESC = ('Free Ancient Greek paradigm drills for verbs, participles, nouns, pronouns and adjectives: parse, '
        'multiple choice and typing, with presets by chapter for Athenaze, Mollin & Williamson, Hansen & Quinn, '
        'Mastronarde and Reading Greek.')
LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Greek Drills",
  "url": URL,
  "description": DESC,
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Any (web browser)",
  "isAccessibleForFree": True,
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
  "inLanguage": "en",
  "about": {"@type": "Language", "name": "Ancient Greek", "alternateName": "grc"},
  "keywords": "Ancient Greek, paradigms, parsing, declension, conjugation, morphology, participles, Athenaze, Mollin and Williamson, Hansen and Quinn, Mastronarde, Reading Greek",
  "creator": {"@type": "Person", "name": "IJFEN", "url": "https://ijfen.com"}
}
esc = lambda t: t.replace('&', '&amp;').replace('"', '&quot;')
head = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
        f'<title>{TITLE}</title>\n'
        f'<meta name="description" content="{esc(DESC)}">\n'
        f'<link rel="canonical" href="{URL}">\n'
        '<meta property="og:type" content="website">\n'
        '<meta property="og:site_name" content="Greek Drills">\n'
        f'<meta property="og:title" content="{esc(TITLE)}">\n'
        f'<meta property="og:description" content="{esc(DESC)}">\n'
        f'<meta property="og:url" content="{URL}">\n'
        '<meta name="twitter:card" content="summary">\n'
        '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Ctext y=%27.9em%27 font-size=%2790%27%3E%F0%9F%8F%BA%3C/text%3E%3C/svg%3E">\n'
        f'<script type="application/ld+json">{json.dumps(LD, ensure_ascii=False)}</script>\n'
        # In a normal browser tab the browser's own toolbar covers the notch, so drop the top safe-area band
        '<style>body::before{content:none!important}.bar{top:0!important}</style>\n</head>\n<body>\n')
(Path(__file__).parent / 'index.html').write_text(head + page + '\n</body>\n</html>\n')
print('wrote index.html')
