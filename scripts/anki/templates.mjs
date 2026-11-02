// The Anki note types: their fields, card templates and styling. Used by deck.mjs.
//
//   Word   Recognize   front: the word, its line below it with the word in bold
//                      back:  meaning, one "**part** - meaning (label)" per part, root and root meaning,
//                             related root words, the line's translation (same content as a Kindle word card)
//          Produce     front: the meaning, the line with the word blanked out, the line's translation
//                      back:  the word, then the same as Recognize
//   Line   Translate   front: the Hebrew line            back: its translation
//          Next line   front: the line before it (or "Start of ...")   back: the line and its translation
//   Root   Root        front: the root   back: its meaning, related words, and the words in this text with it
//
// The ids must never change: Anki recognizes a note type by its id, so changing one makes a re-import add
// a second copy of every note. Adding, removing or reordering fields or templates also makes Anki treat
// the note type as a different one: importing the new deck then skips the notes already in Anki as
// conflicts, unless "Merge note types" is ticked in the import dialog. Renaming a template or editing the
// HTML and CSS is safe.

export const FONT_FILE = "_NotoSerifHebrew.ttf"; // the underscore keeps Anki's "Check Media" from deleting it

const CSS = `
@font-face { font-family: "Prayer Trainer Hebrew"; src: url("${FONT_FILE}"); }
.card {
  --text: #111; --dim: #666; --rule: #999;
  font-family: "Prayer Trainer Hebrew", "Noto Serif Hebrew", "Times New Roman", serif;
  font-size: 20px;
  line-height: 1.45;
  text-align: center;
  color: var(--text);
  background: #fff;
  padding: 0 12px;
}
.card.nightMode, .night_mode .card { --text: #eee; --dim: #aaa; --rule: #777; background: #222; }
.he { direction: rtl; unicode-bidi: isolate; }
.big { font-size: 46px; font-weight: bold; margin-top: 8px; }
.line { font-size: 28px; }
.context { font-size: 24px; color: var(--dim); margin-top: 12px; }
.context .target { color: var(--text); font-weight: bold; }
.blank .target { color: transparent; border-bottom: 2px solid var(--rule); }
.en { font-style: italic; margin-top: 8px; }
.context-en { font-size: 16px; color: var(--dim); }
.source, .prompt { font-size: 14px; color: var(--dim); margin-top: 14px; }
.prompt { margin: 0 0 10px; }
.start { font-style: italic; color: var(--dim); }
.meaning { font-size: 26px; font-weight: bold; }
.details { text-align: left; display: inline-block; max-width: 34em; margin-top: 10px; }
.details strong { font-size: 24px; }
.parts div, .related div, .words div { padding-left: 1em; text-indent: -1em; }
.root, .related, .words { margin-top: 6px; }
.related, .words { font-size: 18px; }
.heading { font-size: 14px; color: var(--dim); }
.details .heading { margin-top: 10px; }
em { color: var(--dim); }
`;

const DETAILS = `
<div class="details">
<div class="parts">{{Parts}}</div>
{{#Root}}<div class="root">Root <strong>{{Root}}</strong> - {{RootMeaning}}</div>{{/Root}}
{{#Related}}<div class="related">{{Related}}</div>{{/Related}}
</div>`;

const SOURCE = `<div class="source">{{Text}}</div>`;

export const WORD = {
  id: 1761955200001,
  name: "Prayer Trainer: Word",
  fields: ["Hebrew", "Meaning", "Parts", "Root", "RootMeaning", "Related", "Context", "LineTranslation", "Text"],
  templates: [
    {
      name: "Recognize",
      front: `<div class="he big">{{Hebrew}}</div>\n<div class="he context">{{Context}}</div>\n${SOURCE}`,
      back: `{{FrontSide}}\n<hr id="answer">\n<div class="meaning">{{Meaning}}</div>${DETAILS}
<div class="en context-en">{{LineTranslation}}</div>`,
    },
    {
      name: "Produce",
      front: `<div class="meaning">{{Meaning}}</div>\n<div class="he context blank">{{Context}}</div>
<div class="en context-en">{{LineTranslation}}</div>\n${SOURCE}`,
      back: `<div class="meaning">{{Meaning}}</div>\n<hr id="answer">\n<div class="he big">{{Hebrew}}</div>
<div class="he context">{{Context}}</div>${DETAILS}`,
    },
  ],
  css: CSS,
};

export const LINE = {
  id: 1761955200002,
  name: "Prayer Trainer: Line",
  fields: ["Hebrew", "Translation", "Previous", "Section", "Text"],
  templates: [
    {
      name: "Translate",
      front: `<div class="he line">{{Hebrew}}</div>
<div class="source">{{Text}}{{#Section}} · {{Section}}{{/Section}}</div>`,
      back: `{{FrontSide}}\n<hr id="answer">\n<div class="en">{{Translation}}</div>`,
    },
    {
      name: "Next line",
      front: `<div class="prompt">What comes next?</div>\n<div class="line context">{{Previous}}</div>
<div class="source">{{Text}}{{#Section}} · {{Section}}{{/Section}}</div>`,
      back: `{{FrontSide}}\n<hr id="answer">\n<div class="he line">{{Hebrew}}</div>\n<div class="en">{{Translation}}</div>`,
    },
  ],
  css: CSS,
};

export const ROOT_NOTE = {
  id: 1761955200003,
  name: "Prayer Trainer: Root",
  fields: ["Root", "Meaning", "Related", "Words", "Text"],
  templates: [
    {
      name: "Root",
      front: `<div class="heading">Root</div>\n<div class="he big">{{Root}}</div>\n${SOURCE}`,
      back: `{{FrontSide}}\n<hr id="answer">\n<div class="meaning">{{Meaning}}</div>
<div class="details">
{{#Related}}<div class="related">{{Related}}</div>{{/Related}}
{{#Words}}<div class="heading">In {{Text}}</div><div class="words">{{Words}}</div>{{/Words}}
</div>`,
    },
  ],
  css: CSS,
};

export const NOTE_TYPES = [WORD, LINE, ROOT_NOTE];
