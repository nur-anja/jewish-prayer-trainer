// Writes an Anki deck package (.apkg): a zip holding an SQLite collection in the legacy schema 11
// ("collection.anki2"), which Anki desktop, AnkiDroid and AnkiMobile all import, plus the media files.
// Modeled on genanki (https://github.com/kerrickstaley/genanki).
//
//   writeApkg(path, { noteTypes, decks, notes, media })
//     noteTypes  [{ id, name, fields: [name], templates: [{ name, front, back }], css }]
//     decks      [{ id, name }]
//     notes      [{ guid, noteType, deck, fields: [string], tags: [string] }], in the order Anki should
//                introduce them; a note gets one card per template of its note type
//     media      [{ name, data }], files the templates refer to by name
//
// Ids of note types and decks must stay the same between builds: Anki recognizes them by id. Notes are
// recognized by guid, so re-importing a rebuilt deck updates the notes already in the collection and keeps
// their reviews. Every modification time is the build time, so Anki sees the imported notes and note types
// as newer than the ones it has.

import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { zipSync } from "fflate";
import initSqlJs from "sql.js";

const SCHEMA = `
CREATE TABLE col (id integer primary key, crt integer not null, mod integer not null, scm integer not null,
  ver integer not null, dty integer not null, usn integer not null, ls integer not null, conf text not null,
  models text not null, decks text not null, dconf text not null, tags text not null);
CREATE TABLE notes (id integer primary key, guid text not null, mid integer not null, mod integer not null,
  usn integer not null, tags text not null, flds text not null, sfld integer not null, csum integer not null,
  flags integer not null, data text not null);
CREATE TABLE cards (id integer primary key, nid integer not null, did integer not null, ord integer not null,
  mod integer not null, usn integer not null, type integer not null, queue integer not null, due integer not null,
  ivl integer not null, factor integer not null, reps integer not null, lapses integer not null,
  left integer not null, odue integer not null, odid integer not null, flags integer not null, data text not null);
CREATE TABLE revlog (id integer primary key, cid integer not null, usn integer not null, ease integer not null,
  ivl integer not null, lastIvl integer not null, factor integer not null, time integer not null,
  type integer not null);
CREATE TABLE graves (usn integer not null, oid integer not null, type integer not null);
CREATE INDEX ix_notes_usn on notes (usn);
CREATE INDEX ix_cards_usn on cards (usn);
CREATE INDEX ix_revlog_usn on revlog (usn);
CREATE INDEX ix_cards_nid on cards (nid);
CREATE INDEX ix_cards_sched on cards (did, queue, due);
CREATE INDEX ix_revlog_cid on revlog (cid);
CREATE INDEX ix_notes_csum on notes (csum);
`;

const FIELD_SEPARATOR = "\x1f";
const DEFAULT_DECK = { id: 1, name: "Default" };

// Options presets. "Default" (id 1) is Anki's own defaults, for the Default deck. The prayer decks use
// "Prayer Trainer": Anki's defaults except that new cards are shown in the order gathered, which is the
// order of their "due" numbers (text order), instead of all first cards of every note before any second
// card. The preset id is fixed, so a re-import finds the preset already there instead of adding another.
// Anki reads presets from the file only when "Include deck presets" is ticked in its import dialog. It then
// adds a preset whose id the collection doesn't have yet, keeps one it already has (the user's changes to
// it stay; changes made here don't reach it), and sets each imported deck to its preset from the file.
const PRAYER_PRESET_ID = 1700000000001;
const NEW_CARD_SORT_ORDER_GATHERED = 1;
const ankiDefaults = {
  mod: 0,
  usn: 0,
  maxTaken: 60,
  autoplay: true,
  timer: 0,
  replayq: true,
  dyn: false,
  new: { bury: true, delays: [1, 10], initialFactor: 2500, ints: [1, 4, 7], order: 1, perDay: 20, separate: true },
  lapse: { delays: [10], leechAction: 1, leechFails: 8, minInt: 1, mult: 0 },
  rev: { bury: true, ease4: 1.3, fuzz: 0.05, ivlFct: 1, maxIvl: 36500, minSpace: 1, perDay: 200 },
};
const DECK_OPTIONS = {
  1: { id: 1, name: "Default", ...ankiDefaults },
  [PRAYER_PRESET_ID]: {
    id: PRAYER_PRESET_ID,
    name: "Prayer Trainer",
    ...ankiDefaults,
    newSortOrder: NEW_CARD_SORT_ORDER_GATHERED,
  },
};

const stripHtml = (s) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .trim();

// Anki's checksum of a note's sort field: the first 8 hex digits of its SHA-1, as a number.
const checksum = (s) => parseInt(createHash("sha1").update(stripHtml(s)).digest("hex").slice(0, 8), 16);

function noteTypeJson({ id, name, fields, templates, css }, mod) {
  return {
    id,
    name,
    type: 0,
    mod,
    usn: -1,
    sortf: 0,
    did: null,
    tags: [],
    vers: [],
    css,
    latexPre: "\\documentclass[12pt]{article}\n\\begin{document}\n",
    latexPost: "\\end{document}",
    latexsvg: false,
    flds: fields.map((f, ord) => ({ name: f, ord, sticky: false, rtl: false, font: "Arial", size: 20, media: [] })),
    tmpls: templates.map((t, ord) => ({
      name: t.name,
      ord,
      qfmt: t.front,
      afmt: t.back,
      bqfmt: "",
      bafmt: "",
      did: null,
    })),
    // Which fields a card needs to exist; current Anki works it out itself, older versions read this.
    req: templates.map((_, ord) => [ord, "any", [0]]),
  };
}

function deckJson({ id, name }, mod, conf) {
  return {
    id,
    name,
    mod,
    usn: -1,
    desc: "",
    dyn: 0,
    conf,
    collapsed: false,
    extendNew: 0,
    extendRev: 50,
    newToday: [0, 0],
    revToday: [0, 0],
    lrnToday: [0, 0],
    timeToday: [0, 0],
  };
}

export async function writeApkg(path, { noteTypes, decks, notes, media }) {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(SCHEMA);

  const nowMs = Date.now();
  const now = Math.floor(nowMs / 1000);
  const models = Object.fromEntries(noteTypes.map((t) => [t.id, noteTypeJson(t, now)]));
  const allDecks = Object.fromEntries(
    [[DEFAULT_DECK, 1], ...decks.map((d) => [d, PRAYER_PRESET_ID])].map(([d, conf]) => [d.id, deckJson(d, now, conf)]),
  );
  const conf = {
    activeDecks: [1],
    curDeck: 1,
    curModel: String(noteTypes[0].id),
    newSpread: 0,
    nextPos: notes.length + 1,
    collapseTime: 1200,
    timeLim: 0,
    estTimes: true,
    dueCounts: true,
    sortType: "noteFld",
    sortBackwards: false,
    addToCur: true,
  };
  db.run("INSERT INTO col VALUES (1, ?, ?, ?, 11, 0, 0, 0, ?, ?, ?, ?, '{}')", [
    now,
    nowMs,
    nowMs,
    JSON.stringify(conf),
    JSON.stringify(models),
    JSON.stringify(allDecks),
    JSON.stringify(DECK_OPTIONS),
  ]);

  // Note and card ids only need to be unique within the file: Anki matches notes by guid.
  let nextId = nowMs;
  const insertNote = db.prepare("INSERT INTO notes VALUES (?, ?, ?, ?, -1, ?, ?, ?, ?, 0, '')");
  const insertCard = db.prepare("INSERT INTO cards VALUES (?, ?, ?, ?, ?, -1, 0, 0, ?, 0, 0, 0, 0, 0, 0, 0, 0, '')");
  const guids = new Set();
  notes.forEach((note, position) => {
    const type = note.noteType;
    if (note.fields.length !== type.fields.length)
      throw new Error(`Note ${note.guid} has ${note.fields.length} fields, ${type.name} has ${type.fields.length}`);
    if (guids.has(note.guid)) throw new Error(`Two notes have the guid ${note.guid}`);
    guids.add(note.guid);

    const noteId = nextId++;
    const tags = note.tags.length ? ` ${note.tags.join(" ")} ` : "";
    insertNote.run([
      noteId,
      note.guid,
      type.id,
      now,
      tags,
      note.fields.join(FIELD_SEPARATOR),
      stripHtml(note.fields[0]),
      checksum(note.fields[0]),
    ]);
    // New cards are shown in order of "due": the note's position, shared by its cards.
    type.templates.forEach((_, ord) => insertCard.run([nextId++, noteId, note.deck.id, ord, now, position + 1]));
  });
  insertNote.free();
  insertCard.free();

  const files = { "collection.anki2": db.export() };
  db.close();
  const mediaMap = {};
  media.forEach(({ name, data }, i) => {
    mediaMap[i] = name;
    files[String(i)] = data;
  });
  files.media = new TextEncoder().encode(JSON.stringify(mediaMap));
  writeFileSync(path, zipSync(files));
}
