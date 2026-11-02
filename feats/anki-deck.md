# Anki deck

Status: done. Built with `npm run anki`; the code is in scripts/anki/. This note keeps the reasoning; where the build differs from the first plan, the plan was updated below.

## Goal

A third output next to the A4 and Kindle PDFs: an Anki deck built from the same breakdowns in processed/json/, so the words and lines of each prayer can be learned with spaced repetition. Running one command rebuilds the deck, and importing the new deck into Anki updates the cards already there instead of adding duplicates, keeping their review history.

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

### One deck per prayer

One file per text, `processed/anki/<id>.apkg`, committed like the PDFs, holding one deck: "Prayer Trainer::<title>", e.g. Prayer Trainer::Shema. All of a prayer's cards are in that deck, in text order.

Tags on every note: the text id and, if the section has a title, `section::<title>`; word notes also get `pos::<part of speech>` for each part.

### Note types and cards

Two note types, each with fields filled from the JSON and its own templates:

1. **Word** (one per distinct word per text)
   - Fields: Hebrew, Meaning, Parts (HTML from `partGloss`), Root, RootMeaning, Related (from roots.json), Context (the line with this word highlighted), LineTranslation, Text.
   - Card "Recognize": front is the word, large, with its line below it in small type as context; back adds the meaning, the parts with their grammar labels, the root with its meaning, and the related root words — the same content as a Kindle word card.
   - Card "Produce" (English to Hebrew): front is the meaning and the context line with the word blanked out; back is the word.
2. **Line** (one per line)
   - Fields: Hebrew, Translation, PreviousLine, Section, Text.
   - Card "Translate": the line's translation, then the Hebrew line. (First built the other way round, Hebrew to English; flipped so that whole lines are practised from English. The name stayed, because renaming a card type makes Anki treat re-imported notes as conflicts.)
   - Card "Next line": front is the previous line (or the section/text title for the first line), back is this line, for learning the prayer by heart in order.

Root cards (a root, then its meaning, related words and the words in the text with it) were built at first and dropped: the root and related words are already on the back of every word card.

### Duplicates and stable ids

- A word note is identified by text id + the word's spelling without punctuation. The first occurrence in the text decides its context line. If the same spelling appears twice in one text with a different breakdown (meaning or parts), it gets a second note, identified by also adding the meaning.
- A line note is identified by text id + section index + line index.
- The note guid is a hash of that identity, so a re-import after fixing a breakdown updates the fields of the existing note and keeps its reviews. Renaming a text id or reordering lines creates new notes; that's accepted.

### Card order

New cards are numbered in text order: for each line, its new words, then the line's cards. Anki introduces them in the order they appear in the prayer.

### Font

Anki cards can't rely on the Google Fonts link used by the PDFs (offline phones). Bundle Noto Serif Hebrew (OFL license) as deck media named `_NotoSerifHebrew.ttf`; the leading underscore stops Anki's "Check media" from deleting it. The font file is downloaded once and committed under `scripts/anki/`.

## Checked

With the `anki` package from PyPI (version 26.09): both decks import with no conflicts and the font in the media folder; after studying a card, changing a meaning in the JSON, rebuilding and re-importing, all notes were updated in place, none were added, and the card kept its review. The cards were also rendered and looked at in light and night mode. Not yet tried on AnkiDroid or AnkiMobile.

## Later

- Audio of each line, if recordings exist.
