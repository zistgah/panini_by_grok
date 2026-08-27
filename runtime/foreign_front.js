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
  cc: { file: "src/panini/frontends/c.pni", fn: "run_c" },
  cpp: { file: "src/panini/frontends/c.pni", fn: "run_c", cpp: true },
  cxx: { file: "src/panini/frontends/c.pni", fn: "run_c", cpp: true },
  "c++": { file: "src/panini/frontends/c.pni", fn: "run_c", cpp: true },
  fortran: { file: "src/panini/frontends/fortran.pni", fn: "run_fortran" },
  f90: { file: "src/panini/frontends/fortran.pni", fn: "run_fortran" },
  rust: { file: "src/panini/frontends/rust.pni", fn: "run_rust" },
  rs: { file: "src/panini/frontends/rust.pni", fn: "run_rust" },
  typescript: { file: "src/panini/frontends/typescript.pni", fn: "run_typescript" },
  ts: { file: "src/panini/frontends/typescript.pni", fn: "run_typescript" },
  go: { file: "src/panini/frontends/go.pni", fn: "run_go" },
  zig: { file: "src/panini/frontends/zig.pni", fn: "run_zig" },
};

function normalizeCpp(source) {
  return source
    .replace(/#include[^\n]*/g, "")
    .replace(/using\s+namespace\s+std\s*;/g, "")
    .replace(/std::cout\s*<</g, "printf(")
    .replace(/<<\s*std::endl/g, ")")
    .replace(/std::endl/g, "");
}

export function supportedFrontends() {
  return Object.keys(TABLE);
}

export async function runFrontend(lang, source) {
  const spec = TABLE[lang];
  if (!spec) return { ok: false, error: "unknown frontend " + lang };
  let src = source;
  if (spec.cpp) src = normalizeCpp(source);
  const file = path.join(root, spec.file);
  const { interpreter } = await runSource(fs.readFileSync(file, "utf8"), file, { runMain: false });
  const fn = interpreter.runtime.functions.get(spec.fn);
  if (!fn) return { ok: false, error: spec.fn + " missing" };
  return unwrap(await interpreter.callValue(fn, [wrap(src)], interpreter.global));
}
