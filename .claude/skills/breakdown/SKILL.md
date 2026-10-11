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

Read both schemas first: their field descriptions and rules say which fields each part needs. Store every grammatical fact the Hebrew marks; `scripts/json-to-pdf.mjs` decides which ones to print. When done, run `npm run check` and fix every error it reports.

**Repeated Stanzas (Refrains):**
Break down a refrain or any other repeated stanza only once, where it first appears. Skip every later repetition of it. Treat it as a repetition only if its words are identical to the first occurrence (ignoring punctuation); if any word differs, break it down as a new stanza.

**Rules the schema can't check:**
*   **Parts:** Split each word into its prefixes, base word and suffixes, each with its meaning in context. Do *not* split the ל (lamed) from an infinitive: keep **לְאַמֵּץ** - to strengthen whole as one `infinitive-construct` part.
*   **Present vs participle:** These are the same Hebrew form (*beinoni*); choose the `form` by how the word functions:
    *   `present`: the word is the verb of its clause (e.g., **מְעִידִים** - they testify).
    *   `participle`: the word functions as a noun or adjective: it takes the article הַ, is in construct state, describes a noun, or means "one who…" (e.g., **גּוֹאֵל** - redeemer, **מִתְעַנְּגִים** in **הַמִּתְעַנְּגִים** - who delight).
    *   `passive-participle`: always for passive forms (the קָטוּל pattern, Pu'al/Hof'al מְ־/מֻ־ forms), whatever their function (e.g., **בְּרוּאִים** - created).
*   **Pronouns:** Give pronouns and pronoun suffixes the person, gender and number the Hebrew marks, including pronouns referring to God.
*   **Language:** Set `language` only on the parts whose form is in that language, as the schema describes: e.g., **רַבָּה** - great, **דְּ־** - of, or the ending **־ָא** - the are Aramaic, but a shared prefix (וְ־, בְּ־, לְ־) follows the surrounding text.
*   **Notes:** Most texts need none. Use a part's `notes` only for a form that breaks the usual patterns in a way the other fields can't express, and never leave such a detail out for lack of a field. No notes for regular grammar (weak roots, merged prefixes, suffix forms), standard uses of a form (e.g. an infinitive absolute used as a command), allusions or sources.
*   **Related root words:** Give 1 or 2 common words sharing the root. Prefer, in order: (1) words commonly encountered in the siddur (prayerbook), (2) words commonly encountered in the Torah, (3) other common Hebrew words. For example, for **ע-מ-ד** prefer **עֲמִידָה** - the Amidah prayer over **עֶמְדָּה** - position; for **ב-ר-ך** prefer **בָּרוּךְ** - blessed over **בְּרֵכָה** - pool.
