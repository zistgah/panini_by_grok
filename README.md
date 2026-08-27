# PANINI

Self-hosting general-purpose computational language and execution environment.

Version: **0.1.0**  
Implementation: **JavaScript Stage-0 bootstrap**

PANINI can express computation, artifacts, workflows (cyclers), agents, provenance, and — by construction — the language needed to implement PANINI itself.

## Status

This repository is the Stage-0 external bootstrap required by the constitution:

| Stage | What | Where |
| --- | --- | --- |
| 0 | JS lexer, parser, AST, typecheck, IR, interpreter | `compiler/`, `runtime/` |
| 1 | Lexer / compiler driver written in PANINI | `compiler/lexer.pni`, `compiler/compiler.pni` |
| 2–6 | Typechecker, IR, optimizer, self-compile | specified; not yet native |

The Stage-0 runtime can already execute PANINI functions, control flow, data, file/artifact blocks, and the Stage-1 lexer expressed in PANINI.

## Quick start

Requires Node.js 18+.

```bash
node src/cli.js run examples/hello.pni
node src/cli.js run examples/factorial.pni
node tests/run.mjs
node scripts/bootstrap.mjs
node scripts/selfhost.mjs
```

CLI:

```
node src/cli.js lex <file.pni>
node src/cli.js parse <file.pni>
node src/cli.js typecheck <file.pni>
node src/cli.js compile <file.pni> --target json
node src/cli.js run <file.pni>
node src/cli.js repl
```

## Language sketch

```
FUNCTION factorial(n:Int) -> Int
    IF n <= 1
        RETURN 1
    ELSE
        RETURN n * factorial(n - 1)
    END
END

FUNCTION main() -> Int
    PRINT factorial(6)
    RETURN 0
END
```

Blocks close with `END`. Multiple paradigms are representable; this bootstrap executes the imperative/functional core and registers declarative forms (artifacts, cyclers, constitution) as data.

## Layout

```
spec/          constitutional language spec
compiler/      JS + PANINI compiler pipeline
runtime/       interpreter, artifacts, provenance, cyclers
stdlib/        standard library sources
examples/      runnable programs
tests/         bootstrap tests
tools/         developer tools
scripts/       bootstrap / self-host evidence
docker/        container wrapper
docs/          implementation notes
```

## Invariants honored by this bootstrap

- Artifacts and FILE blocks are first-class and carry MIME + provenance
- Epistemic status is explicit in the provenance module
- Model providers are adapters (`ASK` is a stub, not constitutive)
- GENIE / FAKIR / CHARBAGH are cycler libraries, not the language
- Simulation and experiment are distinct statuses
- Untagged claims cannot be canonicalized

## License

MIT
