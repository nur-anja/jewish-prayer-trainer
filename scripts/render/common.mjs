// Shared by the layouts that render the text breakdowns in processed/json/ to PDFs with headless Google Chrome:
// a4.mjs (A4 tables) and kindle.mjs (Kindle-sized cards). Each layout supplies its own HTML;
// this file has the grammar labels, the HTML helpers and the command-line driver used by index.mjs.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const JSON_DIR = join(ROOT, "processed", "json");
const ROOTS_FILE = join(JSON_DIR, "roots.json");
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// ---------------------------------------------------------------------------------------------
// GRAMMAR LABELS
//
// The JSON stores every grammatical fact; only these get printed after a part's meaning:
//
//   verb        (Binyan, form, whichever of person, gender, number, construct it has)
//                                                                  (Pa'al, past, 3rd masc. sg.)
//                                                                  (Pa'al, participle, masc. pl. construct)
//                                                                  (Pi'el, infinitive construct)
//   noun        (noun, gender number [construct])                  (noun, fem. sg. construct)
//   adjective   (adjective, gender number [construct])             (adjective, fem. sg.)
//   pronoun,    (gender number), only when the English meaning hides what Hebrew marks:
//   pronoun-      you/your, it/its, they/them/their, and the demonstratives this/that/those.
//   suffix        Never for I/me/we/us, he/him/his, she/her or "these" (see LABELED_PRONOUNS).
//   all others  no label: prepositions, conjunctions, articles, particles, adverbs, numerals, names.
//
// LANGUAGE AND NOTES ARE NEVER HIDDEN. The rules above only filter the grammar fields. A part's
// language (when not Hebrew) and then its notes are always appended to its label, whatever its
// part of speech:
//   (adjective, masc. sg., Aramaic)   (noun, fem. sg., <notes>)
// ---------------------------------------------------------------------------------------------

const BINYANIM = {
  paal: "Pa'al",
  nifal: "Nif'al",
  piel: "Pi'el",
  pual: "Pu'al",
  hifil: "Hif'il",
  hofal: "Hof'al",
  hitpael: "Hitpa'el",
};

const LANGUAGES = { aramaic: "Aramaic", greek: "Greek", latin: "Latin", persian: "Persian" };

const PERSONS = { 1: "1st", 2: "2nd", 3: "3rd" };
const GENDERS = { masc: "masc.", fem: "fem.", common: "common" };
const NUMBERS = { sg: "sg.", pl: "pl.", dual: "dual" };

// English pronouns whose gender and number the reader can't tell from the English alone.
const LABELED_PRONOUNS = new Set([
  "you", "your", "yours", "yourself", "yourselves",
  "it", "its", "itself",
  "they", "them", "their", "theirs", "themselves",
  "this", "that", "those",
]);

// The readable name of a field's value, or undefined if the part doesn't have the field.
// Fails on a value with no name (e.g. one newly added to the schema) rather than silently dropping it.
function readable(names, part, field) {
  const value = part[field];
  if (value === undefined) return undefined;
  if (!Object.hasOwn(names, value)) throw new Error(`No readable name for ${field} "${value}" of ${part.hebrew}`);
  return names[value];
}

// "3rd masc. pl. construct": whichever of person, gender, number and construct the part has.
function inflection(part, { person = false } = {}) {
  return [
    person && readable(PERSONS, part, "person"),
    readable(GENDERS, part, "gender"),
    readable(NUMBERS, part, "number"),
    part.construct && "construct",
  ]
    .filter(Boolean)
    .join(" ");
}

// The text inside the parentheses after a part, or "" for no label: the structured label, language, notes.
function grammarLabel(part) {
  return [structuredLabel(part), readable(LANGUAGES, part, "language"), part.notes].filter(Boolean).join(", ");
}

function structuredLabel(part) {
  switch (part.pos) {
    case "verb":
      return [readable(BINYANIM, part, "binyan"), part.form.replace("-", " "), inflection(part, { person: true })]
        .filter(Boolean)
        .join(", ");
    case "noun":
    case "adjective":
      return `${part.pos}, ${inflection(part)}`;
    case "pronoun":
    case "pronoun-suffix": {
      const words = part.meaning.toLowerCase().match(/[a-z]+/g) ?? [];
      return words.some((w) => LABELED_PRONOUNS.has(w)) ? inflection(part) : "";
    }
    default:
      return "";
  }
}

// ---------------------------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------------------------

export const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// "**hebrew** - meaning", the format of both the word breakdown and the other root words.
export const gloss = ({ hebrew, meaning }) => `<strong>${escape(hebrew)}</strong> - ${escape(meaning)}`;

// "**part** - meaning *(label)*", the label left out when it is empty.
export function partGloss(part) {
  const label = grammarLabel(part);
  return label ? `${gloss(part)} <em>(${escape(label)})</em>` : gloss(part);
}

// The word's entry in roots.json, or undefined for a word without a root. Fails on a root missing from roots.json.
export function wordRoot(word, roots, file) {
  const root = word.root && roots[word.root];
  if (word.root && !root) throw new Error(`${file}: root ${word.root} of ${word.hebrew} is not in roots.json`);
  return root;
}

// A whole HTML document with the Hebrew web font loaded.
export function htmlPage(title, css, body) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${escape(title)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Hebrew:wght@400;700&display=block">
<style>${css}</style></head>
<body>${body}</body></html>`;
}

// ---------------------------------------------------------------------------------------------
// COMMAND LINE
//
// Renders every text in processed/json/, or the files given as arguments, in every layout.
// A layout is { outDir, toHtml }: toHtml(text, roots, fileName) returns the whole HTML document of one text,
// rendered to <outDir>/<name>.pdf.
// ---------------------------------------------------------------------------------------------

export function main(layouts) {
  if (!existsSync(CHROME)) {
    console.error(`Google Chrome not found at ${CHROME}. Set CHROME_PATH to its executable.`);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const files = args.length
    ? args.map((f) => resolve(f))
    : readdirSync(JSON_DIR)
        .filter((f) => f.endsWith(".json") && f !== basename(ROOTS_FILE))
        .map((f) => join(JSON_DIR, f));

  if (files.length === 0) {
    console.log("No .json texts to convert.");
    process.exit(0);
  }

  const roots = JSON.parse(readFileSync(ROOTS_FILE, "utf8"));
  for (const { outDir } of layouts) mkdirSync(outDir, { recursive: true });
  const workDir = mkdtempSync(join(tmpdir(), "render-"));
  try {
    for (const file of files) for (const layout of layouts) convert(file, roots, workDir, layout);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

function convert(jsonFile, roots, workDir, { outDir, toHtml }) {
  const name = basename(jsonFile, ".json");
  const htmlFile = join(workDir, `${name}.html`);
  const pdfFile = join(outDir, `${name}.pdf`);
  const text = JSON.parse(readFileSync(jsonFile, "utf8"));

  writeFileSync(htmlFile, toHtml(text, roots, basename(jsonFile)));
  execFileSync(
    CHROME,
    [
      "--headless",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--virtual-time-budget=10000", // give the web font time to load
      `--print-to-pdf=${pdfFile}`,
      pathToFileURL(htmlFile).href,
    ],
    { stdio: "pipe" },
  );
  console.log(`✓ ${pdfFile.replace(ROOT + "/", "")}`);
}
