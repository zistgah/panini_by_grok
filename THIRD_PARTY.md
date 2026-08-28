# tree-rev: 2026.08.28
# Third-party software

PANINI itself is Copyright (C) 1993-2026 Abhishek Choudhary and licensed under
GPL-3.0-or-later (see LICENSE). The following components are used as-is under
their own licenses. They are not GPL-relicensed.

## Blockly

- https://github.com/google/blockly
- License: Apache-2.0 (Google LLC)

## Monaco Editor (VS Code editor core)

- Project: https://github.com/microsoft/monaco-editor
- Copyright: Microsoft Corporation
- License: MIT
- Used by: `docs/index.html` loads
  `https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/`
- The in-browser workbench is a VS Code–compatible editor surface. It is not
  the Visual Studio Code product (which has a different license).

## RequireJS loader shipped with Monaco min build

- Distributed with Monaco Editor (MIT).

## DejaVu Fonts (optional host TTF)

- Path example: `/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf`
- License: Bitstream Vera / DejaVu (see fonts’ own LICENSE)
- Loaded only when `VT_LOAD_FONT` points at a host TTF.

## c-testsuite (ISO C compile-and-run corpus)

- https://github.com/c-testsuite/c-testsuite
- Retrieved 2026-08-28 as `tests/iso/c/c-testsuite.tar.gz`
- Used as the first executable corpus for ISO_GREEN(C)
- License: see tarball LICENSE (not relicensed)

## project-ilm/legacy APCISR and Romenagri (retrieved, read-only)

- https://github.com/project-ilm/legacy
- Vendored at `retrieved/legacy/APCISR` and `retrieved/legacy/Romenagri`
- GPL (see those trees’ `copying` / `LICENSE`). Not rewritten.

## project-ilm/romenagri library (retrieved, read-only)

- https://github.com/project-ilm/romenagri
- Vendored at `retrieved/romenagri` (`src/`, `tables/`, `bindings/js/`)
- Maps are the retrieved tables. This tree does not invent maps.

## Node.js

- Runtime for the CLI. License: MIT (Node.js project).
- Not bundled.
