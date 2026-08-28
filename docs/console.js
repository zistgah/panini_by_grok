/* tree-rev: 2026.08.28 */
/* Copyright (C) 1993-2026 Abhishek Choudhary
 * SPDX-License-Identifier: GPL-3.0-or-later
 * In-browser VFS + bash + COMMAND.COM — this is the site console, not a stub.
 */
(function (g) {
  function node(dir) { return dir ? { t: "d", c: Object.create(null) } : { t: "f", x: "" }; }
  function create() {
    const root = node(true);
    root.c.home = node(true);
    root.c.home.c.panini = node(true);
    root.c.home.c.panini.c["readme.txt"] = { t: "f", x: "PANINI VFS\nCopyright (C) 1993-2026 Abhishek Choudhary\n" };
    root.c.tmp = node(true);
    root.c.bin = node(true);
    root.c.DOS = node(true);
    root.c.DOS.c["AUTOEXEC.BAT"] = { t: "f", x: "@ECHO OFF\n" };
    return { root, cwd: "/home/panini", drive: "C:" };
  }
  const st = create();
  function split(p) { return String(p).replace(/\\/g, "/").split("/").filter(Boolean); }
  function abs(p) {
    if (!p || p === ".") return st.cwd;
    if (p === "..") { const a = split(st.cwd); a.pop(); return "/" + a.join("/"); }
    if (p[0] === "/" || /^[A-Za-z]:/.test(p)) {
      p = p.replace(/^[A-Za-z]:/, "");
      return p.startsWith("/") ? p : "/" + p;
    }
    return (st.cwd.replace(/\/$/, "") + "/" + p).replace(/\/+/g, "/");
  }
  function walk(path, mk) {
    const parts = split(abs(path));
    let n = st.root;
    for (const p of parts) {
      if (!n.c[p]) {
        if (!mk) return null;
        n.c[p] = node(true);
      }
      n = n.c[p];
    }
    return n;
  }
  function parent(path) {
    const parts = split(abs(path));
    const name = parts.pop();
    return { dir: walk("/" + parts.join("/"), true), name };
  }
  function ls(path) {
    const n = walk(path || st.cwd, false);
    if (!n || n.t !== "d") return [];
    return Object.keys(n.c).sort();
  }
  function bash(line) {
    const p = line.trim().split(/\s+/);
    const c = (p[0] || "").toLowerCase();
    if (!c) return "";
    if (c === "pwd") return st.cwd;
    if (c === "ls") return ls(p[1] || ".").join("\n");
    if (c === "cd") { const n = walk(p[1] || "/home", false); if (n && n.t === "d") st.cwd = abs(p[1]); return st.cwd; }
    if (c === "cat" || c === "type") { const n = walk(p[1], false); return n && n.t === "f" ? n.x : "not found"; }
    if (c === "echo") {
      const j = p.indexOf(">");
      if (j > 0 && p[j + 1]) {
        const { dir, name } = parent(p[j + 1]);
        if (dir) dir.c[name] = { t: "f", x: p.slice(1, j).join(" ") + "\n" };
        return "";
      }
      return p.slice(1).join(" ");
    }
    if (c === "mkdir" || c === "md") { walk(p[1], true); return ""; }
    if (c === "touch") { const { dir, name } = parent(p[1]); dir.c[name] = { t: "f", x: "" }; return ""; }
    if (c === "rm" || c === "del") { const { dir, name } = parent(p[1]); delete dir.c[name]; return ""; }
    if (c === "tree") return JSON.stringify(st.root, null, 2);
    if (c === "help") return "pwd ls cd cat echo mkdir touch rm tree help";
    return c + ": command not found";
  }
  function commandCom(line) {
    const raw = line.trim();
    if (!raw) return "";
    const p = raw.split(/\s+/);
    const c = p[0].toUpperCase();
    if (c === "DIR") {
      const names = ls(p[1] || ".");
      return " Volume in drive C is PANINI\n Directory of " + st.cwd.replace(/\//g, "\\") + "\n\n" +
        names.map((n) => "  " + n).join("\n") + "\n\t" + names.length + " file(s)";
    }
    if (c === "CD" || c === "CHDIR") return bash("cd " + (p[1] || ""));
    if (c === "TYPE") return bash("cat " + (p[1] || ""));
    if (c === "ECHO") {
      if (p[1] === "OFF") return "";
      return p.slice(1).join(" ");
    }
    if (c === "CLS") return "\x1b[2J";
    if (c === "MD" || c === "MKDIR") return bash("mkdir " + p[1]);
    if (c === "DEL" || c === "ERASE") return bash("rm " + p[1]);
    if (c === "COPY") {
      const a = walk(p[1], false);
      if (!a || a.t !== "f") return "File not found";
      const { dir, name } = parent(p[2] || p[1] + ".BAK");
      dir.c[name] = { t: "f", x: a.x };
      return "        1 file(s) copied";
    }
    if (c === "VER") return "PANINI COMMAND.COM\nCopyright (C) 1993-2026 Abhishek Choudhary";
    if (c === "HELP") return "DIR CD TYPE ECHO CLS MD DEL COPY VER HELP";
    return "Bad command or file name";
  }
  g.PANINI_CONSOLE = {
    bash, commandCom, state: st, ls,
    exec(sh, line) {
      const L = String(line || "").trim();
      if (L === "help" || L === "HELP") {
        return sh === "bash"
          ? "pwd ls cat echo mkdir cd rm help"
          : "DIR CD TYPE ECHO CLS MD DEL COPY VER HELP";
      }
      return sh === "bash" ? bash(L) : commandCom(L);
    }
  };
})(window);
