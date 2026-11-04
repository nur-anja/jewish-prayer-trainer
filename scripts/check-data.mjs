// Check the JSON data in processed/json/ against the schemas in data/schema/ and for problems a schema can't catch.
//
// Usage:
//   node scripts/check-data.mjs                # roots.json and every text in processed/json/
//
// Checks:
//   - no object has the same key twice (JSON parsers silently keep only the last one)
//   - roots.json matches roots.schema.json, every text matches text.schema.json
//   - every word's root exists in roots.json
//   - no root lists the same related word twice
//   - a line's clauses, in order, cover the whole line, with only punctuation and spaces between them
//   - a clause's words, in order, make up the whole clause, with only spaces between them

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA_DIR = join(ROOT, "data", "schema");
const JSON_DIR = join(ROOT, "processed", "json");
const ROOTS_FILE = "roots.json";

const errors = [];
const report = (file, message) => errors.push(`${file}: ${message}`);

// Returns the path of every key that appears twice in the same object, e.g. "sections/0/lines/1/words/2/meaning".
function duplicateKeys(src) {
  const found = [];
  let i = 0;
  const skipWs = () => { while (/\s/.test(src[i])) i++; };
  const readString = () => {
    const start = i++;
    while (src[i] !== '"') i += src[i] === "\\" ? 2 : 1;
    return JSON.parse(src.slice(start, ++i));
  };
  const readValue = (path) => {
    skipWs();
    if (src[i] === "{") {
      const keys = new Set();
      i++;
      for (skipWs(); src[i] !== "}"; skipWs()) {
        if (src[i] === ",") { i++; skipWs(); }
        const key = readString();
        if (keys.has(key)) found.push([...path, key].join("/"));
        keys.add(key);
        skipWs();
        i++; // ':'
        readValue([...path, key]);
      }
      i++;
    } else if (src[i] === "[") {
      i++;
      for (let n = 0; (skipWs(), src[i] !== "]"); n++) {
        if (src[i] === ",") i++;
        readValue([...path, n]);
      }
      i++;
    } else if (src[i] === '"') {
      readString();
    } else {
      while (i < src.length && !/[\s,\]}]/.test(src[i])) i++;
    }
  };
  readValue([]);
  return found;
}

function load(file) {
  const src = readFileSync(join(JSON_DIR, file), "utf8");
  let data;
  try {
    data = JSON.parse(src);
  } catch (e) {
    report(file, `invalid JSON: ${e.message}`);
    return null;
  }
  for (const path of duplicateKeys(src)) report(file, `duplicate key "${path}"`);
  return data;
}

const ajv = new Ajv({ allErrors: true });
for (const name of ["text", "roots"]) {
  ajv.addSchema(JSON.parse(readFileSync(join(SCHEMA_DIR, `${name}.schema.json`), "utf8")));
}
function validate(file, schema, data) {
  const check = ajv.getSchema(schema);
  if (check(data)) return;
  for (const e of check.errors) report(file, `${e.instancePath || "/"} ${e.message} ${JSON.stringify(e.params)}`);
}

const roots = load(ROOTS_FILE) ?? {};
validate(ROOTS_FILE, "roots.schema.json", roots);
for (const [root, { related = [] }] of Object.entries(roots)) {
  const seen = new Set();
  for (const { hebrew } of related) {
    if (seen.has(hebrew)) report(ROOTS_FILE, `${root} lists related word ${hebrew} twice`);
    seen.add(hebrew);
  }
}

// Text left over after taking `pieces` out of `whole` in order, or null if a piece isn't found.
function leftover(whole, pieces) {
  let rest = "";
  let cursor = 0;
  for (const piece of pieces) {
    const at = whole.indexOf(piece, cursor);
    if (at < 0) return null;
    rest += whole.slice(cursor, at);
    cursor = at + piece.length;
  }
  return rest + whole.slice(cursor);
}

// Reports a line whose clauses don't cover it, and a clause whose words don't make it up.
function checkClauses(file, line) {
  if (typeof line.hebrew !== "string" || !Array.isArray(line.clauses)) return;
  const clauses = line.clauses.filter((c) => typeof c.hebrew === "string");
  const between = leftover(line.hebrew, clauses.map((c) => c.hebrew));
  if (between === null) report(file, `the clauses of "${line.hebrew}" are not all in it, in order`);
  else if (/[^\s,.:;!?׃]/u.test(between)) report(file, `"${between.trim()}" of "${line.hebrew}" is in none of its clauses`);
  for (const clause of clauses) {
    if (!Array.isArray(clause.words)) continue;
    const rest = leftover(clause.hebrew, clause.words.map((w) => w.hebrew));
    if (rest === null) report(file, `the words of clause "${clause.hebrew}" are not all in it, in order`);
    else if (/\S/u.test(rest)) report(file, `"${rest.trim()}" of clause "${clause.hebrew}" is in none of its words`);
  }
}

const textFiles = readdirSync(JSON_DIR).filter((f) => f.endsWith(".json") && f !== ROOTS_FILE).sort();
for (const file of textFiles) {
  const text = load(file);
  if (!text) continue;
  validate(file, "text.schema.json", text);
  for (const section of text.sections ?? []) {
    for (const line of section.lines ?? []) {
      for (const word of (line.clauses ?? []).flatMap((c) => c.words ?? [])) {
        if (word.root && !(word.root in roots)) report(file, `root ${word.root} of ${word.hebrew} is missing from ${ROOTS_FILE}`);
      }
      checkClauses(file, line);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(`OK: ${ROOTS_FILE} and ${textFiles.length} text(s) checked.`);
