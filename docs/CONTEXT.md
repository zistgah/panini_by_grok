# tree-rev: 2026.08.28
# CONTEXT.md

Copyright (C) 1993-2026 Abhishek Choudhary  
SPDX-License-Identifier: GPL-3.0-or-later  
Tree-rev: 2026.08.28

## What this repository is

PANINI is a computational language and L15 workbench whose point is **linguistic equity**:

- Representational equity ↔ ILM (script is a projection)
- Computational equity ↔ PANINI (compute in that substrate)
- Linguistic equity = both

It sits in the Hindawi / AyeAI / ILM line of work: programming and systems in the operator’s language, not only through an English-centric toolchain.

See docs/LINGUISTIC_EQUITY.md (architecture, not a social initiative).
Estate: docs/ESTATE.md is retrieved, not a live walk (105 orgs / 486 repos). TRUST ME on handed artifacts.
This sibling retrieves Hindawi (gurucc → gcc → hin.exe, 2004) and hosts a Pages projection of the same pipeline. PANINI .pni T0 is a JS self-host. See docs/CAN_COMPILE.md.

## What the JS tree is

A Stage-0 bootstrap plus additive layers (v2/v3 workbench, frontends, VFS, VT100).  
Self-host T0 (A=B=C) is verified on a **compiler subset**.  
Foreign language frontends are **subsets**. Official language test suites are mapped, not passed.

x86: catalogued as hindawiai/v86, js-dos, em-dosbox and not mounted. Now `docs/emu.html` (v86 FreeDOS). Original Lekhak is `src/lekhak/LEKHAK.C` → console `lekhak` (PANINI) and `docs/emu/lekhakx.exe` (DJGPP+UPX, needs DPMI).

Shaili Robot is Indic LOGO (`ROBOT.C` in hindawi3.zip), named for FreeBot ANGEL.
Both are on the console as modes of the **same glass**: Robot switches the CRT to a 640×384 floor; Lekhak is 80×24 text. Retrieved sources under `retrieved/legacy/Hindawi/{robot,lekhak}/`.


Digital twins and UI stand-ins inherit the physical object's structure.
Console = one monitor glass (80×24) + one keyboard strip.
AyeCNSe/VIDYA sims live at github.com/AyeCNSe/sims (CNAME sims.ayecnse.site).
This tree retrieves those HTML files and hosts a PANINI kinematics kernel
(`src/panini/sims/diffdrive.pni`). Rewriting 48 Three.js scenes in PANINI
this hour is not claimed.


JS interp → POSIX personality on VFS → OCI when present → official compiler images → official suites. Emulators later.
See docs/ARCHITECTURE.md.

## Working stance (architect, 2026-08-28)

This is not a generic-user session. Default hedging, early collapse, and
"good enough subset" delivery are contract violations here.

Done means comparable with the relevant industrial artifact, or it is
labeled **not done** with the exact gap.

Do not assume. Ask. Axes stay uncollapsed until the architect identifies them.

Session-private remarks stay out of the public tree.

This file is the durable memory for this tree. There is no separate
long-term memory store outside conversation + these files.

## Surfaces

| Surface | Path |
|---|---|
| Public site (informative) | `docs/index.html` |
| Linguist laboratory | `docs/linguist.html` |
| Hindawi notebook (2022 chrome + Romenagri compile) | `docs/nb.html` |
| Workbench / IDE | `docs/workbench.html` |
| CLI | `node src/cli.js` |
| PWA | `docs/manifest.webmanifest` |

## Linguistics layer (for a reviewing AI)

Read in this order: `CONTRACT.md` §24, `docs/linguist/README.md`, `docs/data/roundtrip.json`, `docs/CONVERSATION.md`.

- **Script axis (Brahmi family):** Unicode name-projection → Devanagari hub. 74 tables in `retrieved/romenagri/tables/*_to_deva.tsv`. Gurmukhi rows are retrieved (not regenerated). Other stubs were empty headers; they were filled this turn by `unicodedata` using the method those headers already named.
- **Script axis (nine common Indic):** `flatten_uni_dev.lex` / bundle 793 pairs. This is the 2004 working lex.
- **Script axis (Hebrew, Phoenician, Aramaic, Syriac):** direct Unicode inventories in `docs/linguist/semitic/`. Not a Devanagari hub.
- **Language axis:** `retrieved/romenagri/langs/*_c.tsv` (27). Native keywords, not macros.
- **Perso-Arabic:** retrieved `urdu_map.csv` (lossy) **plus** retrieved ISO 15919 Aran↔Deva (62/62 co-rows) **plus** Unicode NFKC folding of presentation forms and tatweel strip. Abjad residue remains.
- **Sinhala / Tamil extra:** ISO 15919 table (name-projection is weak where Unicode names do not parallel Devanagari, e.g. SINHALA LETTER AYANNA).
- **Dome:** retrieved `zistgah/dome` (DOI 10.5281/zenodo.21449034). Pages mount `docs/dome/`. Three.js r128 is third-party (CDN).
- **UI rungs:** console (workbench), 2D estate, academic paper skin, jazz skin, dome. Same maps.

- **Cuneiform / Egyptian:** sign inventories only (`docs/linguist/undeciphered/`). Language keywords **[UNRESOLVED]**.
- **7000 languages / dialects:** programme, not this clone.
- **Shaili:** host-language localisation via retrieved lexers (`h2c.uhin` / `h2c.lex`). Independent of script/language axes.
- **Compile visible to linguists:** notebook `संकलन` prints Romenagri then host. मुख्य → mukhya → main.

If you have ontology or DOI-backed wordlists the architect hands you, TRUST ME: use those; do not re-derive.

## Do not confuse


- Monaco ≠ Visual Studio Code product
- In-page bash ≠ GNU bash
- In-page C frontend ≠ ISO C compiler
- VT100 panel = the terminal; shells ride on it
