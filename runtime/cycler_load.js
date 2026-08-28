/* Copyright (C) 1993-2026 Abhishek Choudhary
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Load zistgah/cycles cyclers without rewriting them.
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "../compiler/parser.js";
import { parseMarkdown, parseIniSections, stripFences } from "./markdown.js";

export function classify(src) {
  const t = src.replace(/^\uFEFF/, "").trimStart();
  if (t.startsWith("#")) return "markdown";
  if (t.startsWith("REM") || /^PROGRAM\s/m.test(t.slice(0, 400))) return "rem";
  if (/^\[[A-Z_]+\]/m.test(t.slice(0, 800)) || t.includes("[IDENTITY]")) return "ini";
  if (t.startsWith("MODULE") || t.startsWith("CONSTITUTION") || t.startsWith("/*")) return "panini";
  if (t.startsWith("@")) return "annotation";
  return "unknown";
}

function preprocess(src, dialect) {
  let s = stripFences(src);
  if (dialect === "markdown" || dialect === "ini" || dialect === "rem" || dialect === "unknown" || dialect === "annotation") {
    s = s.replace(/^\s*#.*$/gm, "");
    s = s.replace(/^\s*REM\b.*$/gim, "");
    s = s.replace(/;.*$/gm, "");
  }
  return s;
}

export function loadCycler(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const name = path.basename(filePath, ".pni");
  const dialect = classify(src);
  const record = {
    name,
    path: filePath,
    dialect,
    bytes: src.length,
    parse_ok: false,
    error: null,
    title: name,
    sections: [],
  };
  if (dialect === "markdown") {
    const md = parseMarkdown(src);
    record.title = md.title;
    record.sections = md.sections.map((s) => s.title);
  } else if (dialect === "ini") {
    const ini = parseIniSections(src);
    record.sections = ini.sections.map((s) => s.title);
    record.title = ini.sections.find((s) => s.fields?.name)?.fields.name || name;
  }
  try {
    parse(src, filePath);
    record.parse_ok = true;
    record.mode = "panini-native";
  } catch (e1) {
    record.error = String(e1.message || e1).slice(0, 160);
    try {
      parse(preprocess(src, dialect), filePath);
      record.parse_ok = true;
      record.mode = "preprocessed";
    } catch (e2) {
      record.mode = "spec-document";
      record.preprocess_error = String(e2.message || e2).slice(0, 160);
    }
  }
  return record;
}

export function loadAll(dir) {
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".pni"))
    .sort()
    .map((f) => loadCycler(path.join(dir, f)));
}
