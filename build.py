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
head = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
        # In a normal browser tab the browser's own toolbar covers the notch, so drop the top safe-area band
        '<style>body::before{content:none!important}.bar{top:0!important}</style>\n</head>\n<body>\n')
(Path(__file__).parent / 'index.html').write_text(head + page + '\n</body>\n</html>\n')
print('wrote index.html')
