/* Copyright (C) 1993-2026 Abhishek Choudhary
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* PANINI in-browser VS Code workbench (Monaco). Full compiler remains Node CLI. */
const FILES = { ...(window.PANINI_FILES || {}) };
let editor, current = "examples/hello.pni", usingMonaco = false;

function getValue() {
  if (usingMonaco && editor && editor.getValue) return editor.getValue();
  const ta = document.getElementById("editor-fallback");
  return ta ? ta.value : (FILES[current] || "");
}
function setValue(v) {
  if (usingMonaco && editor && editor.setValue) editor.setValue(v);
  const ta = document.getElementById("editor-fallback");
  if (ta) ta.value = v;
}

function setSide(mode) {
  document.querySelectorAll("#activity .act").forEach((b) => b.classList.toggle("active", b.dataset.side === mode));
  const title = { explorer: "EXPLORER", search: "FEATURES", arch: "ARCHITECTURE", debug: "RUN AND DEBUG", ext: "FRONTENDS" }[mode];
  document.getElementById("side-title").textContent = title;
  const body = document.getElementById("side-body");
  if (mode === "explorer") {
    body.innerHTML = Object.keys(FILES).concat(window.PANINI_TREE || []).filter((v, i, a) => a.indexOf(v) === i)
      .map((f) => `<button class="file" data-file="${f}">${f}</button>`).join("");
    body.querySelectorAll(".file").forEach((b) => b.onclick = () => openFile(b.dataset.file));
  } else if (mode === "search" || mode === "ext") {
    body.innerHTML = (window.PANINI_CATALOG && window.PANINI_CATALOG.features || []).map((f) =>
      `<button class="feat"><strong>${f.name}</strong> <span class="badge ${f.status === "VERIFIED" || f.status === "VERIFIED_SUBSET" ? "ok" : "part"}">${f.status}</span><br><span class="muted">${f.note}</span></button>`
    ).join("");
  } else if (mode === "arch") {
    body.innerHTML = `<pre style="white-space:pre-wrap;font:11px/1.4 ui-monospace,monospace">${window.PANINI_CATALOG.architecture}</pre>`;
  } else {
    body.innerHTML = `<button class="file" data-cmd="run">▶ Run current file</button>
      <p class="muted" style="padding:8px">Desktop: .vscode/launch.json<br>Adapter: tools/panini-debug/adapter.mjs<br>This page runs the browser subset only.</p>`;
    body.querySelector("[data-cmd=run]").onclick = runCurrent;
  }
}

function langOf(name) {
  if (name.endsWith(".pni") || name.endsWith(".md")) return "plaintext";
  if (name.endsWith(".py")) return "python";
  if (name.endsWith(".ts")) return "typescript";
  if (name.endsWith(".rs")) return "rust";
  if (name.endsWith(".go")) return "go";
  if (name.endsWith(".zig")) return "csharp";
  if (name.endsWith(".f90")) return "plaintext";
  if (name.endsWith(".c") || name.endsWith(".cpp")) return "cpp";
  return "plaintext";
}

function openFile(name) {
  if (!FILES[name]) {
    document.getElementById("panel-body").textContent = name + " is in the repository. Open it locally; Pages only ships selected sources.";
    return;
  }
  current = name;
  renderTabs();
  if (editor) {
    if (usingMonaco) monaco.editor.setModelLanguage(editor.getModel(), langOf(name));
    setValue(FILES[name]);
  } else setValue(FILES[name]);
  document.getElementById("sb-mode").textContent = name;
}

function renderTabs() {
  const tabs = document.getElementById("tabs");
  const open = [current];
  tabs.innerHTML = open.map((t) => `<div class="tab active">${t}</div>`).join("");
}

function evalPrintExpr(src) {
  const m = src.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
  if (!m) return src;
  const a = Number(m[1]), b = Number(m[3]);
  return ({ "+": a + b, "-": a - b, "*": a * b, "/": a / b })[m[2]];
}

function evalPanini(src) {
  const prints = [];
  const fns = {};
  const lines = src.split(/\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i++].trim();
    if (!line || line.startsWith("//") || line.startsWith("MODULE") || line.startsWith("END") || line.startsWith("@")) continue;
    let m = line.match(/^PRINT\s+(.+)$/);
    if (m) { prints.push(evalExpr(m[1], {}, fns)); continue; }
    m = line.match(/^FUNCTION\s+(\w+)\(([^)]*)\)/);
    if (m) {
      const name = m[1];
      const params = m[2].split(",").map((s) => s.trim()).filter(Boolean);
      const body = [];
      while (i < lines.length && !/^\s*END\b/.test(lines[i])) body.push(lines[i++]);
      i++;
      fns[name] = { params, body };
    }
  }
  return prints;
}

function evalExpr(expr, env, fns) {
  expr = expr.trim();
  if (/^".*"$/.test(expr)) return expr.slice(1, -1);
  if (/^-?\d+$/.test(expr)) return Number(expr);
  const call = expr.match(/^(\w+)\((.*)\)$/);
  if (call && fns[call[1]]) {
    const args = call[2] ? call[2].split(",").map((a) => evalExpr(a.trim(), env, fns)) : [];
    const local = {};
    fns[call[1]].params.forEach((p, i) => local[p] = args[i]);
    for (const raw of fns[call[1]].body) {
      const rm = raw.trim().match(/^RETURN\s+(.+)$/);
      if (rm) return evalExpr(rm[1], local, fns);
    }
  }
  const bin = expr.match(/^(.+)\s*([+*])\s*(.+)$/);
  if (bin) {
    const l = evalExpr(bin[1], env, fns), r = evalExpr(bin[3], env, fns);
    return bin[2] === "+" ? l + r : l * r;
  }
  if (expr in env) return env[expr];
  return expr;
}

function runCurrent() {
  if (editor) FILES[current] = getValue();
  const src = FILES[current] || "";
  let out;
  if (current.endsWith(".pni")) out = evalPanini(src).join("\n");
  else out = String(evalPrintExpr(src));
  document.getElementById("panel-body").textContent = out || "(no output — browser subset)";
  setPanel("output");
}

function setPanel(name) {
  document.querySelectorAll(".ptab").forEach((b) => b.classList.toggle("active", b.dataset.panel === name));
  const canvas = document.getElementById("vt-canvas");
  const pre = document.getElementById("panel-body");
  const blocks = document.getElementById("blockly");
  document.getElementById("panel").classList.toggle("term-on", name === "terminal");
  if (blocks) blocks.hidden = name !== "blocks";
  if (name === "terminal") {
    pre.hidden = true; canvas.hidden = false;
    window.PANINI_VT?.paint(canvas);
    return;
  }
  if (name === "blocks") {
    pre.hidden = true; canvas.hidden = true;
    if (blocks && !blocks._ws) {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/blockly@11.1.1/blockly.min.js";
      s.onload = () => {
        if (!window.Blockly) return;
        blocks.style.height = "170px";
        blocks._ws = Blockly.inject(blocks, {
          toolbox: "<xml><block type=\"text_print\"></block><block type=\"math_number\"><field name=\"NUM\">42</field></block></xml>",
        });
      };
      document.head.appendChild(s);
    }
    return;
  }
  canvas.hidden = true; pre.hidden = false;
  if (name === "problems") pre.textContent = "No problems in browser subset.";
  if (name === "std") pre.textContent = window.PANINI_FILES?.["tests/standards/README.md"] || window.PANINI_FILES?.["spec/PANINI.std.pni"] || "PANINI.STD.2026.08";
}

document.querySelectorAll("[data-cmd]").forEach((b) => {
  b.onclick = () => {
    if (b.dataset.cmd === "run") runCurrent();
    if (b.dataset.cmd === "docs") { setSide("arch"); setPanel("output"); document.getElementById("panel-body").textContent = window.PANINI_CATALOG.architecture; }
    if (b.dataset.cmd === "status") { setSide("search"); }
    if (b.dataset.cmd === "term") setPanel("terminal");
    if (b.dataset.cmd === "std") setPanel("std");
    if (b.dataset.cmd === "prompts") {
      setPanel("output");
      document.getElementById("panel-body").textContent = window.PANINI_FILES?.["docs/ARCHITECT_PROMPTS.md"] || "Architect prompts: docs/ARCHITECT_PROMPTS.md";
    }
    if (b.dataset.cmd === "linguist") {
      const src = getValue();
      document.getElementById("panel-body").textContent =
        "LINGUIST — Hindawi localization is NOT a keyword table.\n" +
        "Pipeline (retrieved gurucc): acii2uni | h2c.lex | gcc\n" +
        "Maps: docs/retrieved/h2c.map.json extracted from legacy/Hindawi/guru/h2c.lex\n" +
        "See hindawi.html. Keyword-for-keyword if→यदि cannot debug at hardware.\n\n" +
        "Current buffer (first 800 chars):\n" + src.slice(0, 800);
      if (window.PANINI_SHAILI) {
        PANINI_SHAILI.load().then((s) => {
          document.getElementById("panel-body").textContent +=
            "\n\nh2c rules loaded: " + s.h2c.length + " from " + s.source +
            "\nDemo h2c('poor_nnaa_mka mukhya') → " + s.applyH2c("poor_nnaa_mka mukhya");
        }).catch((e) => { document.getElementById("panel-body").textContent += "\n" + e; });
      }
      setPanel("output");
    }
    if (b.dataset.cmd === "engineer") {
      const src = getValue();
      document.getElementById("panel-body").textContent =
        "ENGINEER\naxes: " + window.PANINI_TOOLS.axes.join(", ") +
        "\nlines: " + src.split("\n").length +
        "\nfunctions: " + (src.match(/FUNCTION/g) || []).length +
        "\nprints: " + (src.match(/PRINT/g) || []).length +
        "\nCLI: node src/cli.js parse FILE\nPANINI suite: node tests/panini/run.mjs\nStandards harness: node tests/standards/harness.mjs";
      setPanel("output");
    }
    if (b.dataset.cmd === "math") {
      const src = getValue() || "एक योग द्वि";
      const lines = src.split("\n").filter(Boolean).slice(0, 12);
      const out = lines.map((l) => l + "  =>  " + window.PANINI_TOOLS.sanskritEval(l));
      document.getElementById("panel-body").textContent =
        "MATHEMATICIAN\nSanskrit seed + arithmetic\n" + out.join("\n") +
        "\nLexicon:\n" + JSON.stringify(window.PANINI_TOOLS.SA, null, 2);
      setPanel("output");
    }
  };
});
document.querySelectorAll("#activity .act").forEach((b) => b.onclick = () => {
  setSide(b.dataset.side);
  document.getElementById("workbench").classList.toggle("side-open");
});
document.querySelectorAll(".ptab").forEach((b) => b.onclick = () => setPanel(b.dataset.panel));

function startFallbackEditor() {
  usingMonaco = false;
  const ta = document.getElementById("editor-fallback");
  if (ta) {
    ta.value = FILES[current] || "";
    ta.addEventListener("input", () => { FILES[current] = ta.value; });
  }
  renderTabs();
  setSide("explorer");
  document.getElementById("panel-body").textContent =
    "Workbench ready (textarea fallback if Monaco CDN is blocked). VT100 is the terminal. Blockly loads only on the Blocks tab.";
}

function startMonaco() {
  require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" } });
  require(["vs/editor/editor.main"], () => {
    usingMonaco = true;
    monaco.languages.register({ id: "panini" });
    monaco.languages.setMonarchTokensProvider("panini", {
      tokenizer: {
        root: [
          [/\/\/.*$/, "comment"],
          [/\b(MODULE|FUNCTION|RETURN|IF|ELSE|WHILE|END|PRINT|TRUE|FALSE|REM)\b/, "keyword"],
          [/@[A-Za-z_]+/, "type"],
          [/"([^"\\]|\\.)*"/, "string"],
          [/\d+/, "number"],
        ],
      },
    });
    const host = document.getElementById("editor");
    const ta = document.getElementById("editor-fallback");
    if (ta) ta.style.display = "none";
    editor = monaco.editor.create(host, {
      value: FILES[current] || "",
      language: "panini",
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
    });
    editor.onDidChangeCursorPosition((e) => {
      document.getElementById("sb-pos").textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
    });
    renderTabs();
    setSide("explorer");
    document.getElementById("panel-body").textContent = "Workbench ready. Monaco MIT © Microsoft. VT100 is the terminal.";
  }, startFallbackEditor);
}

if (typeof require === "function" && require.config) startMonaco();
else startFallbackEditor();

document.getElementById("ilm")?.addEventListener("change", (e) => {
  document.getElementById("panel-body").textContent =
    "ILM is not a keyword table. Hindawi Shaili Guru: acii2uni | h2c | gcc.\nSelected: " +
    e.target.value + "\nOpen hindawi.html for the retrieved pipeline.";
  setPanel("output");
});

const termIn = document.getElementById("term-in");
if (termIn) {
  termIn.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const line = termIn.value;
    termIn.value = "";
    const sh = document.getElementById("shell").value;
    window.PANINI_VT.exec(line, sh);
    setPanel("terminal");
  });
}
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
let deferred;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; });
document.getElementById("install")?.addEventListener("click", async () => {
  if (deferred) { deferred.prompt(); deferred = null; }
  else alert("Use the browser Install App / Add to Home Screen control.");
});
