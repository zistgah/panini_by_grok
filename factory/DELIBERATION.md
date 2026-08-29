# Unfreeze protocol

Copyright (C) 1993-2026 Abhishek Choudhary  
SPDX-License-Identifier: GPL-3.0-or-later

A **FROZEN** component in `factory/REGISTRY.json` is not edited because it
looks ugly or because a later prompt restates it.

To touch one:

1. Name the component id and path.
2. State why the freeze is wrong (bug, STANDARD GREEN regression, security).
3. Append a dated entry below.
4. Run `node scripts/factory_scan.mjs --accept-hash <id>` after the edit so
   the new hash is the freeze. That is a deliberate re-lock, not a silent drift.

## Log

| Date | id | Why |
|---|---|---|
| (none yet) | — | Factory minted this turn. Existing optimized files were locked, not rewritten. |
