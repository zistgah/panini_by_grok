/**
 * Lower Rust / Go / Julia to C for STANDARD_GREEN single-exec.
 * Lex/parse remain in the PANINI frontend. This is host-speed desugar
 * (same slot as CPPLOWER / CINTERP).
 * Copyright (C) 1993-2026 Abhishek Choudhary | GPL-3.0-or-later
 */

function twoChar(s) {
  return s.replace(/::/g, "_");
}

export function rustToC(src) {
  let s = String(src);
  s = s.replace(/\r\n/g, "\n");
  s = s.replace(/\/\/.*$/gm, "");
  s = s.replace(/println!\s*\(([^)]*)\)\s*;/g, "printf(\"%d\\n\", $1);");
  s = s.replace(/\bpub\s+/g, "");
  s = s.replace(/\bfn\s+main\s*\(\s*\)\s*(->\s*i32)?/g, "int main()");
  s = s.replace(/\bfn\s+/g, "int ");
  s = s.replace(/:\s*i32/g, "");
  s = s.replace(/:\s*i64/g, "");
  s = s.replace(/:\s*u32/g, "");
  s = s.replace(/:\s*usize/g, "");
  s = s.replace(/:\s*isize/g, "");
  s = s.replace(/:\s*bool/g, "");
  s = s.replace(/\s*->\s*i32/g, "");
  s = s.replace(/\s*->\s*bool/g, "");
  s = s.replace(/\blet\s+mut\s+/g, "int ");
  s = s.replace(/\blet\s+/g, "int ");
  s = s.replace(/\bmut\s+/g, "");
  s = s.replace(/\btrue\b/g, "1");
  s = s.replace(/\bfalse\b/g, "0");
  s = s.replace(/\b(if|while)\s+([^{]+)\{/g, (_, k, c) => k + " (" + c.trim() + ") {");
  s = twoChar(s);
  if (!/\bint main\s*\(/.test(s)) s += "\nint main(){return 0;}\n";
  return s;
}

export function goToC(src) {
  let s = String(src);
  s = s.replace(/\r\n/g, "\n");
  s = s.replace(/\/\/.*$/gm, "");
  s = s.replace(/package\s+\w+\s*/g, "");
  s = s.replace(/import\s+"[^"]+"\s*/g, "");
  s = s.replace(/import\s+\(([^)]*)\)/g, "");
  s = s.replace(/fmt\.Println\s*\(([^)]*)\)/g, "printf(\"%d\\n\", $1)");
  s = s.replace(/fmt\.Print\s*\(([^)]*)\)/g, "printf(\"%d\", $1)");
  s = s.replace(/os\.Exit\s*\(([^)]*)\)/g, "return $1");
  s = s.replace(/\bfunc\s+main\s*\(\s*\)/g, "int main()");
  s = s.replace(/\bfunc\s+(\w+)\s*\(([^)]*)\)\s*int/g, (_, n, p) => {
    const ps = p.split(",").map((x) => x.trim()).filter(Boolean).map((x) => {
      const m = x.match(/^(\w+)\s+int$/);
      return m ? "int " + m[1] : (x.startsWith("int ") ? x : "int " + x);
    });
    return "int " + n + "(" + ps.join(", ") + ")";
  });
  s = s.replace(/\bfunc\s+/g, "int ");
  s = s.replace(/\bvar\s+(\w+)\s+int\s*=/g, "int $1 =");
  s = s.replace(/\bvar\s+(\w+)\s+int\b/g, "int $1");
  s = s.replace(/\b(\w+)\s*:=/g, "int $1 =");
  s = s.replace(/\bfor\s+([^ {]+)\s*\{/g, "while ($1) {");
  s = s.replace(/\btrue\b/g, "1");
  s = s.replace(/\bfalse\b/g, "0");
  s = s.replace(/\bnil\b/g, "0");
  s = s.replace(/\b(if|while)\s+([^{]+)\{/g, (_, k, c) => k + " (" + c.trim() + ") {");
  if (/\bint main\s*\(\s*\)\s*\{/.test(s) && !/int main\s*\(\s*\)\s*\{[\s\S]*\breturn\b/.test(s)) {
    const idx = s.lastIndexOf("}");
    if (idx >= 0) s = s.slice(0, idx) + "return 0;\n" + s.slice(idx);
  }
  return s;
}

export function juliaToC(src) {
  let s = String(src);
  s = s.replace(/\r\n/g, "\n");
  s = s.replace(/#.*$/gm, "");
  s = s.replace(/\bprintln\s*\(([^)]*)\)/g, "printf(\"%d\\n\", $1)");
  s = s.replace(/\bprint\s*\(([^)]*)\)/g, "printf(\"%d\", $1)");
  s = s.replace(/\bfunction\s+main\s*\(\s*\)/g, "int main()");
  s = s.replace(/\bfunction\s+(\w+)\s*\(([^)]*)\)/g, (_, n, p) => {
    const ps = p.split(",").map((x) => x.trim()).filter(Boolean).map((x) => x.startsWith("int ") ? x : "int " + x);
    return "int " + n + "(" + ps.join(", ") + ")";
  });
  s = s.replace(/\btrue\b/g, "1");
  s = s.replace(/\bfalse\b/g, "0");
  s = s.replace(/\bif\s+([^;\n]+);\s*return\s+([^;]+);\s*end/g, "if ($1) { return $2; }");
  s = s.replace(/\bend\b/g, "}");
  s = s.replace(/\bwhile\s+([^\n]+)\n/g, "while ($1) {\n");
  const seen = new Set();
  s = s.replace(/(\n\s*)([A-Za-z_]\w*)\s*=\s*([^\n]+)/g, (m, sp, n, e) => {
    const rhs = String(e).replace(/;\s*$/, "");
    if (seen.has(n)) return sp + n + " = " + rhs + ";";
    seen.add(n);
    return sp + "int " + n + " = " + rhs + ";";
  });
  s = s.replace(/return ([^\n;]+)\n/g, "return $1;\n");
  s = s.replace(/::Int64\b/g, "");
  s = s.replace(/::Int\b/g, "");
  s = s.replace(/int ([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\n/g, "int $1($2){\n");
  s = s.replace(/int main\s*\(\s*\)\s*\n/g, "int main(){\n");
  if (!/\bint main\s*\(/.test(s)) s += "\nint main(){return 0;}\n";
  return s;
}
