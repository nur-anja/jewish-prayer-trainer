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

## Related idea: pattern field

Add a "pattern" field (for example "mem-noun" or "future, we") to the word breakdowns, so the word-formation patterns in [grammar/](../grammar/README.md) get pointed out while studying each prayer.
