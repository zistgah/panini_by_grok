# PANINI repository layout

Copyright (C) 1993-2026 Abhishek Choudhary  
SPDX-License-Identifier: GPL-3.0-or-later

GitHub Pages publishes **`docs/` only**.

```
docs/                 Pages site
  index.html          entry (not the workbench)
  nb.html             Hindawi notebook UI (browser-native PANINI)
  engine/             flatten + language bundle + nb.js
  hindawi.html        Devanagari flow
  punjabi.html        Gurmukhi lexer transducer
  perso_arabic.html   manual urdu_map / fltr_ur_hi
  workbench.html      Monaco IDE
  ARCHITECT_PROMPTS.md
retrieved/            READ-ONLY: APCISR, Romenagri, Hindawi shailis, notebooks pointer
runtime/              Node: hindawi.js, shailis.js, transducer.js, perso_arabic.js, flatten via bundle
src/                  CLI
compiler/             Stage-0 JS
spec/                 PANINI_SELF_HOSTING_SPEC.pni (do not rewrite)
examples/             punjabi_c.uhin and peers
tests/ scripts/ stdlib/ cyclers/
```

Brahmi: `flatten_uni_dev.lex` → Devanagari hub, table-complete round-trip.
Perso-Arabic: `urdu_map.csv` + `fltr_ur_hi`, lossy; linguistics residue.
