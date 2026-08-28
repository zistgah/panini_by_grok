# PANINI architecture — POSIX → OCI → standard environments

Copyright (C) 1993-2026 Abhishek Choudhary  
GPL-3.0-or-later  
tree-rev: 2026.08.28

## Two independent invariants

1. T_FRONTEND_PANINI — every language frontend is a PANINI module (GCC/LLVM shape).
2. T_POSIX_OCI_ENVIRONMENTS — official compilers live in POSIX/OCI environments.

Neither conjunct implies the other.

## The mistake to stop making

Re-implementing C, Python, Fortran, Julia *as parsers inside PANINI*
does not yield language-standard implementations.

Standard C is gcc/clang + libc.  
Standard Python is CPython.  
Those live in a **POSIX user space** (and today, usually an **OCI container**).

PANINI’s job is to *govern* that stack with linguistic equity,
not to replace libc.

## Target stack

```
Human  (any script / ILM projection / blocks / .pni)
                │
                ▼
        PANINI IR + axes + provenance
                │
     ┌──────────┼──────────────┬─────────────┐
     ▼          ▼              ▼             ▼
  JS interp   POSIX         OCI runtime    Emulator
  (today)     userspace     (docker/      (later:
              personality    podman/       qemu,
              on VFS         host)         user-mode)
     │          │              │
     └──────────┴──────┬───────┘
                       ▼
            Standard environments
            gcc / CPython / gfortran / rustc / …
            running official test suites
```

## Layers we will actually build, in order

### L0 — Already here (subset)

IR VM, PANINI self-host subset, VFS, VT100, bash subset.

### L1 — POSIX personality (this revision)

A process table, file descriptors, and a syscall surface
(`open`, `read`, `write`, `close`, `chdir`, `getcwd`, `mkdir`, `unlink`, `stat`)
implemented on the existing VFS.

This is **not** a Linux kernel. It is a user-space POSIX *personality*
so later we can attach a real libc or a container rootfs.

### L2 — OCI / Docker

PANINI emits an OCI config and, when a host engine exists
(`docker` or `podman`), runs it.

When no engine exists, the same config is still a first-class artifact
(provenance + replay).

### L3 — Standard environments

Named images:

| Env | Image intent | Official suite |
|---|---|---|
| `env-c` | gcc + libc | gcc torture / c-testsuite |
| `env-cxx` | g++ + libstdc++ | libstdc++ |
| `env-python` | CPython | `Lib/test` |
| `env-fortran` | gfortran | gfortran torture |
| `env-julia` | julia | Julia `test/` |
| `env-rust` | rustc | rustc ui |
| `env-go` | golang | `go test` |

PANINI does not become those compilers. It *launches* them.

### L4 — Emulators (not this revision)

QEMU system or user-mode, or a JS CPU, only after L1–L3 are boring.

## What “complete C” means under this architecture

Not “a bigger recursive-descent parser.”

Complete C means:

1. POSIX fds and a process can hold a C source file.
2. An `env-c` container has `gcc`.
3. `gcc` compiles that file.
4. The gcc torture suite can be scheduled as a PANINI cycler.
5. Provenance records compiler version + suite results.

Until step 4 is green, status is **NOT CONFORMING**.

## Equity mapping

```
ILM          → how the human writes
PANINI IR    → what was meant
POSIX/OCI    → where it runs
gcc/CPython  → what “the language” is, legally
```

Those four must stay separable. That is the architecture.
