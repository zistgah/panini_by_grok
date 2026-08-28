# Hindawi / Romenagri / APCISR — retrieved, not reconstructed

Copyright (C) 1993-2026 Abhishek Choudhary
Sources: Wikipedia “Hindawi Programming System”; Savannah hindawi;
project-ilm/legacy; project-ilm/romenagri README.

## What HPS is (public record)

A suite so a person writes programs in a vernacular script, not only in English.
Shaili (शैली) is the paradigm/style name, not a keyword pack:

- Shaili Prathmik — Indic BASIC / Indic LOGO
- Shaili Guru — Indic C
- Shaili Shraeni — Indic C++
- Shaili Yantrik — Indic Assembly
- Shaili Shabda — Indic Lex
- Shaili Vyaakaran — Indic Yacc
- Shaili Kritrim — JVM target

Mechanism on the public page: **Romenagri transliteration** converts the
high-level source into a form an existing compiler will accept, then that
compiler emits machine code.

That is a **reversible script/phonology layer**, not a dictionary that
replaces `if` with `यदि` and stops.

## Why keyword-for-keyword mapping fails at the hardware

If only keywords are swapped:

- identifiers, registers, opcodes, linker symbols, object files stay Latin;
- a source-level debugger and a hardware probe no longer share an invertible
  name with the Devanagari (or Bangla, …) text the human wrote;
- assembly (Shaili Yantrik) cannot be the same program as C (Shaili Guru)
  under one identity-preserving map.

Romenagri’s public claim is **round-trip** transliteration (ACII layer:
`acii2rmn` / `rmn2acii` / `acii2hin` / `acii2uni`, lex sources in
`project-ilm/legacy/Romenagri` and `project-ilm/romenagri`).
Measured reversibility in the seed README: ~98.68% exact-or-canonicalizable
on `[a-z]` input — a measured floor, not a slogan.

ILM is the later layered form of that idea (phonology → transliteration →
orthography → lexicon → syntax → interface). Retrieve those repos. Do not
invent a keyword table and call it ILM.

## Why the console exists (APCISR)

Savannah record: Indic scripts in **true text mode**, no extra hardware,
**no graphical rasterising**. Glyphs live in the extended-ASCII code page;
7-bit ASCII is left unaltered. Hindi, Bangla, Assamese, Gujarati implemented
in that line.

That is why this tree was told to build VT100 + DOS-style fonts + TTF load.
The console is the **text-mode surface** on which vernacular source, assembler
listings, and debug output must remain the same byte-level objects.

`runtime/vt100.js` + `dosfont.js` in this tree are **not** APCISR.
APCISR lives in `project-ilm/legacy/APCISR`. Retrieve it. Do not redraw it
as a CSS terminal.

## Do not put in this note

Employer stories. Collaborator names the architect did not put in the
public record of these files.
