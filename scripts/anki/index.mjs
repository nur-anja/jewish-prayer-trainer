// Build an Anki deck for every text breakdown in processed/json/: processed/anki/<name>.apkg.
// Import the file in Anki (File > Import, or open it on a phone). Importing a rebuilt file again updates the
// cards already in Anki and keeps their reviews. The cards are described in templates.mjs, which notes
// become which cards in deck.mjs.
//
// Usage:
//   node scripts/anki/index.mjs                   # every text in processed/json/
//   node scripts/anki/index.mjs file1.json ...    # specific files
//
// Fails, without writing that text's deck, on a word whose root is missing from roots.json or on a grammar
// value with no readable name in scripts/render/common.mjs.

import { mkdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTexts, ROOT } from "../render/common.mjs";
import { writeApkg } from "./apkg.mjs";
import { buildDeck } from "./deck.mjs";
import { FONT_FILE, NOTE_TYPES } from "./templates.mjs";

const OUT_DIR = join(ROOT, "processed", "anki");
const FONT = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "NotoSerifHebrew.ttf"));

const { files, roots } = loadTexts(process.argv.slice(2));
mkdirSync(OUT_DIR, { recursive: true });
let failed = false;
for (const file of files) {
  const out = join(OUT_DIR, `${basename(file, ".json")}.apkg`);
  try {
    const text = JSON.parse(readFileSync(file, "utf8"));
    const { decks, notes } = buildDeck(text, roots, basename(file));
    await writeApkg(out, { noteTypes: NOTE_TYPES, decks, notes, media: [{ name: FONT_FILE, data: FONT }] });
    const cards = notes.reduce((n, note) => n + note.noteType.templates.length, 0);
    console.log(`✓ ${out.replace(ROOT + "/", "")} (${notes.length} notes, ${cards} cards)`);
  } catch (e) {
    console.error(`✗ ${basename(file)}: ${e.message}`);
    failed = true;
  }
}
if (failed) process.exit(1);
