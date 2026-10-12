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

Read both schemas first: their descriptions say how to fill each field, and their rules say which fields each part needs. When done, run `npm run check` and fix every error it reports. Then render the PDF with `npm run pdf -- processed/json/<id>.json`.
