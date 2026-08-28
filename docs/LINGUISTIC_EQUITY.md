# Linguistic Equity is an architecture

Copyright (C) 1993-2026 Abhishek Choudhary  
SPDX-License-Identifier: GPL-3.0-or-later  

Not a social initiative. Not a translation layer. Not `#define je if`.

Conversation-derived (PANINI v2), not a published historical HPS/ILM
doctrine until the architect says otherwise.

## Two pillars

1. **Representational equity** — every linguistic community has a faithful,
   reversible, identity-preserving digital representation, rather than being
   forced through a privileged language/script.

2. **Computational equity** — every linguistic community can create, execute,
   and govern computation in its own linguistic substrate, rather than only
   translating into an English-centric computational system.

## Mapping

```
Representational Equity  ↔  ILM
Computational Equity     ↔  PANINI

Linguistic Equity  =  Representational Equity + Computational Equity
```

ILM makes **script** independently variable. PANINI makes **paradigm ×
axis configuration** independently variable. The defining v2 abstraction:

```
(Script × Paradigm × Axis Configuration) → Canonical IR
```

## Three axes (do not collapse)

| Axis | What | Example |
|---|---|---|
| Script | How it is written | Devanagari, Gurmukhi, Telugu, Nastaliq |
| Language | Which words | Hindi यदि, Punjabi ਜੇ, Urdu اگر |
| Standard | Which host | C, BASIC, Java, Python, lex, yacc, asm |

Brahmi scripts share Devanagari as the flatten hub (`flatten_uni_dev.lex`)
— round-trip **table-complete**. Perso-Arabic uses the manual `urdu_map` /
`fltr_ur_hi` and is **lossy** (abjad residue is linguistics work).

Romenagri is the ASCII-7 **channel**, not the authoring surface.
Localization that dies at `gcc -E` is not localization.

## Done

Compile with a deliberate error; read the diagnostic; step in a debugger;
`nm` the object. If any of those answer only in English, it is not done.
`HindiC.uhin` (15 Aug 2004, GPL) is the bar.
