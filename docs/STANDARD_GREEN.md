# STANDARD GREEN

Copyright (C) 1993-2026 Abhishek Choudhary  
SPDX-License-Identifier: GPL-3.0-or-later

A homemade 20-case file is **not** a standard. Technologists and academics
accept the issuing body’s spec and, where it exists, that body’s test suite.

```
STANDARD_GREEN(L)  ⇔  retrieved official spec for L
                    ∧  retrieved official executable suite for L
                    ∧  skip=0 under PANINI.Frontend.L
```

Specs live in `retrieved/standards/` (`SOURCES.md`). We retrieve; we do not invent.

| Language | Official spec (retrieved) | Official executable suite | Status |
|---|---|---|---|
| C | WG14 **N1570** (C11 CD) | [c-testsuite](https://github.com/c-testsuite/c-testsuite) single-exec 104 | **STANDARD GREEN** |
| C++ | WG21 **N4296** (C++14 CD, fetched) | no public ISO executable suite in this tree | spec retrieved; suite **NOT GREEN** |
| ECMAScript / JS | **ECMA-262** HTML | **Test262** (slice retrieved) | spec retrieved; Test262 **NOT GREEN** |
| Python | PSF Language Reference 3.12 + grammar | CPython 3.12 `Lib/test/{test_unary,test_bool,test_grammar}.py` **self-contained asserts** (68), skip=0 | **STANDARD GREEN** on that named official extract. Full `Lib/test` (stdlib/unittest) is **GAP**. |
| Go | [go.dev/ref/spec](https://go.dev/ref/spec) | `all.bash` (not claimed) | spec retrieved; all.bash **NOT GREEN** |
| Lua | Lua 5.4 manual | lua.org **5.4.7 tests** (33 files retrieved) | spec+suite retrieved; suite **NOT GREEN** |
| Rust | The Rust Reference | rustc ui (not claimed) | spec retrieved; rustc ui **NOT GREEN** |
| Zig | ziglang.org language reference | zig test suite (not retrieved) | spec retrieved; **NOT GREEN** |
| Fortran | J3 N2146 (fetched) | none in tree | spec retrieved; **NOT GREEN** |
| TypeScript | Handbook + ECMA-262 | tsc tests (not claimed) | spec retrieved; **NOT GREEN** |
| Pascal | ISO 7185 (fetch failed 503/403 this turn) | none | **GAP** |
| BASIC | no single ISO academics accept (ECMA-116 is 1986; Hindawi is our heritage) | none | heritage CORE; **not STANDARD GREEN** |

**CORE GREEN** (`tests/std/*/single-exec`, 20 cases) is factory smoke. It is listed on the factory dashboard. It is **not** this page.

C remains the only language that meets the executable-suite conjunct today.
