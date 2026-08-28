#!/usr/bin/env node
/* Copyright (C) 1993-2026 Abhishek Choudhary | GPL-3.0-or-later */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runSource } from "../runtime/interpreter.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cases = [
  ["01_gcd.pni", 6],
  ["03_stack.pni", 30],
  ["04_bits.pni", 1],
  ["05_fcfs.pni", 13],
  ["06_dfa.pni", 1],
  ["07_lex.pni", 3],
  ["08_checksum.pni", 64],
];
let n = 0, fail = 0;
for (const [f, expect] of cases) {
  n++;
  const src = fs.readFileSync(path.join(root, "examples/gate_cse", f), "utf8");
  const r = await runSource(src, f);
  const v = r.result && (r.result.value !== undefined ? r.result.value : r.result);
  if (v !== expect) { fail++; console.log("FAIL", f, "got", v, "want", expect); }
  else console.log("ok  ", f, "->", v);
}
console.log(fail ? `FAILED ${fail}/${n}` : `PASSED ${n}/${n}  GATE CSE examples`);
process.exit(fail ? 1 : 0);
