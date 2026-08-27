# tree-rev: 2026.08.28
# Copyright (C) 1993-2026 Abhishek Choudhary
# SPDX-License-Identifier: GPL-3.0-or-later
# PANINI architecture (2026.08)

PANINI is a **canonical IR + configuration space**, not “one more syntax.”

```
Human intent
    │
    ├─ Natural language / script  →  ILM projection
    ├─ Blocks / Shaili / BASIC
    └─ .pni source
            │
            ▼
     Lexer → Parser → AST
            │
            ▼
     Axis bundle + typed boundaries
            │
            ▼
         IR_P
            │
     ┌──────┼──────────┬─────────────┐
     ▼      ▼          ▼             ▼
  Interp  IR VM    Emitters      Foreign frontends
  (JS)    (JSON)   js/py/c/f90   py/c/cpp/f90/rs/ts/go/zig
     │
     ├─ VFS + bash subset
     ├─ VT100 + DOS/TTF fonts
     ├─ BLAS + autotune
     ├─ GFX / WebGPU stub
     └─ Provenance stamps
            │
            ▼
     L15 Workbench (this site) · CLI · VS Code extension
```

## Two equity pillars

- **Representational equity (ILM):** script/language of source is a projection, not a privileged machine.
- **Computational equity (PANINI):** communities compute in that substrate; they do not only translate into English-centric toolchains.

## What is verified vs subset

See the Status panel. Self-host T0 (A=B=C) is verified for the PANINI compiler subset. Foreign frontends are **print-expression or small-language subsets**, not rustc/CPython.
