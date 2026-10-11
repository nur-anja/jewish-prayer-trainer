// Render the text breakdowns in processed/json/ to PDFs in processed/pdf/ using headless Google Chrome.
//
// Usage:
//   node scripts/json-to-pdf.mjs                   # every text in processed/json/
//   node scripts/json-to-pdf.mjs file1.json ...    # specific files
//
// Page layout:
//   1. Title.
//   2. Full text: every line, Hebrew on the left and translation on the right, one block per section.
//   3. Breakdown, starting on a new page. For every section, its title (if it has one), then for every line:
//        - header: the Hebrew line (bold) next to its translation (italic)
//        - table:  Hebrew | Meaning | Word Breakdown | Root | Root Meaning | Other Root Words
//
// Table cells:
//   Hebrew            **word**
//   Meaning           meaning in context; the word's notes, if any, below it in small italics
//   Word Breakdown    one "**part** - meaning *(label)*" per part, separated by line breaks;
//                     the label follows GRAMMAR LABELS below and is left out when it is empty
//   Root              **ר-ו-ט**, empty for words without a root
//   Root Meaning      meaning from roots.json
//   Other Root Words  "**word** - meaning" per related word from roots.json, separated by line breaks
//
// Not rendered: id, kind.
//
// Fails, without writing that text's PDF, on a word whose root is missing from roots.json or on a grammar
// value with no readable name below (e.g. one newly added to the schema).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_DIR = join(ROOT, "processed", "json");
const PDF_DIR = join(ROOT, "processed", "pdf");
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

const CSS = `
@page { size: A4 landscape; margin: 12mm; }
body {
  font-family: "Noto Serif Hebrew", "Times New Roman", serif;
  font-size: 11pt;
  color: #111;
  background: #fff;
}
h1 { font-size: 20pt; text-align: center; margin: 0 0 8mm; }
h2 { font-size: 15pt; margin: 8mm 0 2mm; }
/* Line header: Hebrew on the left, translation on the right, meeting in the middle. */
div.verse-row {
  display: flex;
  align-items: baseline;
  gap: 8mm;
  margin: 8mm 0 3mm;
  break-after: avoid;
}
div.verse-row .verse {
  flex: 1;
  direction: rtl;
  text-align: right;
  font-size: 18pt;
  margin: 0;
}
div.verse-row .translation {
  flex: 1;
  font-size: 12pt;
  color: #444;
  margin: 0;
}
/* Whole text up front: Hebrew left, translation right, then the breakdown starts on a new page. */
section.full-text { break-after: page; }
.full-text .stanza {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 8mm;
  row-gap: 0.5mm;
  align-items: baseline;
  margin-bottom: 4mm;
  break-inside: avoid;
}
.full-text .he { direction: rtl; text-align: right; font-size: 15pt; }
.full-text .en { font-size: 12pt; font-style: italic; color: #444; }
table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
th, td { border: 1px solid #bbb; padding: 4px 6px; vertical-align: top; }
th { background: #f0ece4; font-size: 10pt; text-align: left; }
tr { break-inside: avoid; }
.note { display: block; font-size: 9pt; font-style: italic; color: #666; margin-top: 2px; }
/* Hebrew word and root columns read right to left, in a larger size. */
td:nth-child(1), td:nth-child(4) { direction: rtl; text-align: right; font-size: 15pt; white-space: nowrap; }
/* Enlarge the Hebrew parts of the mixed Hebrew/English cells. */
td:nth-child(3) strong, td:nth-child(6) strong { font-size: 13pt; }
td:nth-child(1) { width: 11%; }
td:nth-child(2) { width: 14%; }
td:nth-child(3) { width: 31%; }
td:nth-child(4) { width: 9%; }
td:nth-child(5) { width: 14%; }
`;

const COLUMNS = ["Hebrew", "Meaning", "Word Breakdown", "Root", "Root Meaning", "Other Root Words"];

const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// "**hebrew** - meaning", the format of both the Word Breakdown and Other Root Words cells.
const gloss = ({ hebrew, meaning }) => `<strong>${escape(hebrew)}</strong> - ${escape(meaning)}`;

function partCell(part) {
  const label = grammarLabel(part);
  return label ? `${gloss(part)} <em>(${escape(label)})</em>` : gloss(part);
}

function wordRow(word, roots, file) {
  const root = word.root && roots[word.root];
  if (word.root && !root) throw new Error(`${file}: root ${word.root} of ${word.hebrew} is not in roots.json`);

  const cells = [
    `<strong>${escape(word.hebrew)}</strong>`,
    escape(word.meaning) + (word.notes ? `<span class="note">${escape(word.notes)}</span>` : ""),
    word.parts.map(partCell).join("<br>"),
    root ? `<strong>${escape(word.root)}</strong>` : "",
    root ? escape(root.meaning) : "",
    root ? (root.related ?? []).map(gloss).join("<br>") : "",
  ];
  return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
}

function lineBreakdown(line, roots, file) {
  const header =
    `<div class="verse-row"><p class="verse" dir="rtl"><strong>${escape(line.hebrew)}</strong></p>` +
    `<p class="translation"><em>${escape(line.translation)}</em></p></div>`;
  const head = `<tr>${COLUMNS.map((c) => `<th>${c}</th>`).join("")}</tr>`;
  const rows = line.words.map((w) => wordRow(w, roots, file)).join("");
  return `${header}<table><thead>${head}</thead><tbody>${rows}</tbody></table>`;
}

function fullText(sections) {
  const stanzas = sections.map((section) => {
    const rows = section.lines
      .map((l) => `<div class="he" dir="rtl">${escape(l.hebrew)}</div><div class="en">${escape(l.translation)}</div>`)
      .join("");
    return `<div class="stanza">${rows}</div>`;
  });
  return `<section class="full-text">${stanzas.join("")}</section>`;
}

function toHtml(text, roots, file) {
  const breakdown = text.sections
    .map(
      (section) =>
        (section.title ? `<h2>${escape(section.title)}</h2>` : "") +
        section.lines.map((line) => lineBreakdown(line, roots, file)).join(""),
    )
    .join("");

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${escape(text.title)}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Hebrew:wght@400;700&display=block">
<style>${CSS}</style></head>
<body><h1>${escape(text.title)}</h1>${fullText(text.sections)}${breakdown}</body></html>`;
}

// ---------------------------------------------------------------------------------------------

function convert(jsonFile, roots, workDir) {
  const name = basename(jsonFile, ".json");
  const htmlFile = join(workDir, `${name}.html`);
  const pdfFile = join(PDF_DIR, `${name}.pdf`);
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
mkdirSync(PDF_DIR, { recursive: true });
const workDir = mkdtempSync(join(tmpdir(), "json-to-pdf-"));
try {
  for (const file of files) convert(file, roots, workDir);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
