/* PANINI in-browser VS Code workbench (Monaco). Full compiler remains Node CLI. */
const FILES = { ...window.PANINI_CATALOG.samples };
let editor, current = "double.pni";

function setSide(mode) {
  document.querySelectorAll("#activity .act").forEach((b) => b.classList.toggle("active", b.dataset.side === mode));
  const title = { explorer: "EXPLORER", search: "FEATURES", arch: "ARCHITECTURE", debug: "RUN AND DEBUG", ext: "FRONTENDS" }[mode];
  document.getElementById("side-title").textContent = title;
  const body = document.getElementById("side-body");
  if (mode === "explorer") {
    body.innerHTML = Object.keys(FILES).concat(window.PANINI_TREE).filter((v, i, a) => a.indexOf(v) === i)
      .map((f) => `<button class="file" data-file="${f}">${f}</button>`).join("");
    body.querySelectorAll(".file").forEach((b) => b.onclick = () => openFile(b.dataset.file));
  } else if (mode === "search" || mode === "ext") {
    body.innerHTML = window.PANINI_CATALOG.features.map((f) =>
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
    FILES[name] = `// ${name}\n// Opened from the static tree. Content lives in the repo; this tab is a placeholder.\n`;
  }
  current = name;
  renderTabs();
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel(), langOf(name));
    editor.setValue(FILES[name]);
  }
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
  if (editor) FILES[current] = editor.getValue();
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
  if (name === "vt") {
    pre.hidden = true; canvas.hidden = false;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#001400"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff66"; ctx.font = "14px monospace";
    ctx.fillText("VT100  DOS 8x16", 8, 24);
    ctx.fillText("ABCXYZ 0123456789", 8, 48);
  } else {
    canvas.hidden = true; pre.hidden = false;
    if (name === "problems") pre.textContent = "No problems in browser subset.";
    if (name === "terminal") pre.textContent = "panini>  (static Pages — use node src/cli.js bash for VFS shell)";
  }
}

document.querySelectorAll("[data-cmd]").forEach((b) => {
  b.onclick = () => {
    if (b.dataset.cmd === "run") runCurrent();
    if (b.dataset.cmd === "docs") { setSide("arch"); setPanel("output"); document.getElementById("panel-body").textContent = window.PANINI_CATALOG.architecture; }
    if (b.dataset.cmd === "status") { setSide("search"); }
    if (b.dataset.cmd === "term") setPanel("terminal");
  };
});
document.querySelectorAll("#activity .act").forEach((b) => b.onclick = () => setSide(b.dataset.side));
document.querySelectorAll(".ptab").forEach((b) => b.onclick = () => setPanel(b.dataset.panel));

require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" } });
require(["vs/editor/editor.main"], () => {
  monaco.languages.register({ id: "panini" });
  monaco.languages.setMonarchTokensProvider("panini", {
    tokenizer: {
      root: [
        [/\/\/.*$/, "comment"],
        [/\b(MODULE|FUNCTION|RETURN|IF|ELSE|WHILE|END|PRINT|TRUE|FALSE)\b/, "keyword"],
        [/@[A-Za-z_]+/, "type"],
        [/"([^"\\]|\\.)*"/, "string"],
        [/\d+/, "number"],
      ],
    },
  });
  editor = monaco.editor.create(document.getElementById("editor"), {
    value: FILES[current],
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
  document.getElementById("panel-body").textContent = "Monaco workbench ready. Run the current file in-browser, or use the Node CLI for full frontends.";
});
