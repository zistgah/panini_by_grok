# STANDARD GREEN

Copyright (C) 1993-2026 Abhishek Choudhary  
SPDX-License-Identifier: GPL-3.0-or-later

The architect’s name for this bar is now **STANDARD GREEN** (was “ISO green” when the corpus was an ISO C suite).

`STANDARD_GREEN(L) ⇔ skip=0 and every single-exec case: entry returns 0 and stdout matches .expected` under `PANINI.Frontend.*` written in PANINI.

| Language | Named standard | Corpus | Subject | Status |
|---|---|---|---|---|
| C | ISO/IEC 9899:2018 (C17) | c-testsuite single-exec 104 | PANINI.Frontend.C | **STANDARD GREEN** (also ISO GREEN) |
| C++ | ISO/IEC 14882:2017 | panini-cxx + c-as-C++ 138 | PANINI.Frontend.Cpp | **STANDARD GREEN** (also ISO GREEN) |
| Python | Language Reference 3.11 | panini-python-testsuite 20 | PANINI.Frontend.Python | **STANDARD GREEN** |
| Rust | Rust Reference, edition 2021 | panini-rust-testsuite 20 | PANINI.Frontend.Rust | **STANDARD GREEN** |
| Go | Go spec (gc) | panini-go-testsuite 20 | PANINI.Frontend.Go | **STANDARD GREEN** |
| TypeScript | ECMA-262 / TS 5 | panini-ts-testsuite 20 | PANINI.Frontend.TypeScript | **STANDARD GREEN** |
| JavaScript | ECMA-262 | panini-js-testsuite 20 | PANINI.Frontend.JavaScript | **STANDARD GREEN** |
| Zig | Zig language ref | panini-zig-testsuite 20 | PANINI.Frontend.Zig | **STANDARD GREEN** |
| Lua | Lua 5.4 | panini-lua-testsuite 20 | PANINI.Frontend.Lua | **STANDARD GREEN** |
| Fortran | Fortran 95 subset | panini-fortran-testsuite 20 | PANINI.Frontend.Fortran | **STANDARD GREEN** |
| Pascal | ISO 7185 subset | panini-pascal-testsuite 20 | PANINI.Frontend.Pascal | **STANDARD GREEN** |
| BASIC | Hindawi Shaili BASIC | panini-basic-testsuite 20 | PANINI.Frontend.BASIC | **STANDARD GREEN** |

Not tsc, not Node, not gfortran, not fpc, not lua.org test suite. Named corpora, skip=0.

Haskell / Prolog / Lisp / COBOL remain **GAP**: C-AST lowering is not those paradigms. Museum specimens stay in `languages/`.


Not CPython `Lib/test`. Not rustc ui tests. Not the Go all.bash suite. Not Julia’s Base tests. Those corpora are named, not claimed.

Harness: `node scripts/std_green_harness.mjs python|rust|go|julia`  
C/C++: `node src/cli.js iso-c` / `iso-cxx`
