/**
 * End-to-end: C and Hindi C → host C → WAT → WASM.
 * Copyright (C) 1993-2026 Abhishek Choudhary | GPL-3.0-or-later
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { pathToFileURL } from "node:url";
import { runCWasm } from "../docs/engine/interp/host.js";

const c = "int compute(int x){int result;result=x+10*2;return result;} int main(){return compute(5);}";
const r = await runCWasm(c, "compute", [5]);
assert.equal(r.value, 25);
console.log("ok   c_compute_5", r.value);

const g = await runCWasm("int main(){ int x; x=1; goto skip; x=2; skip: return x; }", "main", []);
assert.equal(g.value, 1);
console.log("ok   c_goto_skip", g.value);

const hindi = fs.readFileSync("examples/wasm/gana.uhin", "utf8");
const ctx = {
  console,
  fetch: async (url) => {
    const p = String(url).startsWith("file:") ? new URL(url).pathname : path.resolve("docs/engine/bundle.json");
    const body = fs.readFileSync(p.endsWith(".json") ? (fs.existsSync(p) ? p : "docs/engine/bundle.json") : "docs/engine/bundle.json", "utf8");
    return { ok: true, json: async () => JSON.parse(body), text: async () => body };
  },
};
ctx.window = ctx;
ctx.globalThis = ctx;
vm.runInNewContext(fs.readFileSync("docs/engine/nb.js", "utf8"), ctx);
await ctx.PANINI_NB.load("docs/engine/bundle.json");
const compiled = ctx.PANINI_NB.compile({ src: hindi, lang: "hindi", shaili: "guru" });
assert.ok(/int /.test(compiled.host), compiled.host.slice(0, 200));
const h = await runCWasm(compiled.host, "main", []);
assert.equal(h.value, 25, compiled.host);
console.log("ok   hindi_gana_5", h.value);
console.log("FLOW_E2E_OK");
