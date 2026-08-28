# CAN_COMPILE — executable claim, not a directory name

Copyright (C) 1993-2026 Abhishek Choudhary  
SPDX-License-Identifier: GPL-3.0-or-later  

Claude’s caution, recorded: if this tree says it compiles, that claim
must be executable. `panini_by_claude` reports `CAN_COMPILE: no` and says why.

## What actually runs here

| Claim | Status |
|---|---|
| PANINI source → JS interpreter | YES, subset (self-host T0 A=B=C on the compiler subset) |
| PANINI → native machine code / ELF | **NO** |
| Lowering → IR → codegen (bootstrap stage 1) | **NOT DONE** |
| ISO C17 frontend, official suite green | **NOT GREEN** (harness exists; subject is not gcc) |
| Language frontends written in PANINI | PARTIAL; `T_FRONTEND_PANINI` is the invariant, not the proof of completeness |
| Hindawi Guru on HindiC.uhin | YES as source-to-source (unicode.h → acii2rmn → h2c.lex) |
| `#define` demos as localization | **NOT DONE** (see WHY_DEFINE_IS_NOT_LOCALIZATION.md) |

`CAN_COMPILE` for a lowering compiler: **no**.
The interpreter path is labeled an interpreter.
