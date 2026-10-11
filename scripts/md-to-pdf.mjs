// Convert Markdown breakdowns in processed/md/ to PDFs in processed/pdf/ using headless Google Chrome.
//
// Usage:
//   node scripts/md-to-pdf.mjs                 # every processed/md/*.md
//   node scripts/md-to-pdf.mjs file1.md ...    # specific files

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { marked } from "marked";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MD_DIR = join(ROOT, "processed", "md");
const PDF_DIR = join(ROOT, "processed", "pdf");
const TEXTS_DIR = join(ROOT, "texts");
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const HEBREW = /[֐-׿]/;

const CSS = `
@page { size: A4 landscape; margin: 12mm; }
body {
  font-family: "Noto Serif Hebrew", "Times New Roman", serif;
  font-size: 11pt;
  color: #111;
  background: #fff;
}
h1 { font-size: 20pt; text-align: center; margin: 0 0 8mm; }
/* Verse header: Hebrew on the left, translation on the right, meeting in the middle. */
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

// Line counts of each stanza in texts/<name>.txt (stanzas are separated by blank lines), or null.
function stanzaSizes(name) {
  const file = join(TEXTS_DIR, `${name}.txt`);
  if (!existsSync(file)) return null;
  return readFileSync(file, "utf8")
    .trim()
    .split(/\n\s*\n/)
    .map((stanza) => stanza.split("\n").filter((line) => line.trim()).length);
}

function fullText(verses, sizes) {
  // Fall back to a single block if the source stanzas don't line up with the breakdown.
  const total = sizes?.reduce((a, b) => a + b, 0);
  if (total !== verses.length) sizes = [verses.length];

  let i = 0;
  const stanzas = sizes.map((size) => {
    const rows = verses
      .slice(i, (i += size))
      .map(({ verse, translation }) => `<div class="he" dir="rtl">${verse}</div><div class="en">${translation}</div>`)
      .join("");
    return `<div class="stanza">${rows}</div>`;
  });
  return `<section class="full-text">${stanzas.join("")}</section>`;
}

function toHtml(markdown, name, title) {
  const verses = [];
  let body = marked.parse(markdown);
  // A bold Hebrew line is a verse header; the italic line right after it is its translation.
  body = body.replace(
    /<p><strong>([^<]*)<\/strong>\s*(?:<em>([^<]*)<\/em>)?<\/p>/g,
    (m, verse, translation = "") => {
      if (!HEBREW.test(verse)) return m;
      verses.push({ verse, translation });
      return (
        `<div class="verse-row"><p class="verse" dir="rtl"><strong>${verse}</strong></p>` +
        `<p class="translation"><em>${translation}</em></p></div>`
      );
    },
  );

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Hebrew:wght@400;700&display=block">
<style>${CSS}</style></head>
<body><h1>${title}</h1>${fullText(verses, stanzaSizes(name))}${body}</body></html>`;
}

function titleFrom(file) {
  return basename(file, ".md")
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function convert(mdFile, workDir) {
  const name = basename(mdFile, ".md");
  const htmlFile = join(workDir, `${name}.html`);
  const pdfFile = join(PDF_DIR, `${name}.pdf`);

  writeFileSync(htmlFile, toHtml(readFileSync(mdFile, "utf8"), name, titleFrom(mdFile)));
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
  : readdirSync(MD_DIR).filter((f) => f.endsWith(".md")).map((f) => join(MD_DIR, f));

if (files.length === 0) {
  console.log("No .md files to convert.");
  process.exit(0);
}

mkdirSync(PDF_DIR, { recursive: true });
const workDir = mkdtempSync(join(tmpdir(), "md-to-pdf-"));
try {
  for (const file of files) convert(file, workDir);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
