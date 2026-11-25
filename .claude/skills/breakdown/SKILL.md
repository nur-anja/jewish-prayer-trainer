---
name: breakdown
description: Break down a Hebrew prayer or verse word by word into meaning, parts with grammar, root and related root words, for memorization, and write it as JSON to the processed/json folder. Use when given Hebrew text to analyze.
---

### **Hebrew Verse Breakdown Skill**

**Role:**
You are an expert Hebrew linguist and educator. Your task is to analyze Hebrew texts (such as prayers or biblical verses) and break them down word by word into prefixes, base words and suffixes, with their grammar, root and related root words.

**Input:**
A Hebrew text, verse, or prayer. If its text isn't given in `texts/`, write it there in the standard Ashkenazi wording, without optional insertions. Where Ashkenazi siddurim differ, use the wording already in the repository's other texts; otherwise the more common one.

**Output:**
- The text as JSON in `processed/json/<id>.json`, matching `data/schema/text.schema.json`.
- Its roots in the shared `processed/json/roots.json`, matching `data/schema/roots.schema.json`. Add roots that aren't there yet. Reuse existing entries, you can change them to accommodate new words (adding a new meaning or tweaking the example words list).

The four-letter divine name (yud-hei-vav-hei, with or without nikud) must not appear anywhere in the repository. Before anything else, replace it in the input text file with יְיָ, then use יְיָ in the JSON and everywhere else.

A blessing's opening formula is abbreviated as the schema's line rule says, in the input text file as well as in the JSON. Before you start, replace the full formula in the input text file with the abbreviation.

Read both schemas first, and check them again for each decision: their descriptions say how to fill each field, and their rules say which fields each part needs. Look at existing texts only for decisions where the schemas allow more than one answer. When an existing text contradicts a rule, follow the rule, fix the existing text and report the fix. When done, run `npm run check` and fix every error it reports. Then render the PDFs in every layout with `npm run render -- processed/json/<id>.json` and build the Anki deck with `npm run anki -- processed/json/<id>.json`.

Finally, list the words whose root you left out, as a table with the columns Word, Candidate root and Why.

Then list the words that got a literal meaning, as a table with the columns Word, Meaning and Literal.

Then list the cuts the clause rule made in clauses of more than 7 words, one row per cut, as a table with the columns Line, Before the cut, Translation before, After the cut, Translation after and Deciding rule. Line names the text's section and line. Before the cut and After the cut hold only the Hebrew of the two parts the cut made; Translation before and Translation after hold their translations. Deciding rule says whether the cantillation decided the cut or, elsewhere, which of the clause rule's ranking tests was the first to leave a single cut.

Then list the decisions where you chose between answers that all fit the schemas and this skill. A decision belongs on the list only if a different answer would also have matched every rule. Before listing one, look for a rule that decides it, even if the rule is stated in general terms and doesn't name the case. If you find one, leave the decision out. A convention copied from an existing text in `processed/json/`, including its breakdown of the same word or phrase, belongs on the list only if the rules allowed another answer. Leave out matters of grammar or translation. Also list anything you did that contradicts a rule. For each item, say what you did and where, and whether it should become a rule.
