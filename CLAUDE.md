# Working in this repository

## Chat formatting

- Don't write bullet lists or sentences that mix Hebrew and English: right-to-left Hebrew inside left-to-right text gets reordered, and words and punctuation display scrambled.
- Put each Hebrew word or phrase in its own table cell, with no English in that cell, and the English explanation in other columns.
- Never start a paragraph with a Hebrew word: the whole paragraph then aligns right.

## External sources

- Before starting heavy work against third-party sources (e.g. looking words up in online dictionaries like Pealim or Sefaria, or scraping websites), say what you plan to fetch and why, and wait for confirmation.

## Changing outputs

- Make the clean change to the Anki note types, PDFs and scripts (add, rename or reorder fields and templates as the change needs) instead of working around them to keep existing Anki notes compatible.
- When a change needs "Merge note types" on the next Anki import, say so in the reply.
- Rebuild the outputs only when finishing the work: before committing to main or before opening a pull request. While iterating, change only the JSON, schemas and scripts.

## Memories

- Before saving something to remember, propose the wording and ask whether it goes in this CLAUDE.md (shared through the repository) or in local memory (private to the user).

## Grammar notes

- Write and edit the notes in grammar/ by grammar/conventions.md.
- Where following a convention would make a note wrong or harder to understand, don't follow it there, and say in the reply which convention was set aside and why.

## Writing rules

- Write rules (in the schemas, skills and conventions) in clear, generic terms that can't be misread. Try to avoid examples. Add an example only when ambiguity is unavoidable.
