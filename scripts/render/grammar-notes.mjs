// Links from a word part to the notes in grammar/ that explain its form. Used by the Anki cards
// (scripts/anki/deck.mjs), which show them after each part's gloss.
//
// A part gets a link when the JSON says enough to know which note applies:
//
//   prefix (preposition, conjunction, article)    Prefix letters
//     a vav consecutive                            nothing (the verb after it links to its tense)
//     a preposition prefix with "the" in it        Prefix letters, "The" hiding inside in, to, like
//   pronoun suffix on a noun                       Possessive endings
//   pronoun suffix on a preposition                Possessive endings, Same endings on prepositions
//   pronoun suffix on a verb                       Object endings
//     on an infinitive                             Object endings, After an infinitive
//   noun or adjective in construct                 Construct forms
//   noun or adjective in the plural                Plural forms (as well as Construct forms if both)
//   noun with a pattern                            Nouns built from roots, the pattern's section
//   verb, past / future                            Past tense / Future tense
//   verb, present / participle / passive participle  Participle
//
// Nothing else links. Anchors follow GitHub's heading ids, so renaming a heading in grammar/ means updating
// it here.

const BASE = "https://github.com/nur-anja/jewish-prayer-trainer/blob/main/grammar/";

const NOTES = {
  prefix: ["prefix-letters.md", "Prefix letters"],
  hiddenThe: ["prefix-letters.md#the-hiding-inside-in-to-like", "Prefix letters"],
  possessive: ["possessive-endings.md", "Possessive endings"],
  onPreposition: ["possessive-endings.md#same-endings-on-prepositions", "Possessive endings"],
  object: ["object-endings.md", "Object endings"],
  onInfinitive: ["object-endings.md#after-an-infinitive", "Object endings"],
  construct: ["construct.md", "Construct forms"],
  plural: ["plural.md", "Plural forms"],
  past: ["past-tense.md", "Past tense"],
  future: ["future-tense.md", "Future tense"],
  participle: ["participle.md", "Participle"],
  "mem-prefix": ["nouns.md#מ-prefix", "Nouns built from roots"],
  "tav-prefix": ["nouns.md#ת-prefix", "Nouns built from roots"],
  "vav-tav-ending": ["nouns.md#ות-ending-for-abstract-nouns", "Nouns built from roots"],
};

const VERB_FORMS = { past: "past", future: "future", present: "participle", participle: "participle", "passive-participle": "participle" };

// The notes for parts[i], as [{ url, title }]; empty when no note applies.
export function grammarNotes(parts, i) {
  const part = parts[i];
  const before = parts[i - 1];
  const isPrefix = part.hebrew.endsWith("־") && i < parts.length - 1;
  const keys = [];

  if (isPrefix && !part.consecutive && ["preposition", "conjunction", "article"].includes(part.pos)) {
    keys.push(part.pos === "preposition" && /\bthe\b/i.test(part.meaning) ? "hiddenThe" : "prefix");
  }
  if (part.pos === "pronoun-suffix" && before?.pos === "noun") keys.push("possessive");
  if (part.pos === "pronoun-suffix" && before?.pos === "preposition") keys.push("onPreposition");
  if (part.pos === "pronoun-suffix" && before?.pos === "verb") {
    keys.push(before.form === "infinitive-construct" ? "onInfinitive" : "object");
  }
  if (part.pattern) keys.push(part.pattern);
  if (["noun", "adjective"].includes(part.pos)) {
    if (part.construct) keys.push("construct");
    if (part.number === "pl") keys.push("plural");
  }
  if (part.pos === "verb" && VERB_FORMS[part.form]) keys.push(VERB_FORMS[part.form]);

  return keys.map((k) => {
    if (!NOTES[k]) throw new Error(`No grammar note for pattern "${k}" of ${part.hebrew}`);
    return { url: encodeURI(BASE + NOTES[k][0]), title: NOTES[k][1] };
  });
}
