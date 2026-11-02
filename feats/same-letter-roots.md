# Roots with the same letters and different meanings

Status: idea, not started.

## Goal

Let roots.json hold two entries for one set of root letters when they carry unrelated meanings, so each word links to the sense it actually comes from, and its related words show only that sense.

## Background

roots.json is keyed by the root letters, so each spelling has exactly one entry. When the same letters carry two meanings, both share that entry, its meaning lists both senses, and its related words mix them:

| Root | Meanings | Example of the mix |
|---|---|---|
| ע-ו-ד | to testify; still, again | "forever and ever" in Shema shows "witness" and "Your testimonies" as related words |
| ל-ח-ם | bread; to fight | "bread" in Menucha V'simcha shows "war" as a related word |

The root rule in text.schema.json leaves out a doubtful root that would point to an unrelated meaning. With one entry per spelling, a root whose other sense is unrelated can only be kept by merging both senses into one entry, as was done for ע-ו-ד.

## Steps

1. List the roots in roots.json whose meaning already combines unrelated senses, and the words that use each sense.
2. Decide how a word picks a sense: for example a suffixed key such as "ע-ו-ד 2", or a separate sense field on the word next to its root.
3. Update both schemas, the check script and the renderers, then split the entries found in step 1.
