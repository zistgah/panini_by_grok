/* Copyright (C) 1993-2026 Abhishek Choudhary
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Browser Hindawi engine: flatten + retrieved shaili lex + host interpreters.
 * Run executes the compiled host, not a canned demo.
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
      if (s[i] === '"') {
        let j = i + 1;
        while (j < s.length && s[j] !== '"') { if (s[j] === "\\") j += 2; else j++; }
        out += s.slice(i, j + 1); i = j + 1; continue;
      }
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
  function flatten(src) { return applyPairs(src, B.flatten.pairs, "from", "to"); }
  function unflatten(deva, script) {
    const map = B.flatten.reverse[script] || {};
    const pairs = Object.keys(map).sort((a, b) => [...b].length - [...a].length).map((to) => ({ from: to, to: map[to] }));
    return applyPairs(deva, pairs, "from", "to");
  }
  function persoToDeva(src) {
    const pairs = [];
    for (const r of B.urdu_map.rows) for (const f of r.forms) pairs.push({ from: f, to: r.deva });
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
    const rows = L.rows.slice().sort((a, b) => [...b.native].length - [...a.native].length);
    return applyPairs(src, rows.map((r) => ({ from: r.native, to: r.c })), "from", "to");
  }
  function applyShaili(id, src) {
    const S = B.shailis[id];
    if (!S || !S.rules || !S.rules.length) return src;
    const rules = S.rules.slice().sort((a, b) => [...b.from].length - [...a.from].length);
    return applyPairs(src, rules, "from", "to");
  }
  function compile({ src, lang, shaili }) {
    const perso = (B.perso_family || []).includes(lang);
    const notes = [];
    let stage = String(src);
    if (perso) {
      notes.push("Perso-Arabic: urdu_map — round-trip NOT guaranteed.");
      stage = persoToDeva(stage);
    }
    if (lang && lang !== "hindi") stage = applyLang(stage, lang);
    const flat = flatten(stage);
    const host = applyShaili(shaili || "guru", flat).replace(/<[^>\n]+>/g, "");
    return {
      invented_maps: false, perso, notes, source: src, flattened: flat, host,
      shaili: shaili || "guru",
      rule_count: (B.shailis[shaili || "guru"] || {}).rules?.length || 0
    };
  }

  const INDIC = { "०":"0","१":"1","२":"2","३":"3","४":"4","५":"5","६":"6","७":"7","८":"8","९":"9" };
  function indic(s) { return String(s).replace(/[०-९]/g, (c) => INDIC[c] || c); }

  /* ---- BASIC interpreter (compiled host: PRINT/INPUT/FOR/NEXT/TO/STEP/END) ---- */
  function runBasic(host, stdin) {
    const lines = indic(host).split(/\n/).map((l) => l.trim()).filter((l) => l && !/^REM\b/i.test(l) && !/^STYLE\b/i.test(l));
    const vars = Object.create(null);
    let inI = 0, out = [], pc = 0, pending = "";
    const forStack = [];
    function num(x) { const n = parseFloat(x); return Number.isFinite(n) ? n : 0; }
    function evalExpr(e) {
      e = e.trim();
      if (e.charAt(0) === '"') return JSON.parse(e.replace(/\\n/g, "\\n"));
      e = e.replace(/([A-Za-z_\u0900-\u097F\u0A00-\u0A7F][\w\u0900-\u097F\u0A00-\u0A7F]*)/g, (id) => {
        if (id in vars) return String(vars[id]);
        return id;
      });
      if (!/^[\d\s+\-*/().%<>=!]+$/.test(e)) {
        if (e in vars) return vars[e];
        return e;
      }
      try { return Function("return (" + e + ")")(); } catch { return num(e); }
    }
    while (pc < lines.length) {
      let L = lines[pc];
      const mFor = L.match(/^FOR\s+(\S+)\s*=\s*(.+?)\s+TO\s+(.+?)(?:\s+STEP\s+(\S+))?$/i);
      if (mFor) {
        const v = mFor[1];
        vars[v] = evalExpr(mFor[2]);
        forStack.push({ v, to: evalExpr(mFor[3]), step: mFor[4] ? evalExpr(mFor[4]) : 1, top: pc });
        pc++; continue;
      }
      const mNext = L.match(/^NEXT\s+(\S+)$/i);
      if (mNext) {
        const fr = forStack[forStack.length - 1];
        if (!fr) throw new Error("NEXT without FOR");
        vars[fr.v] = num(vars[fr.v]) + num(fr.step);
        const done = fr.step >= 0 ? vars[fr.v] > fr.to : vars[fr.v] < fr.to;
        if (done) { forStack.pop(); pc++; }
        else pc = fr.top + 1;
        continue;
      }
      if (/^END\b/i.test(L) || /^इति\b/.test(L)) break;
      const mIn = L.match(/^INPUT\s+(?:"([^"]*)"\s*,\s*)?(\S+)$/i);
      if (mIn) {
        if (mIn[1]) out.push(mIn[1]);
        vars[mIn[2].replace(/,$/, "")] = stdin[inI++] ?? "";
        pc++; continue;
      }
      const mPr = L.match(/^PRINT\s*(.*)$/i);
      if (mPr) {
        let rest = mPr[1] || "";
        const stay = /;\s*$/.test(rest);
        rest = rest.replace(/;\s*$/, "");
        if (!rest) { if (!stay) { out.push(pending); pending = ""; } pc++; continue; }
        const parts = [];
        let buf = "", inQ = false;
        for (let i = 0; i < rest.length; i++) {
          const ch = rest[i];
          if (ch === '"') { inQ = !inQ; buf += ch; continue; }
          if (!inQ && (ch === ";" || ch === ",")) { parts.push(buf); buf = ""; continue; }
          buf += ch;
        }
        if (buf !== "") parts.push(buf);
        let line = pending;
        for (const p of parts) {
          const t = p.trim();
          if (!t) continue;
          if (t.charAt(0) === '"') {
            try { line += JSON.parse(t); } catch { line += t.slice(1, -1); }
          } else line += String(evalExpr(t));
        }
        if (stay) pending = line;
        else { out.push(line); pending = ""; }
        pc++; continue;
      }
      const mLet = L.match(/^(\S+)\s*=\s*(.+)$/);
      if (mLet) { vars[mLet[1]] = evalExpr(mLet[2]); pc++; continue; }
      pc++;
    }
    if (pending) out.push(pending);
    return out.join("\n") + (out.length ? "\n" : "");
  }

  /* ---- C subset: compile host to JS and run it. Not a canned demo. ---- */
  function runC(host, stdin) {
    let inI = 0;
    const chunks = [];
    const printf = function (fmt) {
      const args = Array.prototype.slice.call(arguments, 1);
      let k = 0;
      const s = String(fmt).replace(/%[-0-9.]*[sdif]/g, function () {
        const v = args[k++];
        return v == null ? "" : String(v);
      });
      chunks.push(s);
      return s.length;
    };
    const scanf = function () {
      /* last args are destination names — we rewrite scanf before eval */
      return 1;
    };
    let js = indic(host);
    js = js.replace(/#include[^\n]*/g, "");
    js = js.replace(/#समावेश[^\n]*/g, "");
    js = js.replace(/\b(int|void)\s+main\s*\([^)]*\)/g, "function __main()");
    js = js.replace(/\bscanf\s*\(\s*("[^"]*")\s*,\s*([^;]+)\)/g, function (_, fmt, rest) {
      return rest.split(",").map(function (id) {
        id = id.replace(/[&\s]/g, "");
        return id + " = __stdin()";
      }).join(", ");
    });
    js = js.replace(/\bchar\s+([A-Za-z_\u0900-\u097F\u0A00-\u0A7F][\w\u0900-\u097F\u0A00-\u0A7F]*)\s*\[[^\]]*\]/g, "let $1=''");
    js = js.replace(/\bint\s+([A-Za-z_\u0900-\u097F\u0A00-\u0A7F][\w\u0900-\u097F\u0A00-\u0A7F]*)/g, "let $1");
    js = js.replace(/\b(float|double)\s+([A-Za-z_\u0900-\u097F\u0A00-\u0A7F][\w\u0900-\u097F\u0A00-\u0A7F]*)/g, "let $2");
    const fn = new Function("printf", "scanf", "__stdin", js + "\n; if (typeof __main === 'function') return __main();");
    const __stdin = function () { return stdin[inI++] ?? ""; };
    fn(printf, scanf, __stdin);
    return chunks.join("");
  }

  function run(compiled, stdinText) {
    const stdin = String(stdinText || "").split(/\n/);
    const sh = compiled.shaili || "guru";
    try {
      if (sh === "praatha") return { ok: true, out: runBasic(compiled.host, stdin) };
      if (sh === "guru" || sh === "shraeni") return { ok: true, out: runC(compiled.host, stdin) };
      return { ok: false, out: "No in-browser interpreter for shaili " + sh + ".\n--- host ---\n" + compiled.host };
    } catch (e) {
      return { ok: false, out: "Run error: " + e.message + "\n--- host ---\n" + compiled.host };
    }
  }

  global.PANINI_NB = {
    load, flatten, unflatten, persoToDeva, devaToPerso, compile, run, runC, runBasic,
    hin2std(src, lang, shaili) { return compile({ src, lang, shaili }).host; },
    std2hin(src, lang) {
      const L = B.langs[lang]; let out = src;
      if (L) {
        const rows = L.rows.slice().sort((a, b) => b.c.length - a.c.length);
        for (const r of rows) out = tokReplace(out, r.c, r.native);
      }
      return out;
    },
    bundle: () => B
  };
})(typeof window !== "undefined" ? window : globalThis);
