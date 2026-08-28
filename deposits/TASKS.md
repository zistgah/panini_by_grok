# TASKS — pick one, deposit the result

Copyright (C) 1993-2026 Abhishek Choudhary  
Status: open | taken | deposited | merged

Pipeline invariant: Unicode → ACII → Romenagri → shaili lex → host. No JS-Unicode bypass.

| id | status | what | acceptance |
|---|---|---|---|
| T-ASM-01 | merged-this-turn | Browser yantra/ASM interpreter on Romenagri host | HindiASM.uhin write syscall; `node tests/asm_run.mjs` |
| T-JAVA-01 | partial | Browser kritrima/Java: println only | HindiJAVA.uhin prints; full JVM is NOT this task |
| T-LEX-01 | open | In-browser HindiLEX (shabda) interpreter | retrieved HindiLEX.uhin produces a scanner, not a stub |
| T-YACC-01 | open | In-browser HindiYACC (wyaaka) | retrieved HindiYACC.uhin |
| T-LANG-BODO | open | Bodo keyword TSV retrieved, not invented | `langs/bodo_c.tsv` with native/romenagri/c; unique natives |
| T-LANG-DOGRI | open | Dogri keyword TSV retrieved | same format |
| T-LANG-KONKANI | open | Konkani keyword TSV retrieved | same format |
| T-LANG-MAITHILI | open | Maithili keyword TSV retrieved | same format |
| T-LANG-MANIPURI | open | Manipuri / Meetei Mayek keywords retrieved | same format + script table already name-projected |
| T-LANG-SANTALI | open | Santali / Ol Chiki keywords retrieved | same format |
| T-PNI-PYTHON | open | `languages/python.pni` real frontend, not stub | parses a CPython-shaped subset; tests in tests/lang_cases |
| T-PNI-C | open | `languages/c.pni` | ISO C subset toward C17 green — do not claim green |
| T-PNI-CPP | open | `languages/cpp.pni` | |
| T-PNI-FORTRAN | open | `languages/fortran.pni` | |
| T-PNI-RUST | open | `languages/rust.pni` | |
| T-PNI-JS | open | `languages/javascript.pni` | |
| T-PNI-LUA | open | `languages/lua.pni` | |
| T-PNI-JAVA | open | `languages/java.pni` | |
| T-PNI-GO | open | `languages/go.pni` | |
| T-PNI-ASM | partial | `languages/assembly.pni` | must consume yantra host, not a hello stub |
| T-PERSO-RT | open | Named residue list for the 4 ISO 15919 Aran keys that miss Deva | linguist lab, not a new map |
| T-STD-SHAILI | open | Fill guru-style standards for BASIC/C++/Java/ASM from retrieved shaili lex | docs/standards/<lang>-<shaili>.html |
| T-STD-TRANSLATE | open | Translate TEMPLATE.md ten clauses; do not machine-fill keyword tables | deposits/standards/<lang>/TEMPLATE.csv |


When you take a row, set `taken` and put your name/model in `inbox/<id>/NOTE.md`.
