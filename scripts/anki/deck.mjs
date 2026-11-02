// Turns one text breakdown into the decks and notes of its Anki deck. Used by index.mjs.
//
// Deck: "Prayer Trainer::<title>". Notes, in the order Anki introduces them (text order):
//   for every line: a Word note for each word not seen before in this text, each followed by a Root note
//   for its root when the root is new in this text; then the Line note.
//
// Notes are identified (their guid) by:
//   Word  text id + spelling. A spelling that comes back with a different breakdown (meaning, parts or
//         root) gets a second note, identified by text id + spelling + meaning; its first occurrence gives
//         the context line.
//   Line  text id + section number + line number
//   Root  text id + root (a root used in two texts has a note in each, listing that text's words)
// So fixing a breakdown and re-importing updates the note; renaming a text id or moving lines makes new ones.
//
// Tags: the text id, "section::<title>" when the section has a title, and "pos::<part of speech>" for
// every part of a word.
//
// Fails on a word whose root is missing from roots.json or on a grammar value with no readable name,
// like the PDFs.

import { createHash } from "node:crypto";
import { escape, gloss, partGloss, wordRoot } from "../render/common.mjs";
import { LINE, ROOT_NOTE, WORD } from "./templates.mjs";

const hash = (s) => createHash("sha1").update(s).digest("hex");
const guid = (...identity) => hash(identity.join("\x1f")).slice(0, 20);
// A stable deck id from its name; Anki recognizes decks by id. Kept below 2^48 to stay a safe JS integer.
const deckId = (name) => parseInt(hash(name).slice(0, 12), 16);

const tag = (s) => s.replace(/\s+/g, "_");
const glosses = (items) => items.map((i) => `<div>${gloss(i)}</div>`).join("");

// The line with the word at or after `from` wrapped in <span class="target">, and the index after it.
function highlight(line, word, from) {
  const at = line.indexOf(word, from);
  if (at < 0) throw new Error(`${word} is not in its line ${line}`);
  const end = at + word.length;
  const html =
    escape(line.slice(0, at)) + `<span class="target">${escape(word)}</span>` + escape(line.slice(end));
  return { html, end };
}

export function buildDeck(text, roots, file) {
  const deck = { id: deckId(`Prayer Trainer::${text.title}`), name: `Prayer Trainer::${text.title}` };
  const notes = [];
  const words = new Map(); // spelling -> [{ signature, ... }]
  const rootNotes = new Map(); // root -> { note, words }
  let previous = `<div class="start">Start of ${escape(text.title)}</div>`;

  text.sections.forEach((section, s) => {
    const sectionTags = section.title ? [`section::${tag(section.title)}`] : [];

    section.lines.forEach((line, l) => {
      let cursor = 0;
      for (const word of line.words) {
        const { html: context, end } = highlight(line.hebrew, word.hebrew, cursor);
        cursor = end;

        const root = wordRoot(word, roots, file);
        const signature = JSON.stringify([word.meaning, word.parts, word.root]);
        const seen = words.get(word.hebrew) ?? [];
        if (seen.includes(signature)) continue;
        const id = seen.length === 0 ? guid(text.id, "word", word.hebrew) : guid(text.id, "word", word.hebrew, word.meaning);
        words.set(word.hebrew, [...seen, signature]);

        const posTags = [...new Set(word.parts.map((p) => `pos::${tag(p.pos)}`))];
        notes.push({
          guid: id,
          noteType: WORD,
          deck,
          tags: [text.id, ...sectionTags, ...posTags],
          fields: [
            escape(word.hebrew),
            escape(word.meaning),
            word.parts.map((p) => `<div>${partGloss(p)}</div>`).join(""),
            root ? escape(word.root) : "",
            root ? escape(root.meaning) : "",
            root ? glosses(root.related) : "",
            context,
            escape(line.translation),
            escape(text.title),
          ],
        });

        if (!root) continue;
        if (!rootNotes.has(word.root)) {
          const note = { guid: guid(text.id, "root", word.root), noteType: ROOT_NOTE, deck, tags: [text.id] };
          rootNotes.set(word.root, { note, root, words: [] });
          notes.push(note);
        }
        const entry = rootNotes.get(word.root);
        if (!entry.words.some((w) => w.hebrew === word.hebrew)) entry.words.push(word);
      }

      notes.push({
        guid: guid(text.id, "line", s, l),
        noteType: LINE,
        deck,
        tags: [text.id, ...sectionTags],
        fields: [
          escape(line.hebrew),
          escape(line.translation),
          previous,
          section.title && section.title !== text.title ? escape(section.title) : "", // no "Shema · Shema"
          escape(text.title),
        ],
      });
      previous = `<div class="he">${escape(line.hebrew)}</div>`;
    });
  });

  // Root notes list every word of the text with that root, so their fields are filled in at the end.
  for (const [rootName, { note, root, words: rootWords }] of rootNotes) {
    note.fields = [
      escape(rootName),
      escape(root.meaning),
      glosses(root.related),
      glosses(rootWords),
      escape(text.title),
    ];
  }

  return { decks: [deck], notes };
}
