# ISO GREEN — unflattened acceptance

Copyright (C) 1993-2026 Abhishek Choudhary  
SPDX-License-Identifier: GPL-3.0-or-later

**ISO green means the official-suite harness is green.**  
A subset lexer that prints 42 does not discharge this.  
This will take multiple cycles. The requirement is not reduced.

## Named editions (this cycle)

| Language | Named standard | Retrieved executable corpus | Oracle | Subject | Status |
|---|---|---|---|---|---|
| C | ISO/IEC 9899:2018 (C17). gcc `-std=c17`. | [c-testsuite](https://github.com/c-testsuite/c-testsuite) `tests/single-exec` (retrieved 2026-08-28) | gcc 12 | `PANINI.Frontend.C` | **NOT GREEN** |
| C++ | ISO/IEC 14882 — edition to be named when the C path is honest | not retrieved this cycle | — | — | **NOT GREEN** |
| Python | CPython version to be named | `Lib/test` not retrieved this cycle | — | — | **NOT GREEN** |

c-testsuite is a collaborative ISO-C **compiler** compile-and-run corpus, not the ISO document as a PDF. It is the first retrieved harness. gcc torture is a later corpus. Neither is skipped by calling a demo “C”.

## Rule

`ISO_GREEN(C) ⇔ every non-skipped single-exec case matches `.expected` under the PANINI C frontend.`

Until that holds, status is **NOT GREEN**. Partial counts are progress reports, not done.

## Layout

- `tests/iso/c/c-testsuite.tar.gz` — retrieved suite
- `scripts/iso_c_harness.mjs` — runner
- `node src/cli.js iso-c` — report
