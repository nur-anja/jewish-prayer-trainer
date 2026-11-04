// Turns one text breakdown into the decks and notes of its Anki deck. Used by index.mjs.
//
// Deck: "Prayer Trainer::<title>". Notes, in the order Anki introduces them (text order):
//   for every line: for each clause, a Word note for each of its words not seen before in this text, then
//   the clause's Clause note (only when the line has more than one clause); then the Line note.
//
// Notes are identified (their guid) by:
//   Word  text id + spelling. A spelling that comes back with a different breakdown (meaning, parts or
//         root) gets a second note, identified by text id + spelling + meaning. The first occurrence gives
//         the context: the clause the word is in, with the word highlighted, and the clause's translation.
//   Line  text id + section number + line number
//   Clause text id + section number + line number + clause number
// So fixing a breakdown and re-importing updates the note; renaming a text id or moving lines makes new ones.
//
// A part's line in the Parts field ends with links to the grammar notes for its form, e.g. Prefix letters
// after a וְ־ prefix (see grammar-notes.mjs). They are plain HTML in the field, so the note types don't change.
//
// Tags: the text id, "section::<title>" when the section has a title, and "pos::<part of speech>" for
// every part of a word.
//
// Fails on a word whose root is missing from roots.json or on a grammar value with no readable name,
// like the PDFs.

import { createHash } from "node:crypto";
import { escape, gloss, partGloss, wordRoot } from "../render/common.mjs";
import { grammarNotes } from "../render/grammar-notes.mjs";
import { CLAUSE, LINE, WORD } from "./templates.mjs";

const hash = (s) => createHash("sha1").update(s).digest("hex");
const guid = (...identity) => hash(identity.join("\x1f")).slice(0, 20);
// A stable deck id from its name; Anki recognizes decks by id. Kept below 2^48 to stay a safe JS integer.
const deckId = (name) => parseInt(hash(name).slice(0, 12), 16);

const tag = (s) => s.replace(/\s+/g, "_");
const glosses = (items) => items.map((i) => `<div>${gloss(i)}</div>`).join("");

// One line per part: its gloss, then links to the grammar notes that explain its form (grammar-notes.mjs).
const partLines = (parts) =>
  parts
    .map((p, i) => {
      const links = grammarNotes(parts, i).map((n) => ` <a class="grammar" href="${escape(n.url)}">${escape(n.title)}</a>`);
      return `<div>${partGloss(p)}${links.join("")}</div>`;
    })
    .join("");

// The word's position in its clause: the first occurrence at or after `from`.
function locate(clause, word, from) {
  const at = clause.indexOf(word, from);
  if (at < 0) throw new Error(`${word} is not in its clause ${clause}`);
  return { at, end: at + word.length };
}

// The clause with the word at { at, end } wrapped in <span class="target">.
const highlight = (clause, { at, end }) =>
  escape(clause.slice(0, at)) + `<span class="target">${escape(clause.slice(at, end))}</span>` + escape(clause.slice(end));

export function buildDeck(text, roots, file) {
  const deck = { id: deckId(`Prayer Trainer::${text.title}`), name: `Prayer Trainer::${text.title}` };
  const notes = [];
  const words = new Map(); // spelling -> [{ signature, ... }]
  const start = `<div dir="ltr" class="start">Start of ${escape(text.title)}</div>`;
  let previous = start;
  let previousClause = start; // the clause before, across lines, for the Next clause card

  text.sections.forEach((section, s) => {
    const sectionTags = section.title ? [`section::${tag(section.title)}`] : [];

    section.lines.forEach((line, l) => {
      line.clauses.forEach((clause, c) => {
        let cursor = 0;
        for (const word of clause.words) {
          const position = locate(clause.hebrew, word.hebrew, cursor);
          cursor = position.end;
          const context = highlight(clause.hebrew, position);

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
              partLines(word.parts),
              root ? escape(word.root) : "",
              root ? escape(root.meaning) : "",
              root ? glosses(root.related) : "",
              context,
              escape(clause.translation),
              escape(text.title),
            ],
          });
        }

        if (line.clauses.length > 1) {
          notes.push({
            guid: guid(text.id, "clause", s, l, c),
            noteType: CLAUSE,
            deck,
            tags: [text.id, ...sectionTags],
            fields: [
              escape(clause.hebrew),
              escape(clause.translation),
              previousClause,
              section.title && section.title !== text.title ? escape(section.title) : "",
              escape(text.title),
            ],
          });
        }
        previousClause = `<div dir="rtl" class="he">${escape(clause.hebrew)}</div>`;
      });

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
      previous = `<div dir="rtl" class="he">${escape(line.hebrew)}</div>`;
    });
  });

  return { decks: [deck], notes };
}
