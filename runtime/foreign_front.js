import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runSource } from "./interpreter.js";
import { wrap, unwrap } from "./values.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function normalizeCpp(source) {
  return source
    .replace(/#include[^\n]*/g, "")
    .replace(/using\s+namespace\s+std\s*;/g, "")
    .replace(/std::cout\s*<</g, "printf(")
    .replace(/<<\s*std::endl/g, ")")
    .replace(/std::endl/g, "");
}

export async function runFrontend(lang, source) {
  const kind = lang === "python" || lang === "py" ? "python"
    : lang === "fortran" || lang === "f90" || lang === "f" ? "fortran"
    : lang === "cpp" || lang === "cxx" || lang === "c++" ? "cpp" : "c";
  const file = kind === "python"
    ? path.join(root, "src/panini/frontends/python.pni")
    : kind === "fortran"
    ? path.join(root, "src/panini/frontends/fortran.pni")
    : path.join(root, "src/panini/frontends/c.pni");
  const src = kind === "cpp" ? normalizeCpp(source) : source;
  const { interpreter } = await runSource(fs.readFileSync(file, "utf8"), file, { runMain: false });
  const name = kind === "python" ? "run_python" : kind === "fortran" ? "run_fortran" : "run_c";
  const fn = interpreter.runtime.functions.get(name);
  if (!fn) return { ok: false, error: name + " missing" };
  const result = unwrap(await interpreter.callValue(fn, [wrap(src)], interpreter.global));
  return result;
}
