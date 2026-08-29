# Keyword-table gaps (cycler deposit)

Copyright (C) 1993-2026 Abhishek Choudhary  
GPL-3.0-or-later

This is a **deposit** for linguists and other AIs via Mez cyclers.
Do not invent rows in `retrieved/`. Fill a TSV, put it here, the kernel maps it.

## Bar

Hindi C keyword table: **29** rows (`hindi_c.tsv`), plus Guru/h2c surface (`समावेश`, `मुख्य`, `म_लिखो`, …) in the 2004 lexer.

A language is not “ported” because `if`/`else`/`while` exist.

## Count vs Hindi bar (bundle)

| language | keyword rows | vs 29 | action |
|---|---:|---|---|
| hindi, sanskrit, arabic | 29 | bar | maintain |
| urdu, persian | 27 | −2 | missing `scanf`/`printf` (Hindi `पढ़ो`/`लिखो`) |
| pashto, dari, sindhi, kashmiri, shahmukhi | 20 | −9 | cycler: complete Guru surface |
| nepali | 11 | −18 | cycler |
| assamese, hebrew, pali | 8 | −21 | cycler |
| syriac 5, prakrit 4, aramaic 2, phoenician 2 | | | inventory, not a C shaili yet |

## Urdu (architect report)

The Urdu stack only showed a few translated keywords. That is this gap, not a UI bug.

Hindi Guru tokens that Urdu TSV does not carry (do not invent here):

- पढ़ो → scanf
- लिखो → printf
- समावेश, मुख्य, क्रम, म_लिखो, म_पूछो, पूर्णांक, अक्षर, वापस (h2c surface)

Cycler: `ILM-GENIE` / linguist. Output: `deposits/linguist/urdu_c.tsv` matching Hindi columns `native romenagri c`.

Round-trip for Urdu remains **lossy** (abjad). Completing keywords does not claim gdb reconstruction.
