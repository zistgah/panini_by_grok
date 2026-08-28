# Spin-off map

Copyright (C) 1993-2026 Abhishek Choudhary  
SPDX-License-Identifier: GPL-3.0-or-later  

This repository hosts siblings **until they move**. Each `apps/<name>/`
is a future repo root. Pages copies live under `docs/<name>/` so GitHub
Pages works today.

| In this tree | Spins off to | Notes |
|---|---|---|
| `apps/mez/` + `docs/mez/` | `zistgah/mez` | Cognitive Workbench / desk. Already exists; this is the in-tree build |
| `apps/fakir/` + `docs/fakir/` | `zistgah/fakir` | ISIC/ISCO/ISCED lattice viewer. Full dome stays in fakir (large) |
| `apps/ilm/` + `docs/ilm/` | `project-ilm/ilm.codes` | Migration of the gone ilm.codes site |
| `apps/hindawi/` | `hindawiai/*` | Docs only; DOS 2004 image stays on hindawi-legacy |
| `spec/` `compiler/` `runtime/` `src/` `cyclers/` | `zistgah/panini_by_grok` | This language. Stays. |
| `retrieved/` | never rewrite | Read-only vendor |

Do not mix mez Python stdlib desk (`./mez serve`) with PANINI JS interpreter
in one process. The Pages mez is the 2D rung. Console rung stays Python in
`zistgah/mez`.
