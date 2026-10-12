// Kindle layout: renders a text breakdown to processed/kindle/<name>.pdf. Run through index.mjs.
//
// The page is 90 x 120 mm, the 3:4 screen of a 7" Kindle, so the Kindle shows it without shrinking.
// Same content as a4.mjs, stacked to fit the narrow page instead of laid out as a table:
//   1. Title.
//   2. Full text: every line, Hebrew with its translation below it, one block per section.
//   3. Breakdown, starting on a new page. For every section, its title (if it has one), then for every line:
//        - header: the Hebrew line (bold) with its translation (italic) below it
//        - a card per word, never split across pages:
//            **word** (right)                 meaning (left)
//            notes, in small italics
//            one "**part** - meaning *(label)*" per part; the label follows GRAMMAR LABELS in common.mjs
//            Root **ר-ו-ט** - root meaning
//            one "**word** - meaning" per related word from roots.json, grouped by a gray bar on the left
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
@page { size: 90mm 120mm; margin: 6mm 6mm 7mm; }
body {
  font-family: "Noto Serif Hebrew", "Times New Roman", serif;
  font-size: 10pt;
  line-height: 1.3;
  color: #000;
  background: #fff;
  margin: 0;
}
h1 { font-size: 20pt; text-align: center; margin: 30mm 0 0; break-after: page; }
/* Keep a section title on the same page as the start of its section. */
h2 { font-size: 14pt; text-align: center; margin: 0 0 3mm; break-before: page; break-after: avoid; }
.he { direction: rtl; text-align: right; }
/* Whole text up front, then the breakdown starts on a new page. */
section.full-text { break-after: page; }
.full-text .stanza { margin-bottom: 4mm; }
.full-text .pair { margin-bottom: 2mm; break-inside: avoid; }
.full-text .he { font-size: 14pt; }
.full-text .en { font-style: italic; margin-top: 1.5mm; }
/* Line header, kept with its first card. */
.verse {
  border-top: 1.5pt solid #000;
  border-bottom: 1.5pt solid #000;
  padding: 1.5mm 0;
  margin: 4mm 0 0;
  break-inside: avoid;
  break-after: avoid;
}
h2 + .verse { margin-top: 0; }
.verse .he { font-size: 15pt; font-weight: bold; }
.verse .en { font-style: italic; margin-top: 1.5mm; }
/* Word cards, separated by thin rules. */
.word { padding: 1.5mm 0; border-bottom: 0.5pt solid #888; break-inside: avoid; }
/* The next line's header has its own rule, so the card before it doesn't need one. */
.word:has(+ .verse) { border-bottom: none; }
.word-head { display: flex; justify-content: space-between; align-items: baseline; gap: 3mm; }
.word-head .he { font-size: 17pt; font-weight: bold; white-space: nowrap; }
.word-head .meaning { font-weight: bold; }
.note { font-size: 8.5pt; font-style: italic; }
.parts, .root, .related { margin-top: 0.8mm; }
.parts div, .related div { padding-left: 3mm; text-indent: -3mm; }
/* Related root words, grouped under the root by a bar in the color of the card dividers. */
.related { border-left: 1pt solid #888; padding-left: 2mm; }
.word strong { font-size: 12pt; }
.word-head strong { font-size: inherit; }
.related { font-size: 9pt; }
.related strong { font-size: 11pt; }
.label { color: #333; }
`;

function wordCard(word, roots, file) {
  const root = wordRoot(word, roots, file);
  const related = root?.related ?? [];
  return (
    `<div class="word">` +
    `<div class="word-head"><span class="meaning">${escape(word.meaning)}</span>` +
    `<span class="he" dir="rtl">${escape(word.hebrew)}</span></div>` +
    (word.notes ? `<div class="note">${escape(word.notes)}</div>` : "") +
    `<div class="parts">${word.parts.map((p) => `<div>${partGloss(p)}</div>`).join("")}</div>` +
    (root ? `<div class="root">Root <strong>${escape(word.root)}</strong> - ${escape(root.meaning)}</div>` : "") +
    (related.length
      ? `<div class="related">${related.map((r) => `<div>${gloss(r)}</div>`).join("")}</div>`
      : "") +
    `</div>`
  );
}

function lineBreakdown(line, roots, file) {
  const header =
    `<div class="verse"><div class="he" dir="rtl">${escape(line.hebrew)}</div>` +
    `<div class="en">${escape(line.translation)}</div></div>`;
  return header + line.words.map((w) => wordCard(w, roots, file)).join("");
}

function fullText(sections) {
  const stanzas = sections.map((section) => {
    const pairs = section.lines
      .map(
        (l) =>
          `<div class="pair"><div class="he" dir="rtl">${escape(l.hebrew)}</div>` +
          `<div class="en">${escape(l.translation)}</div></div>`,
      )
      .join("");
    return `<div class="stanza">${pairs}</div>`;
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

export default { outDir: join(ROOT, "processed", "kindle"), toHtml };
