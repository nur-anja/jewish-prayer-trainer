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
//   - every word's phrase is a run of whole words of its line that includes the word
//   - words of a line with the same phrase have the same phrase translation

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

// Reports every word of the line whose phrase isn't a run of whole words of the line that includes the word.
function checkPhrases(file, line) {
  if (typeof line.hebrew !== "string" || !Array.isArray(line.words)) return;
  let cursor = 0;
  const spans = line.words.map((w) => {
    const at = line.hebrew.indexOf(w.hebrew, cursor);
    if (at < 0) return null;
    cursor = at + w.hebrew.length;
    return [at, cursor];
  });
  if (spans.includes(null)) return; // the renderers report a word missing from its line
  line.words.forEach((word, k) => {
    if (typeof word.phrase !== "string") return;
    const runs = spans.slice(0, k + 1).flatMap(([start]) => spans.slice(k).map(([, end]) => line.hebrew.slice(start, end)));
    if (!runs.includes(word.phrase)) report(file, `phrase "${word.phrase}" of ${word.hebrew} is not a run of whole words of its line including the word`);
  });
  const translations = new Map();
  for (const { phrase, phraseTranslation } of line.words) {
    if (!translations.has(phrase)) translations.set(phrase, phraseTranslation);
    else if (translations.get(phrase) !== phraseTranslation) report(file, `phrase "${phrase}" has two translations: "${translations.get(phrase)}" and "${phraseTranslation}"`);
  }
}

const textFiles = readdirSync(JSON_DIR).filter((f) => f.endsWith(".json") && f !== ROOTS_FILE).sort();
for (const file of textFiles) {
  const text = load(file);
  if (!text) continue;
  validate(file, "text.schema.json", text);
  for (const section of text.sections ?? []) {
    for (const line of section.lines ?? []) {
      for (const word of line.words ?? []) {
        if (word.root && !(word.root in roots)) report(file, `root ${word.root} of ${word.hebrew} is missing from ${ROOTS_FILE}`);
      }
      checkPhrases(file, line);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(`OK: ${ROOTS_FILE} and ${textFiles.length} text(s) checked.`);
