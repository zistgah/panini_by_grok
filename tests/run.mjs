import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lex } from "../compiler/lexer.js";
import { parse } from "../compiler/parser.js";
import { typecheck } from "../compiler/typechecker.js";
import { compile } from "../compiler/compile.js";
import { runSource } from "../runtime/interpreter.js";
import { display, unwrap } from "../runtime/values.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const examples = path.join(root, "examples");

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (e) {
    failed += 1;
    console.error(`  FAIL ${name}`);
    console.error("       " + (e.stack || e.message));
  }
}

await test("lexer_basic", () => {
  const tokens = lex('FUNCTION f(x:Int) -> Int RETURN x END', "t.pni");
  assert.ok(tokens.length > 0);
  assert.equal(tokens[0].value, "FUNCTION");
  assert.ok(tokens.some((t) => t.kind === "IDENT" && t.value === "f"));
});

await test("lexer_comments_and_strings", () => {
  const tokens = lex('/* c */ // line\nPRINT "hi\\n"\n', "t.pni");
  const kinds = tokens.map((t) => t.kind);
  assert.ok(kinds.includes("STRING"));
  assert.equal(tokens.find((t) => t.kind === "STRING").value, "hi\n");
});

await test("parser_basic", () => {
  const ast = parse("RETURN 42", "t.pni");
  assert.equal(ast.kind, "Program");
  assert.equal(ast.body[0].kind, "Return");
  assert.equal(ast.body[0].argument.value, 42);
});

await test("parser_function", () => {
  const ast = parse(`
    FUNCTION factorial(n:Int) -> Int
      IF n <= 1
        RETURN 1
      ELSE
        RETURN n * factorial(n - 1)
      END
    END
  `, "fact.pni");
  const fn = ast.body[0];
  assert.equal(fn.kind, "FunctionDecl");
  assert.equal(fn.name, "factorial");
  assert.equal(fn.params[0].name, "n");
});

await test("typechecker_basic", () => {
  const ast = parse("FUNCTION f(x:Int) -> Int RETURN x END", "t.pni");
  const result = typecheck(ast);
  assert.equal(result.ok, true);
  assert.equal(result.types.f, "Function");
});

await test("compile_pipeline", () => {
  const result = compile("FUNCTION f(x:Int) -> Int RETURN x + 1 END", { filename: "t.pni" });
  assert.equal(result.success, true);
  assert.equal(result.ir.kind, "panini-ir");
  assert.ok(result.ir.functions.some((f) => f.name === "f"));
  assert.ok(result.binary.length > 0);
});

await test("hello_example", async () => {
  const src = fs.readFileSync(path.join(examples, "hello.pni"), "utf8");
  const { result, runtime } = await runSource(src, "hello.pni");
  assert.equal(unwrap(result), 0);
  assert.ok(runtime.prints.includes("Hello, PANINI"));
});

await test("factorial_example", async () => {
  const src = fs.readFileSync(path.join(examples, "factorial.pni"), "utf8");
  const { result } = await runSource(src, "factorial.pni");
  assert.equal(unwrap(result), 720);
});

await test("control_example", async () => {
  const src = fs.readFileSync(path.join(examples, "control.pni"), "utf8");
  const { result, runtime } = await runSource(src, "control.pni");
  // 0..10 sum except 5 = 55-5=50
  assert.equal(unwrap(result), 50);
  assert.ok(runtime.prints.includes("three"));
});

await test("closures_and_lists", async () => {
  const src = `
    FUNCTION compose(f, g)
      RETURN FUNCTION(x)
        RETURN f(g(x))
      END
    END
    FUNCTION inc(x) RETURN x + 1 END
    FUNCTION dbl(x) RETURN x * 2 END
    FUNCTION main()
      h = compose(inc, dbl)
      RETURN h(10)
    END
  `;
  const { result } = await runSource(src, "compose.pni");
  assert.equal(unwrap(result), 21);
});

await test("try_catch", async () => {
  const src = `
    FUNCTION main()
      TRY
        ASSERT FALSE
        RETURN 1
      CATCH error
        RETURN 7
      END
    END
  `;
  const { result } = await runSource(src, "try.pni");
  assert.equal(unwrap(result), 7);
});

await test("file_and_artifact_blocks", async () => {
  const src = fs.readFileSync(path.join(examples, "artifacts.pni"), "utf8");
  const { runtime } = await runSource(src, "artifacts.pni");
  assert.ok(runtime.artifacts.getFile("hello.generated.pni"));
  assert.ok(runtime.artifacts.byId.has("requirements"));
});

await test("selfhost_lexer_in_panini", async () => {
  const src = fs.readFileSync(path.join(examples, "selfhost_lexer.pni"), "utf8");
  const { result, runtime } = await runSource(src, "selfhost_lexer.pni");
  assert.ok(unwrap(result) > 0);
  assert.ok(runtime.prints.includes("FUNCTION"));
  assert.ok(runtime.prints.includes("42"));
});

await test("maps_and_index_assign", async () => {
  const src = `
    FUNCTION main()
      entries = {}
      entries["id"] = "a1"
      RETURN entries["id"]
    END
  `;
  const { result } = await runSource(src, "map.pni");
  assert.equal(unwrap(result), "a1");
});

await test("compiler_idempotence_ir", () => {
  const src = "FUNCTION f(x:Int) -> Int RETURN x END";
  const a = compile(src, { filename: "a.pni" });
  const b = compile(src, { filename: "a.pni" });
  const ja = JSON.stringify(a.ir.functions);
  const jb = JSON.stringify(b.ir.functions);
  assert.equal(ja, jb);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
