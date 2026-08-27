# Third-party software

PANINI itself is Copyright (C) 1993-2026 Abhishek Choudhary and licensed under
GPL-3.0-or-later (see LICENSE). The following components are used as-is under
their own licenses. They are not GPL-relicensed.

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

## Node.js

- Runtime for the CLI. License: MIT (Node.js project).
- Not bundled.
