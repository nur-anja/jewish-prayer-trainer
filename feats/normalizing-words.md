# Normalizing words

Status: idea, not started.

## Goal

Store each word's breakdown once, in a shared file, and have texts refer to it instead of repeating it, the way words already refer to roots in roots.json. Words that recur across prayers would then be broken down once and stay consistent.

## Background

Some of a word's breakdown depends on its context, so the same spelling can need different breakdowns in different texts:

- Meaning: the word's and each part's meaning is "in this context", e.g. a construct chain reads "the … of" or "a … of" depending on its last noun.
- Part of speech: chosen by how the word works in the verse, e.g. a word that is usually an adverb can be a noun with a suffix.
- Form: present vs participle is chosen by function (see the `form` description in text.schema.json).
- Vav-consecutive: the same past-tense verb with וְ can mean past or future.

Normalizing everything could make these wrong. A shared entry would need to hold only what doesn't depend on context, or allow several analyses per spelling with the text choosing one.

## Steps

1. Once there are more texts, measure how many words actually repeat and how many of those keep the same breakdown everywhere.
2. Decide whether it's worth it, and if so, what goes into the shared file and what stays in the text.
