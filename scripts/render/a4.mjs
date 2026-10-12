// A4 layout: renders a text breakdown to processed/pdf/<name>.pdf. Run through index.mjs.
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
//                     the label follows GRAMMAR LABELS in common.mjs and is left out when it is empty
//   Root              **ר-ו-ט**, empty for words without a root
//   Root Meaning      meaning from roots.json
//   Other Root Words  "**word** - meaning" per related word from roots.json, separated by line breaks
//
// Not rendered: id, kind.
//
// Fails, without writing that text's PDF, on a word whose root is missing from roots.json or on a grammar
// value with no readable name in common.mjs (e.g. one newly added to the schema).

import { join } from "node:path";
import { escape, gloss, htmlPage, partGloss, ROOT, wordRoot } from "./common.mjs";

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
/* Keep a section title on the same page as the start of its section. */
h2 { font-size: 15pt; text-align: center; margin: 8mm 0 2mm; break-after: avoid; }
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

function wordRow(word, roots, file) {
  const root = wordRoot(word, roots, file);

  const cells = [
    `<strong>${escape(word.hebrew)}</strong>`,
    escape(word.meaning) + (word.notes ? `<span class="note">${escape(word.notes)}</span>` : ""),
    word.parts.map(partGloss).join("<br>"),
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

  return htmlPage(text.title, CSS, `<h1>${escape(text.title)}</h1>${fullText(text.sections)}${breakdown}`);
}

export default { outDir: join(ROOT, "processed", "pdf"), toHtml };
