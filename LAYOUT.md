# PANINI repository layout

Copyright (C) 1993-2026 Abhishek Choudhary  
SPDX-License-Identifier: GPL-3.0-or-later

GitHub Pages publishes **`docs/` only**. Do not put the site in `website/`.

```
spec/            constitution (do not rewrite PANINI_SELF_HOSTING_SPEC.pni)
src/             CLI + PANINI-written sources (frontends in src/panini/)
compiler/        Stage-0 JS lexer/parser/IR
runtime/         interpreter, VFS, shaili.js, gurmukhi.js, romenagri.js
stdlib/          .pni libraries
retrieved/       READ-ONLY vendor: APCISR, Romenagri, Hindawi guru, Punjabi TSVs
cyclers/         zistgah/cycles corpus (not rewritten)
examples/        runnable samples including punjabi_hello.uhin
tests/           panini torture, iso/c, …
docs/            GitHub Pages site (index, view.html, hindawi, punjabi, workbench)
scripts/         harnesses
languages/       museum stubs (not ISO-green frontends)
website/         obsolete; see docs/
```

Hindawi localization lives under `retrieved/` + `runtime/shaili.js` (Hindi/guru)
and `runtime/gurmukhi.js` (Punjabi/Gurmukhi). Keyword tables in `docs/tools.js`
are **not** Hindawi.
