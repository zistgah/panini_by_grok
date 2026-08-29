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
| Julia | Julia 1.10 language | panini-julia-testsuite 20 | PANINI.Frontend.Julia | **STANDARD GREEN** |

Not CPython `Lib/test`. Not rustc ui tests. Not the Go all.bash suite. Not Julia’s Base tests. Those corpora are named, not claimed.

Harness: `node scripts/std_green_harness.mjs python|rust|go|julia`  
C/C++: `node src/cli.js iso-c` / `iso-cxx`
