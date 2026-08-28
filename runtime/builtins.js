import {
  Tag, vUnit, vBool, vInt, vNum, vStr, vList, vMap, vFn, vOk, vErr, vSome, vNone,
  wrap, unwrap, display, typeName, equals, toNumber, toStr, iterate,
} from "./values.js";
import { stamp, canonicalizeClaim, EpistemicStatus } from "./provenance.js";
import { which, runPython, runC } from "./toolchain.js";
import { axpy, scal, nrm2, gemv, gemm, autotuneGemm } from "./blas.js";
import { tensor, matmul, tadd, relu } from "./tensor.js";
import { createVfs } from "./vfs.js";
import { createPosix, syscall } from "./posix.js";
import { engine as ociEngine, ENVIRONMENTS, runEnv, ociConfig } from "./oci.js";
import { createVt100, vtWrite, vtPlain, vtSnapshot } from "./vt100.js";
import { defaultDosFont, loadFontFile, getFont, listFonts } from "./fonts.js";
import { renderTextBitmap } from "./dosfont.js";

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
  def("AXPY", (n, a, x, y) => wrap(axpy(toNumber(n), toNumber(a), unwrap(x), unwrap(y))), 4);
  def("SCAL", (n, a, x) => wrap(scal(toNumber(n), toNumber(a), unwrap(x))), 3);
  def("NRM2", (n, x) => wrap(nrm2(toNumber(n), unwrap(x))), 2);
  def("GEMV", (m, n, a, x) => wrap(gemv(toNumber(m), toNumber(n), unwrap(a), unwrap(x))), 4);
  def("GEMM", (m, n, k, a, b) => wrap(gemm(toNumber(m), toNumber(n), toNumber(k), unwrap(a), unwrap(b))), 5);
  def("GEMM_TUNE", (m, n, k, a, b) => wrap(autotuneGemm(toNumber(m), toNumber(n), toNumber(k), unwrap(a), unwrap(b))), 5);
  def("TENSOR", (data) => wrap(tensor(unwrap(data))), 1);
  def("MATMUL", (a, b) => wrap(matmul(unwrap(a), unwrap(b))), 2);
  def("TADD", (a, b) => wrap(tadd(unwrap(a), unwrap(b))), 2);
  def("RELU", (a) => wrap(relu(unwrap(a))), 1);
  def("GFX_CLEAR", () => { runtime.gfx = []; return vStr("ok"); });
  def("GFX_RECT", (x, y, w, h) => { (runtime.gfx ||= []).push({op:"rect",x:toNumber(x),y:toNumber(y),w:toNumber(w),h:toNumber(h)}); return vUnit(); }, 4);
  def("GFX_LINE", (x1,y1,x2,y2) => { (runtime.gfx ||= []).push({op:"line",x1:toNumber(x1),y1:toNumber(y1),x2:toNumber(x2),y2:toNumber(y2)}); return vUnit(); }, 4);
  def("GFX_CIRCLE", (x,y,r) => { (runtime.gfx ||= []).push({op:"circle",x:toNumber(x),y:toNumber(y),r:toNumber(r)}); return vUnit(); }, 3);

  if (!runtime.vfs) runtime.vfs = createVfs();
  const vfs = runtime.vfs;
  def("VFS_PWD", () => vStr(vfs.pwd()));
  def("VFS_CD", (p) => wrap(vfs.cd(toStr(p))), 1);
  def("VFS_LS", (p) => wrap(vfs.ls(p == null ? "." : toStr(p)).names), 0);
  def("VFS_READ", (p) => wrap(vfs.read(toStr(p)).content), 1);
  def("VFS_WRITE", (p, c) => wrap(vfs.write(toStr(p), toStr(c))), 2);
  def("VFS_MKDIR", (p) => wrap(vfs.mkdir(toStr(p))), 1);
  def("VFS_RM", (p) => wrap(vfs.rm(toStr(p))), 1);
  def("VFS_EXISTS", (p) => vBool(vfs.exists(toStr(p))), 1);
  def("VFS_TREE", () => vStr(vfs.tree()));

  if (!runtime.posix) runtime.posix = createPosix(vfs);
  const px = runtime.posix;
  def("SYS_GETCWD", () => wrap(syscall(px.init, vfs, "getcwd", []).value));
  def("SYS_CHDIR", (p) => wrap(syscall(px.init, vfs, "chdir", [toStr(p)])), 1);
  def("SYS_MKDIR", (p) => wrap(syscall(px.init, vfs, "mkdir", [toStr(p)])), 1);
  def("SYS_OPEN", (p, m) => wrap(syscall(px.init, vfs, "open", [toStr(p), m == null ? "r" : toStr(m)])), 1);
  def("SYS_READ", (fd) => wrap(syscall(px.init, vfs, "read", [toNumber(fd)])), 1);
  def("SYS_WRITE", (fd, data) => wrap(syscall(px.init, vfs, "write", [toNumber(fd), toStr(data)])), 2);
  def("SYS_CLOSE", (fd) => wrap(syscall(px.init, vfs, "close", [toNumber(fd)])), 1);
  def("SYS_UNLINK", (p) => wrap(syscall(px.init, vfs, "unlink", [toStr(p)])), 1);
  def("SYS_STAT", (p) => wrap(syscall(px.init, vfs, "stat", [toStr(p)])), 1);
  def("OCI_ENGINE", () => vStr(ociEngine() || ""));
  def("OCI_LIST", () => wrap(Object.keys(ENVIRONMENTS)));
  def("OCI_CONFIG", () => wrap(ociConfig()));
  def("OCI_RUN", (name) => wrap(runEnv(toStr(name))), 1);

  if (!runtime.vt) runtime.vt = createVt100();
  defaultDosFont();
  def("ESC", () => vStr("\x1b"));
  def("VT_RESET", () => { runtime.vt = createVt100(); return vStr("ok"); });
  def("VT_WRITE", (s) => { vtWrite(runtime.vt, toStr(s)); return vStr(vtPlain(runtime.vt)); }, 1);
  def("VT_DUMP", () => vStr(vtPlain(runtime.vt)));
  def("VT_SNAPSHOT", () => wrap(vtSnapshot(runtime.vt)));
  def("VT_FONT", (name) => {
    runtime.vt.fontName = toStr(name);
    return vStr(runtime.vt.fontName);
  }, 1);
  def("VT_LOAD_FONT", (name, path) => {
    const font = loadFontFile(toStr(name), toStr(path));
    runtime.vt.fontName = font.name;
    return vStr(font.kind + ":" + font.name);
  }, 2);
  def("VT_FONTS", () => wrap(listFonts()));
  def("VT_RENDER", (text) => {
    const bmp = renderTextBitmap(getFont(runtime.vt.fontName), text == null ? vtPlain(runtime.vt) : toStr(text));
    return wrap({ width: bmp.width, height: bmp.height, rows: bmp.height });
  });

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
