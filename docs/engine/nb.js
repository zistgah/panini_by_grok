/* Copyright (C) 1993-2026 Abhishek Choudhary
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Browser-native Hindawi notebook engine. Tables from retrieved flatten_uni_dev + lang TSVs.
 */
(function (global) {
  let B = null;
  async function load(url) {
    const r = await fetch(url);
    B = await r.json();
    B.flatten.pairs.sort((a, b) => [...b.from].length - [...a.from].length);
    return B;
  }
  function applyPairs(src, pairs, fromK, toK) {
    let i = 0, out = "", s = String(src);
    while (i < s.length) {
      let hit = null;
      for (const p of pairs) {
        const f = p[fromK];
        if (f && s.startsWith(f, i)) { hit = p; break; }
      }
      if (hit) { out += hit[toK]; i += hit[fromK].length; }
      else { out += s[i]; i++; }
    }
    return out;
  }
  function flatten(src) {
    return applyPairs(src, B.flatten.pairs, "from", "to");
  }
  function unflatten(deva, script) {
    const map = B.flatten.reverse[script] || {};
    const pairs = Object.keys(map).sort((a, b) => [...b].length - [...a].length).map((to) => ({ from: to, to: map[to] }));
    return applyPairs(deva, pairs, "from", "to");
  }
  function persoToDeva(src) {
    const pairs = [];
    for (const r of B.urdu_map.rows) {
      for (const f of r.forms) pairs.push({ from: f, to: r.deva });
    }
    pairs.sort((a, b) => [...b.from].length - [...a.from].length);
    return applyPairs(src, pairs, "from", "to");
  }
  function devaToPerso(src) {
    const pairs = B.urdu_map.rows.map((r) => ({ from: r.deva, to: r.arab }))
      .sort((a, b) => [...b.from].length - [...a.from].length);
    return applyPairs(src, pairs, "from", "to");
  }
  function tokReplace(src, from, to) {
    if (!from) return src;
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(from))
      return src.replace(new RegExp("\\b" + from + "\\b", "g"), to);
    return src.split(from).join(to);
  }
  function applyLang(src, langId) {
    const L = B.langs[langId];
    if (!L) return src;
    let out = src;
    const rows = L.rows.slice().sort((a, b) => [...b.native].length - [...a.native].length);
    for (const r of rows) out = out.split(r.native).join(r.c);
    return out;
  }
  function applyPraatha(src) {
    const rules = (B.shailis.praatha.rules || []).slice().sort((a, b) => [...b.from].length - [...a.from].length);
    let out = src;
    for (const r of rules) out = out.split(r.from).join(r.to);
    return out;
  }
  function compile({ src, lang, shaili, scriptFamily }) {
    const perso = (B.perso_family || []).includes(lang) || scriptFamily === "perso";
    let stage = src;
    const notes = [];
    if (perso) {
      notes.push("Perso-Arabic: fltr_ur_hi / urdu_map.csv — round-trip NOT guaranteed. Linguistics residue (abjad / tashkil).");
      stage = persoToDeva(stage);
    }
    stage = applyLang(stage, lang);
    const flat = flatten(stage);
    let host = flat;
    if (shaili === "praatha") host = applyPraatha(flat);
    return {
      invented_maps: false,
      perso,
      flatten_complete_for_brahmi: !perso,
      notes,
      source: src,
      after_lang: stage,
      flattened: flat,
      host,
    };
  }
  function hin2std(src, lang, shaili) { return compile({ src, lang, shaili }).host; }
  function std2hin(src, lang) {
    const L = B.langs[lang];
    let out = src;
    if (L) {
      const rows = L.rows.slice().sort((a, b) => b.c.length - a.c.length);
      for (const r of rows) out = tokReplace(out, r.c, r.native);
    }
    return out;
  }
  global.PANINI_NB = { load, flatten, unflatten, persoToDeva, devaToPerso, compile, hin2std, std2hin, bundle: () => B };
})(typeof window !== "undefined" ? window : globalThis);
