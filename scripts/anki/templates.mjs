// The Anki note types: their fields, card templates and styling. Used by deck.mjs.
//
//   Word   Recognize   front: the word, its phrase below it with the word in bold
//                      back:  meaning, one "**part** - meaning (label) → grammar note link(s)" per part, root and root meaning,
//                             related root words, the line's translation (same content as a Kindle word card)
//          Produce     front: the meaning, the phrase with the word blanked out
//                      back:  the word, then the same as Recognize
// The Context field holds the word's phrase (word.phrase), not the whole line; the field kept its name.
//   Line   Translate   front: the line's translation (English to Hebrew)   back: the Hebrew line
//          Next line   front: the line before it (or "Start of ...")   back: the line and its translation
//
// The ids must never change: Anki recognizes a note type by its id, so changing one makes a re-import add
// a second copy of every note. Adding, removing or reordering fields or templates also makes Anki treat
// the note type as a different one: importing the new deck then skips the notes already in Anki as
// conflicts, unless "Merge note types" is ticked in the import dialog. Renaming a field or template does
// the same (tried with Anki 26.09). Editing the HTML and CSS is safe.

export const FONT_FILE = "_NotoSerifHebrew.ttf"; // the underscore keeps Anki's "Check Media" from deleting it

const CSS = `
@font-face { font-family: "Prayer Trainer Hebrew"; src: url("${FONT_FILE}"); }
/* Every element states its direction (dir="ltr" or dir="rtl" in the templates and fields): AnkiDroid can
   lay out a whole card right to left when its first text is Hebrew, which reverses the English lines. */
.card {
  direction: ltr;
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
.verse-en { font-size: 22px; }
.context-en { font-size: 16px; color: var(--dim); }
.source, .prompt { font-size: 14px; color: var(--dim); margin-top: 14px; }
.prompt { margin: 0 0 10px; }
.start { font-style: italic; color: var(--dim); }
.meaning { font-size: 26px; font-weight: bold; }
.details { text-align: left; display: inline-block; max-width: 34em; margin-top: 10px; }
.details strong { font-size: 24px; }
.parts div, .related div { padding-left: 1em; text-indent: -1em; }
.root, .related { margin-top: 6px; }
.related { font-size: 18px; }
.heading { font-size: 14px; color: var(--dim); }
.details .heading { margin-top: 10px; }
em { color: var(--dim); }
a.grammar { font-size: 14px; color: var(--dim); white-space: nowrap; text-indent: 0; }
a.grammar::before { content: "→ "; }
`;

const DETAILS = `
<div dir="ltr" class="details">
<div class="parts">{{Parts}}</div>
{{#Root}}<div class="root">Root <strong>{{Root}}</strong> - {{RootMeaning}}</div>{{/Root}}
{{#Related}}<div class="related">{{Related}}</div>{{/Related}}
</div>`;

const SOURCE = `<div dir="ltr" class="source">{{Text}}</div>`;

export const WORD = {
  id: 1761955200001,
  name: "Prayer Trainer: Word",
  fields: ["Hebrew", "Meaning", "Parts", "Root", "RootMeaning", "Related", "Context", "LineTranslation", "Text"],
  templates: [
    {
      name: "Recognize",
      front: `<div dir="rtl" class="he big">{{Hebrew}}</div>\n<div dir="rtl" class="he context">{{Context}}</div>\n${SOURCE}`,
      back: `{{FrontSide}}\n<hr id="answer">\n<div dir="ltr" class="meaning">{{Meaning}}</div>${DETAILS}
<div dir="ltr" class="en context-en">{{LineTranslation}}</div>`,
    },
    {
      name: "Produce",
      front: `<div dir="ltr" class="meaning">{{Meaning}}</div>\n<div dir="rtl" class="he context blank">{{Context}}</div>\n${SOURCE}`,
      back: `<div dir="ltr" class="meaning">{{Meaning}}</div>\n<hr id="answer">\n<div dir="rtl" class="he big">{{Hebrew}}</div>
<div dir="rtl" class="he context">{{Context}}</div>${DETAILS}
<div dir="ltr" class="en context-en">{{LineTranslation}}</div>`,
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
      front: `<div dir="ltr" class="en verse-en">{{Translation}}</div>
<div dir="ltr" class="source">{{Text}}{{#Section}} · {{Section}}{{/Section}}</div>`,
      back: `{{FrontSide}}\n<hr id="answer">\n<div dir="rtl" class="he line">{{Hebrew}}</div>`,
    },
    {
      name: "Next line",
      front: `<div dir="ltr" class="prompt">What comes next?</div>\n<div dir="ltr" class="line context">{{Previous}}</div>
<div dir="ltr" class="source">{{Text}}{{#Section}} · {{Section}}{{/Section}}</div>`,
      back: `{{FrontSide}}\n<hr id="answer">\n<div dir="rtl" class="he line">{{Hebrew}}</div>\n<div dir="ltr" class="en">{{Translation}}</div>`,
    },
  ],
  css: CSS,
};

export const NOTE_TYPES = [WORD, LINE];
