# Pages copy of the C→WASM host

Copyright (C) 1993-2026 Abhishek Choudhary | GPL-3.0-or-later

GitHub Pages serves `docs/`. These files are copies of the canonical tree so the site can run the same lowering.

| Here | Canonical |
|---|---|
| `c.pni` | `src/panini/frontends/c.pni` |
| `wasm.pni` | `src/panini/backends/wasm.pni` |
| `interpreter.js` | `runtime/interpreter.js` (parser import patched; `process` shim) |
| `parser.js` lexer ast tokens | `compiler/` |
| `ccpp.js` env values artifacts | `runtime/` |
| `builtins.js` | subset: no Node toolchain |
| `host.js` | this directory — `emit_c_wat` + `wat2wasm` |

Do not edit `c.pni` / `wasm.pni` here first. Edit `src/panini/` then copy.
