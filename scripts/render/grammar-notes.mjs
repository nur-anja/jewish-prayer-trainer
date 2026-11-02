// Links from a word part to the notes in grammar/ that explain its form. Used by the Anki cards
// (scripts/anki/deck.mjs), which show them after each part's gloss.
//
// A part gets a link when the JSON says enough to know which note applies:
//
//   prefix (preposition, conjunction, article)    Prefix letters
//     a preposition prefix with "the" in it        Prefix letters, "The" hiding inside in, to, like
//   pronoun suffix on a noun                       Possessive endings
//   pronoun suffix on a preposition                Possessive endings, Same endings on prepositions
//   noun or adjective in construct                 Construct forms
//   noun or adjective in the plural                Plural forms (as well as Construct forms if both)
//   verb, past / future                            Past tense / Future tense
//   verb, present / participle / passive participle  Participle
//
// Nothing else links, e.g. a pronoun suffix on a verb (no note covers object endings yet) or the noun
// templates in nouns.md, which the JSON doesn't record. Anchors follow GitHub's heading ids, so renaming a
// heading in grammar/ means updating it here.

const BASE = "https://github.com/nur-anja/jewish-prayer-trainer/blob/main/grammar/";

const NOTES = {
  prefix: ["prefix-letters.md", "Prefix letters"],
  hiddenThe: ["prefix-letters.md#the-hiding-inside-in-to-like", "Prefix letters"],
  possessive: ["possessive-endings.md", "Possessive endings"],
  onPreposition: ["possessive-endings.md#same-endings-on-prepositions", "Possessive endings"],
  construct: ["construct.md", "Construct forms"],
  plural: ["plural.md", "Plural forms"],
  past: ["past-tense.md", "Past tense"],
  future: ["future-tense.md", "Future tense"],
  participle: ["participle.md", "Participle"],
};

const VERB_FORMS = { past: "past", future: "future", present: "participle", participle: "participle", "passive-participle": "participle" };

// The notes for parts[i], as [{ url, title }]; empty when no note applies.
export function grammarNotes(parts, i) {
  const part = parts[i];
  const before = parts[i - 1];
  const isPrefix = part.hebrew.endsWith("־") && i < parts.length - 1;
  const keys = [];

  if (isPrefix && ["preposition", "conjunction", "article"].includes(part.pos)) {
    keys.push(part.pos === "preposition" && /\bthe\b/i.test(part.meaning) ? "hiddenThe" : "prefix");
  }
  if (part.pos === "pronoun-suffix" && before?.pos === "noun") keys.push("possessive");
  if (part.pos === "pronoun-suffix" && before?.pos === "preposition") keys.push("onPreposition");
  if (["noun", "adjective"].includes(part.pos)) {
    if (part.construct) keys.push("construct");
    if (part.number === "pl") keys.push("plural");
  }
  if (part.pos === "verb" && VERB_FORMS[part.form]) keys.push(VERB_FORMS[part.form]);

  return keys.map((k) => ({ url: BASE + NOTES[k][0], title: NOTES[k][1] }));
}
