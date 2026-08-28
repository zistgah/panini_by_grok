#!/usr/bin/env node
/**
 * Copyright (C) 1993-2026 Abhishek Choudhary
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * ISO C harness. Acceptance is ISO green, not a subset demo.
 * Corpus: c-testsuite single-exec (retrieved).
 * Oracle: gcc -std=c17.
 * Subject: PANINI.Frontend.C
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { runFrontend } from "../runtime/foreign_front.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tarball = path.join(root, "tests/iso/c/c-testsuite.tar.gz");
const extractRoot = "/tmp/c-testsuite-master";
const limit = Number(process.env.ISO_C_LIMIT || 0);

function ensureSuite() {
  let dir = path.join(extractRoot, "tests/single-exec");
  if (fs.existsSync(dir)) return dir;
  if (fs.existsSync("/tmp/c-testsuite-master/tests/single-exec")) {
    return "/tmp/c-testsuite-master/tests/single-exec";
  }
  if (fs.existsSync(tarball)) {
    execFileSync("tar", ["-xzf", tarball, "-C", "/tmp"]);
  }
  dir = "/tmp/c-testsuite-master/tests/single-exec";
  if (!fs.existsSync(dir)) {
    throw new Error("c-testsuite single-exec not found; retrieve tests/iso/c/c-testsuite.tar.gz");
  }
  return dir;
}

function gccRun(cfile, expected) {
  const bin = "/tmp/iso-c-case";
  try {
    execFileSync("gcc", ["-std=c17", "-O0", cfile, "-o", bin], {
      timeout: 15000,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    return { ok: false, stage: "compile", err: String(e.stderr || e.message).slice(0, 200) };
  }
  try {
    const out = execFileSync(bin, { timeout: 5000, encoding: "utf8" });
    const exp = expected == null ? "" : expected;
    return { ok: out === exp, stage: "run", out, exp };
  } catch (e) {
    const status = e.status;
    if (status === 0) return { ok: true, stage: "run" };
    return { ok: false, stage: "run", err: "exit " + status };
  }
}

async function paniniRun(src, expected) {
  const origWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = () => true;
  try {
    const r = await runFrontend("c", src);
    const out = (r.prints || []).map(String).join("");
    const exp = expected == null ? "" : expected;
    return {
      ok: false,
      stage: "frontend",
      note: "PANINI C is not an ISO C implementation; .expected match required for green",
      out,
      exp,
      frontend: r.frontend || r.panini_frontend,
    };
  } catch (e) {
    return { ok: false, stage: "crash", err: String(e.message || e).slice(0, 200) };
  } finally {
    process.stdout.write = origWrite;
  }
}

const suite = ensureSuite();
let files = fs.readdirSync(suite).filter((f) => f.endsWith(".c")).sort();
if (limit > 0) files = files.slice(0, limit);

const report = {
  theorem: "ISO_GREEN(C)",
  standard: "ISO/IEC 9899:2018 (C17)",
  corpus: "c-testsuite tests/single-exec",
  oracle: "gcc -std=c17",
  subject: "PANINI.Frontend.C",
  green: false,
  cases: files.length,
  gcc: { pass: 0, fail: 0 },
  panini: { pass: 0, fail: 0 },
  sample_fail: [],
};

for (const f of files) {
  const cfile = path.join(suite, f);
  const expPath = cfile + ".expected";
  const expected = fs.existsSync(expPath) ? fs.readFileSync(expPath, "utf8") : "";
  const g = gccRun(cfile, expected);
  if (g.ok) report.gcc.pass++;
  else {
    report.gcc.fail++;
    if (report.sample_fail.length < 5) report.sample_fail.push({ case: f, engine: "gcc", ...g });
  }
  const src = fs.readFileSync(cfile, "utf8");
  const p = await paniniRun(src, expected);
  if (p.ok === true && p.out === expected) report.panini.pass++;
  else {
    report.panini.fail++;
    if (report.sample_fail.filter((x) => x.engine === "panini").length < 8) {
      report.sample_fail.push({ case: f, engine: "panini", stage: p.stage, frontend: p.frontend });
    }
  }
}

report.green = report.panini.fail === 0 && report.panini.pass === report.cases && report.cases > 0;
report.status = report.green ? "ISO GREEN" : "NOT GREEN";
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.green ? 0 : 2;
