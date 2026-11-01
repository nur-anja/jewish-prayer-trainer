# Anki deck

Status: plan, not started.

## Goal

A third output next to the A4 and Kindle PDFs: an Anki deck built from the same breakdowns in processed/json/, so the words, lines and roots of each prayer can be learned with spaced repetition. Running one command rebuilds the deck, and importing the new deck into Anki updates the cards already there instead of adding duplicates, keeping their review history.

## Background

- The PDF layouts are rendered by scripts/render/: `common.mjs` has the grammar labels (`grammarLabel`, `partGloss`), the HTML helpers (`escape`, `gloss`, `wordRoot`) and a command-line driver `main(layouts)` that turns each text into HTML and prints it to PDF with Chrome.
- Anki cards are also HTML, so the labels and helpers can be reused as they are. Only the driver doesn't fit: it is built around Chrome and one PDF per text.
- Words repeat within and across texts (Shema: 54 words, 48 distinct), and the same spelling can have a different breakdown in a different context (see [normalizing-words](normalizing-words.md)). Roots, on the other hand, are already shared in roots.json.

## Decisions

### File format: .apkg, generated in Node

| Option | For | Against |
|---|---|---|
| .apkg (chosen) | Carries the note types, card templates and CSS (right-to-left, Hebrew font); stable note ids so re-imports update cards; subdecks and tags; card order | Needs a small writer: an SQLite database in a zip |
| Tab-separated text import | No dependencies | The user has to create the note types and styling in Anki by hand; updating depends on a guid column and matching note types |
| Python genanki | Well-tested reference | Adds Python to a Node-only project |

The writer is about 150 lines in `scripts/anki/apkg.mjs`, modeled on genanki: build the legacy collection database (schema 11, which current Anki desktop, AnkiDroid and AnkiMobile all import) with `sql.js` (SQLite compiled to WebAssembly, no native build), and zip it with `fflate`. Both become devDependencies next to `ajv`. If writing our own turns out to be fragile, fall back to `anki-apkg-export` from npm.

### One combined deck

One file, `processed/anki/prayer-trainer.apkg`, with subdecks, because roots are shared between texts:

- Prayer Trainer::Shema
- Prayer Trainer::Menucha V'simcha
- Prayer Trainer::Roots

Tags on every note: the text id, the section title (if any), and for word notes the part of speech of each part.

### Note types and cards

Three note types, each with fields filled from the JSON and its own templates:

1. **Word** (one per distinct word per text)
   - Fields: Hebrew, Meaning, Parts (HTML from `partGloss`), Root, RootMeaning, Related (from roots.json), Context (the line with this word highlighted), LineTranslation, Text.
   - Card "Recognize": front is the word, large, with its line below it in small type as context; back adds the meaning, the parts with their grammar labels, the root with its meaning, and the related root words — the same content as a Kindle word card.
   - Card "Produce" (English to Hebrew): front is the meaning and the context line with the word blanked out; back is the word. Off by default for now (see open questions).
2. **Line** (one per line)
   - Fields: Hebrew, Translation, PreviousLine, Section, Text.
   - Card "Translate": Hebrew line, then its translation.
   - Card "Next line": front is the previous line (or the section/text title for the first line), back is this line, for learning the prayer by heart in order.
3. **Root** (one per root used in any text, in the Roots subdeck)
   - Fields: Root, Meaning, Related, Words (the words from the texts that have this root, with their meanings).
   - Card: root, then its meaning, related words and the words met in the texts.

### Duplicates and stable ids

- A word note is identified by text id + the word's spelling without punctuation. The first occurrence in the text decides its context line. If the same spelling appears twice in one text with a different breakdown (meaning or parts), it gets a second note, identified by also adding the meaning.
- A line note is identified by text id + section index + line index; a root note by the root.
- The note guid is a hash of that identity, so a re-import after fixing a breakdown updates the fields of the existing note and keeps its reviews. Renaming a text id or reordering lines creates new notes; that's accepted.

### Card order

New cards are numbered in text order (word by word, with each line's cards after its words), so Anki introduces them in the order they appear in the prayer.

### Font

Anki cards can't rely on the Google Fonts link used by the PDFs (offline phones). Bundle Noto Serif Hebrew (OFL license) as deck media named `_NotoSerifHebrew.ttf`; the leading underscore stops Anki's "Check media" from deleting it. The font file is downloaded once and committed under `scripts/anki/`.

## Steps

1. **Split the driver in common.mjs.** Move listing the JSON files and loading roots.json into `loadTexts(args)`, used by both `main(layouts)` (PDFs) and the new Anki script. No change in PDF output.
2. **Write `scripts/anki/apkg.mjs`.** `writeApkg(path, { decks, noteTypes, notes, media })`: creates the collection tables (`col`, `notes`, `cards`, `revlog`, `graves`), stores the note types and decks as JSON in `col`, writes one row per note and per card, the `media` map, and zips it. Fields are joined with the 0x1f separator; the `sfld` and `csum` columns come from the first field.
3. **Write `scripts/anki/deck.mjs`.** Turns the texts and roots into notes: dedupe, build the fields with the helpers from common.mjs, the guids, tags and order. Fails the same way the PDFs do on a root missing from roots.json or a grammar value without a readable name.
4. **Write the templates and CSS** (`scripts/anki/templates.mjs`): right-to-left for Hebrew fields, the bundled font, light and night mode (Anki's `.nightMode` class), the related words with a gray bar like the Kindle cards.
5. **Add `scripts/anki/index.mjs` and `npm run anki`**, writing `processed/anki/prayer-trainer.apkg`. Usage like render: no arguments for every text, or specific JSON files. Decide whether `npm run render` also builds the deck.
6. **Check it.** A small test that reopens the .apkg with sql.js and checks the number of notes and cards per deck and that guids don't change between two builds; then import into Anki desktop and AnkiDroid, review a few cards of each type, change one meaning in the JSON, rebuild, re-import, and confirm the card updated and kept its history.
7. **Document it** in README.md and in the render script's header comment, and update the batch-process-text skill if it should rebuild the deck after processing a text.

## Open questions

- Which cards to turn on at first: word recognize only, or also English-to-Hebrew, line translation and next-line?
- One combined deck (planned) or one .apkg per text?
- Should the deck be committed to the repository like the PDFs, or only built locally?
- Later: audio of each line, if recordings exist.
