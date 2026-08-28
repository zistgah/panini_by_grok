/**
 * Copyright (C) 1993-2026 Abhishek Choudhary
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Host loader for PANINI-written frontends. The frontend is the .pni.
 * JavaScript here only loads and calls it (REQ-004 / T_FRONTEND_PANINI).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runSource } from "./interpreter.js";
import { wrap, unwrap } from "./values.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const TABLE = {
  python: { file: "src/panini/frontends/python.pni", fn: "run_python" },
  py: { file: "src/panini/frontends/python.pni", fn: "run_python" },
  c: { file: "src/panini/frontends/c.pni", fn: "run_c" },
  javascript: { file: "src/panini/frontends/application.pni", fn: "run_javascript" },
  js: { file: "src/panini/frontends/application.pni", fn: "run_javascript" },
  java: { file: "src/panini/frontends/application.pni", fn: "run_java" },
  sql: { file: "src/panini/frontends/application.pni", fn: "run_sql" },
  php: { file: "src/panini/frontends/application.pni", fn: "run_php" },
  ruby: { file: "src/panini/frontends/application.pni", fn: "run_ruby" },
  rb: { file: "src/panini/frontends/application.pni", fn: "run_ruby" },
  csharp: { file: "src/panini/frontends/application.pni", fn: "run_csharp" },
  cs: { file: "src/panini/frontends/application.pni", fn: "run_csharp" },
  r: { file: "src/panini/frontends/application.pni", fn: "run_r" },
  perl: { file: "src/panini/frontends/application.pni", fn: "run_perl" },
  pl: { file: "src/panini/frontends/application.pni", fn: "run_perl" },
  basic: { file: "src/panini/frontends/application.pni", fn: "run_basic" },
  bas: { file: "src/panini/frontends/application.pni", fn: "run_basic" },
  logo: { file: "src/panini/frontends/application.pni", fn: "run_logo" },
  fortran: { file: "src/panini/frontends/fortran.pni", fn: "run_fortran" },
  rust: { file: "src/panini/frontends/rust.pni", fn: "run_rust" },
  typescript: { file: "src/panini/frontends/typescript.pni", fn: "run_typescript" },
  go: { file: "src/panini/frontends/go.pni", fn: "run_go" },
  zig: { file: "src/panini/frontends/zig.pni", fn: "run_zig" },
  lua: { file: "src/panini/frontends/lua.pni", fn: "run_lua" },
  cpp: { file: "src/panini/frontends/c.pni", fn: "run_c" },
};

export function supportedFrontends() {
  return Object.keys(TABLE);
}

export async function runFrontend(lang, source) {
  const spec = TABLE[lang];
  if (!spec) return { ok: false, error: "unknown frontend " + lang };
  const file = path.join(root, spec.file);
  const { interpreter } = await runSource(fs.readFileSync(file, "utf8"), file, { runMain: false });
  const fn = interpreter.runtime.functions.get(spec.fn);
  if (!fn) return { ok: false, error: "PANINI frontend missing " + spec.fn };
  const panini = unwrap(await interpreter.callValue(fn, [wrap(source)], interpreter.global));
  return panini;
}
