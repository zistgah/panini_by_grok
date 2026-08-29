# tree-rev: 2026.08.28
# CONTEXT.md

Copyright (C) 1993-2026 Abhishek Choudhary  
SPDX-License-Identifier: GPL-3.0-or-later  
Tree-rev: 2026.08.29

ISO C++: PANINI.Frontend.Cpp ISO GREEN 138/0/0 (40 cxx-testsuite + 98 c-testsuite-as-C++). 6 C-only cases skipped. Not libstdc++.

WASM backend: PANINI.Backend.Wasm emits WAT; in-tree wat2wasm; `compute(5)=25` proven.
Notebook: `#समावेश <मानकपन.स>` must remain `#include <stdio.h>` — only the Shaili pragma is stripped.
Hindi C++ demo is `docs/demos/HindiCPP.uhin` (not an HTML 404).
FAQ: docs/faq.html — `#define` is not a lexer; copilot WAT last-mile is not a backend.
Spine: docs/spine.json is the menu. Homepage is not a grid of identical stack cards. Languages: stack.html dropdown (27). Urdu 27/29 keywords — deposit docs/deposits/linguist/KEYWORD_GAPS.md. llama-cli on VFS via wllama (llama.cpp WASM) + stories15M.Q4_0.gguf. v86 remains i386; llama is not that guest.









## What this repository is

PANINI is a computational language and L15 workbench whose point is **linguistic equity**:

- Representational equity ↔ ILM (script is a projection)
- Computational equity ↔ PANINI (compute in that substrate)
- Linguistic equity = both

It sits in the Hindawi / AyeAI / ILM line of work: programming and systems in the operator’s language, not only through an English-centric toolchain.

## What the JS tree is

A Stage-0 bootstrap plus additive layers (v2/v3 workbench, frontends, VFS, VT100).  
Self-host T0 (A=B=C) is verified on a **compiler subset**.  
Foreign language frontends are **subsets**. Official language test suites are mapped, not passed.

## Road

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
| Workbench / IDE | `docs/workbench.html` |
| CLI | `node src/cli.js` |
| PWA | `docs/manifest.webmanifest` |

## Do not confuse

- Monaco ≠ Visual Studio Code product
- In-page bash ≠ GNU bash
- In-page C frontend ≠ ISO C compiler
- VT100 panel = the terminal; shells ride on it
