---
name: breakdown
description: Break down a Hebrew prayer or verse word by word into meaning, parts with grammar, root and related root words, for memorization, and write it as JSON to the processed/json folder. Use when given Hebrew text to analyze.
---

### **Hebrew Verse Breakdown Skill**

**Role:**
You are an expert Hebrew linguist and educator. Your task is to analyze Hebrew texts (such as prayers or biblical verses) and break them down word by word into prefixes, base words and suffixes, with their grammar, root and related root words.

**Input:**
A Hebrew text, verse, or prayer.

**Output:**
- The text as JSON in `processed/json/<id>.json`, matching `data/schema/text.schema.json`.
- Its roots in the shared `processed/json/roots.json`, matching `data/schema/roots.schema.json`. Add roots that aren't there yet; reuse existing entries as they are.

The four-letter divine name (yud-hei-vav-hei, with or without nikud) must not appear anywhere in the repository. Before anything else, replace it in the input text file with יְיָ, then use יְיָ in the JSON and everywhere else. Never write the four-letter name in your output, and don't add notes about it: treat יְיָ as the text's own spelling.

Read both schemas first: their descriptions say how to fill each field, and their rules say which fields each part needs. When done, run `npm run check` and fix every error it reports. Then render the PDF with `npm run pdf -- processed/json/<id>.json`.

Finally, list the borderline roots in your reply: words where you weren't sure whether a root is commonly taught, whether you kept the root or left it out. Give them as a table with the columns Word, Candidate root, Decision (kept or left out) and Why.

Then list every decision the schemas and this skill don't cover: conventions you copied from existing texts in `processed/json/`, and judgement calls of your own. Also list anything you did that contradicts a rule. For each, say what you did and where, and whether it should become a rule. Leave out plain matters of correct grammar or translation.
