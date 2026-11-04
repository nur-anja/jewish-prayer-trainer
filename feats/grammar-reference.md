# Grammar reference

Status: idea, partly started. The Anki word cards link each part to the note in [grammar/](../grammar/README.md) for its form (see [anki-deck](anki-deck.md)); the texts and PDFs don't link yet.

## Goal

A grammar reference with general explanations of recurring Hebrew grammar (e.g. merged prefixes like לַ = לְ + הַ, hollow roots, the ־ָיו suffix on plural nouns), linked from the texts. A word's breakdown would point to the relevant concept instead of explaining it inline, so each concept is explained once and the tables stay short.

## Background

Words and parts have no free-text notes field: it was dropped from the schema. Before that, a pass that added inline notes for regular grammar was too many notes and was reverted:

- d067d8f: Menucha V'simcha: add grammar and allusion notes (49 notes; the list of concepts it found is a useful starting point)
- 6642bc6: the revert

## Steps

1. Ask Claude to do a pass over the texts to find the grammar concepts that come up, and agree on the list.
2. To be decided after step 1: where the reference lives, how words link to concepts in the JSON, and how the PDF shows them.

## Pattern field

Done for nouns: a noun part has a `pattern` (mem-prefix, tav-prefix or vav-tav-ending) when it is built with one of the templates in [nouns](../grammar/nouns.md), and the Anki cards link it to that template's section. The schema says how to choose, and the three texts were filled in by hand. Only nouns have it for now; verb patterns (such as binyan templates) could be added the same way once there is a grammar note for them.

Patterns are limited to what a beginner can see in the letters (the rule is in [conventions](../meta/conventions.md#what-gets-a-section)). Two were tried and dropped because they are defined by vowels: the abstract-noun ה ending (a kubutz or shuruk before the last root letter, as in salvation and redemption), whose ה alone only says "feminine", and the dagesh-and-ו template of Kiddush.

## Next

Topics that pass the letters rule, in order of how often they come up in the three texts (Shema, Menucha V'simcha, Havdala: Hinei El):

| Order | Topic | Where | Letters to spot | In the texts |
|---|---|---|---|---|
| 1 | Infinitive with ל | new note, linked from infinitive-construct verbs | ל before the verb, or בּ or מ when it says "when" or "from" | 9 infinitives |
| 2 | Weak roots | new note, extends step 4 of the grammar README | a root letter (נ, י, ו, ה) that drops out | many words |
| 3 | Hif'il | new binyan note, linked from the binyan | ה prefix and י before the last root letter | 5 verbs, incl. Havdala's "who separates" |
| 4 | ון ending | section in nouns, new pattern value | ון at the end | 2 nouns (complete rest, joy) |

Later, when a text needs them: Hitpa'el (ת after a prefix, 1 verb now, could go in the binyan note with Hif'il), Nif'al (נ prefix; clashes with the future prefix for "we"), the ית ending (beginning, remnant), the י ending on adjectives, the object marker with endings (him, them as a separate word) and Aramaic endings (for Kaddish).

Checked and left out by the letters rule: the dual ending (same letters as the plural; a Watch out line in the plural note at most), Pi'el (only a dagesh) and the passive participle's ו (can't be told from Kiddush's ו without vowels; covered as a verb form in the participle note).

### Later: vowel patterns for nouns

Once the letter patterns are learned, expand the noun patterns (the notes and the `pattern` field) to the templates that the letters rule leaves out for now, because they are defined by vowels or a dagesh:

| Template | Examples | Where it was |
|---|---|---|
| Kubutz or shuruk before the last root letter, then a ה | salvation, redemption, might, holiness | a section of the nouns note and a pattern value on six nouns in Havdala and Menucha V'simcha; dropped, see the git history of grammar/nouns.md |
| Hiriq, dagesh in the middle root letter, ו before the last | Kiddush, learning, telling | written in commit 9b31d02 (section with a Watch out on passive participles), reverted in 57b4567 |

Decide first how they fit the rule in [conventions](../meta/conventions.md#what-gets-a-section): relax it and add them as sections of the nouns note, or keep it and put them in a separate note for learners past the basics, linked from the nouns note's Watch out.
