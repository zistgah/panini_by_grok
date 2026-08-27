#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { lex } from "../compiler/lexer.js";
import { parse } from "../compiler/parser.js";
import { typecheck } from "../compiler/typechecker.js";
import { compile } from "../compiler/compile.js";
import { Interpreter, Runtime, runSource } from "../runtime/interpreter.js";
import { display } from "../runtime/values.js";

const args = process.argv.slice(2);
const cmd = args[0] || "help";

function readInput(file) {
  if (!file || file === "-") return fs.readFileSync(0, "utf8");
  return fs.readFileSync(file, "utf8");
}

async function main() {
  switch (cmd) {
    case "help":
    case "--help":
    case "-h":
      printHelp();
      return;
    case "version":
    case "--version":
      console.log("PANINI 0.1.0 (js-stage-0 bootstrap)");
      return;
    case "lex": {
      const file = args[1];
      const src = readInput(file);
      const tokens = lex(src, file || "<stdin>");
      console.log(JSON.stringify(tokens.map(briefToken), null, 2));
      return;
    }
    case "parse": {
      const file = args[1];
      const src = readInput(file);
      const ast = parse(src, file || "<stdin>");
      console.log(JSON.stringify(ast, null, 2));
      return;
    }
    case "typecheck": {
      const file = args[1];
      const src = readInput(file);
      const ast = parse(src, file || "<stdin>");
      const result = typecheck(ast);
      console.log(JSON.stringify({ ok: result.ok, diagnostics: result.diagnostics, types: result.types }, null, 2));
      process.exitCode = result.ok ? 0 : 1;
      return;
    }
    case "compile": {
      const file = args[1];
      const target = flag("target") || "json";
      const src = readInput(file);
      const result = compile(src, { filename: file || "<stdin>", target });
      const out = flag("out");
      const text = result.binary.toString("utf8");
      if (out) fs.writeFileSync(out, text);
      else console.log(text);
      process.exitCode = result.success ? 0 : 1;
      return;
    }
    case "run-spec": {
      await import("../scripts/run_spec.mjs");
      return;
    }
    case "run": {
      const file = args[1];
      const src = readInput(file);
      const specMode = /SPEC|\.pni$/i.test(file || "") && /CONSTITUTION|SELF_HOSTING/.test(src);
      const { result, runtime } = await runSource(src, file || "<stdin>", { specMode });
      if (process.env.PANINI_SHOW_RESULT === "1") {
        console.log("=>", display(result));
      }
      if (process.env.PANINI_MANIFEST === "1") {
        console.error(JSON.stringify(runtime.artifacts.manifest(), null, 2));
      }
      return;
    }
    case "repl":
      await repl();
      return;
    case "python":
    case "py":
    case "cc":
    case "c":
    case "c++":
    case "cpp":
    case "cxx":
    case "fortran":
    case "f90":
    case "f":
    case "rust":
    case "rs":
    case "typescript":
    case "ts":
    case "go":
    case "zig": {
      const src = readInput(args[1]);
      if (args.includes("--host")) {
        const { runPython, runC } = await import("../runtime/toolchain.js");
        const r = cmd === "python" || cmd === "py"
          ? runPython(src)
          : runC(src, { cxx: cmd === "cpp" || cmd === "c++" || cmd === "cxx" });
        process.stdout.write(r.stdout || "");
        if (r.stderr) process.stderr.write(r.stderr);
        process.exitCode = r.ok ? 0 : 1;
        return;
      }
      const { runFrontend } = await import("../runtime/foreign_front.js");
      const lang = ({ python:"python", py:"python", fortran:"fortran", f90:"fortran", f:"fortran",
        rust:"rust", rs:"rust", typescript:"typescript", ts:"typescript", go:"go", zig:"zig",
        cc:"c", c:"c" }[cmd]) || "cpp";
      const r = await runFrontend(lang, src);
      if (r && r.ok !== false && r.value !== undefined) console.log(r.value);
      else if (r && r.stdout) process.stdout.write(String(r.stdout));
      process.exitCode = r && r.ok !== false ? 0 : 1;
      return;
    }
    case "bash":
      await runSource(fs.readFileSync(new URL("../stdlib/bash.pni", import.meta.url), "utf8"), "bash.pni");
      return;
    case "selfhost":
      await import("../scripts/selfhost.mjs");
      return;
    default: {
      // bare file path
      if (fs.existsSync(cmd)) {
        const src = readInput(cmd);
        await runSource(src, cmd);
        return;
      }
      console.error(`Unknown command: ${cmd}`);
      printHelp();
      process.exitCode = 2;
    }
  }
}

function flag(name) {
  const i = args.indexOf("--" + name);
  if (i >= 0) return args[i + 1];
  const pref = "--" + name + "=";
  const hit = args.find((a) => a.startsWith(pref));
  return hit ? hit.slice(pref.length) : null;
}

function briefToken(t) {
  return { kind: t.kind, value: t.value, line: t.start?.line, column: t.start?.column };
}

function printHelp() {
  console.log(`PANINI 0.1.0 — JS bootstrap runtime

Usage:
  panini run <file.pni>
  panini lex <file.pni>
  panini parse <file.pni>
  panini typecheck <file.pni>
  panini compile <file.pni> [--target json|js] [--out file]
  panini python <file.py>     # invoke host python3
  panini cc <file.c>          # invoke host cc
  panini cpp <file.cpp>       # invoke host c++
  panini repl
  panini version
`);
}

async function repl() {
  const readline = await import("node:readline");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const runtime = new Runtime();
  const interp = new Interpreter(runtime);
  console.log("PANINI REPL (js-stage-0). END blocks required. Ctrl-D to exit.");
  const prompt = () => new Promise((res) => rl.question("panini> ", res));
  for (;;) {
    const line = await prompt();
    if (line == null) break;
    if (line.trim() === "") continue;
    if (line.trim() === ":quit") break;
    try {
      const { parse } = await import("../compiler/parser.js");
      const ast = parse(line, "<repl>");
      const result = await interp.interpret(ast, { env: interp.global, runMain: false });
      console.log(display(result));
    } catch (e) {
      console.error(String(e.message || e));
    }
  }
  rl.close();
}

main().catch((err) => {
  console.error(err.stack || err);
  process.exit(1);
});
