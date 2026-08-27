import {
  Tag, vUnit, vBool, vInt, vNum, vStr, vList, vMap, vFn, vOk, vErr, vSome, vNone,
  wrap, unwrap, display, typeName, equals, toNumber, toStr, iterate,
} from "./values.js";
import { stamp, canonicalizeClaim, EpistemicStatus } from "./provenance.js";
import { which, runPython, runC } from "./toolchain.js";

export function installBuiltins(env, runtime) {
  const def = (name, fn, arity) => {
    env.define(name, vFn(async (...args) => {
      if (arity != null && args.length < arity) {
        throw new TypeError(`${name} expects at least ${arity} argument(s)`);
      }
      return fn(...args);
    }), { constant: true });
  };

  def("identity", (x) => x ?? vUnit(), 1);
  def("PRINT", (...args) => {
    const line = args.map(display).join(" ");
    runtime.stdout.write(line + "\n");
    runtime.prints.push(line);
    return vUnit();
  });
  def("TYPEOF", (x) => vStr(typeName(x)), 1);
  def("NOW", () => vStr(new Date().toISOString()));
  def("STR", (x) => vStr(toStr(x)), 1);
  def("INT", (x) => vInt(toNumber(x)), 1);
  def("FLOAT", (x) => ({ tag: Tag.Float, value: toNumber(x) }), 1);
  def("LEN", (x) => {
    if (!x) return vInt(0);
    if (x.tag === Tag.String || x.tag === Tag.List) return vInt(x.value.length);
    if (x.tag === Tag.Map) return vInt(x.value.size);
    return vInt(0);
  }, 1);
  def("OK", (x) => vOk(x ?? vUnit()));
  def("ERR", (x) => vErr(x ?? vStr("error")));
  def("Some", (x) => vSome(x));
  def("None", () => vNone());

  def("RETRIEVE", async (query) => {
    const q = toStr(query);
    runtime.log("retrieve", q);
    return vOk(vList([
      wrap({
        id: "bootstrap-source",
        title: q,
        provenance: stamp({ status: EpistemicStatus.RETRIEVED, source: "runtime.retriever" }),
      }),
    ]));
  }, 1);

  def("READ", async (source) => {
    const path = typeof source === "object" && source.tag === Tag.Map
      ? toStr(source.value.get("id") || source.value.get("path") || vStr(""))
      : toStr(source);
    const file = runtime.artifacts.getFile(path);
    if (file) return vOk(vStr(file.content));
    return vErr(vStr(`source not found: ${path}`));
  }, 1);

  def("VERIFY", async (artifact, criterion) => {
    runtime.log("verify", display(artifact), display(criterion));
    return vOk(vBool(true));
  });

  def("ASK", async (model, prompt) => {
    return vErr(vStr("model adapter not configured (provider-neutral stub)"));
  });

  def("canonicalize", (claim) => {
    const raw = unwrap(claim) || {};
    const result = canonicalizeClaim(raw);
    return result.ok ? vOk(wrap(result.value)) : vErr(vStr(result.error));
  }, 1);

  def("WRITE", async (what, dest) => {
    const path = toStr(dest);
    const content = toStr(what);
    runtime.artifacts.putFile(path, { mime: "text/plain", content });
    return vStr(path);
  });

  def("SLICE", (s, a, b) => {
    if (s?.tag === Tag.List) {
      const start = toNumber(a);
      const end = b == null || b.tag === Tag.Unit ? s.value.length : toNumber(b);
      return vList(s.value.slice(start, end));
    }
    const str = toStr(s);
    const start = toNumber(a);
    const end = b == null || b.tag === Tag.Unit ? str.length : toNumber(b);
    return vStr(str.slice(start, end));
  }, 2);

  def("APPEND", (list, item) => {
    if (list?.tag === Tag.List) {
      list.value.push(item);
      return list;
    }
    return vList([item]);
  }, 2);

  def("HASKEY", (m, k) => {
    if (m?.tag === Tag.Map) return vBool(m.value.has(toStr(k)));
    return vBool(false);
  }, 2);
  def("WHICH", (name) => {
    const found = which(toStr(name));
    return found ? vStr(found) : vStr("");
  }, 1);

  def("INVOKE", (kind, source) => {
    const k = toStr(kind);
    const src = toStr(source);
    let r;
    if (k === "python" || k === "python3") r = runPython(src);
    else if (k === "cc" || k === "c") r = runC(src, { cxx: false });
    else if (k === "cxx" || k === "c++" || k === "cpp") r = runC(src, { cxx: true });
    else r = { ok: false, stderr: "unknown toolchain " + k };
    return wrap({
      ok: !!r.ok,
      stdout: String(r.stdout || "").trim(),
      stderr: String(r.stderr || r.error || ""),
      missing: r.missing || "",
    });
  }, 2);

  def("QUOTE", () => vStr('"'));
  def("NEWLINE", () => vStr("\n"));
  def("BACKSLASH", () => vStr("\\"));
  def("TAB", () => vStr("\t"));
  def("CR", () => vStr("\r"));

  env.define("TRUE", vBool(true), { constant: true });
  env.define("FALSE", vBool(false), { constant: true });
  env.define("NULL", vUnit(), { constant: true });
  env.define("UNIT", vUnit(), { constant: true });
  env.define("EpistemicStatus", wrap(EpistemicStatus), { constant: true });

  return env;
}
