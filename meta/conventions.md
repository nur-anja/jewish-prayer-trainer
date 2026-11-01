# Conventions for the grammar notes

How the notes in [grammar/](../grammar/README.md) are written, so new notes look and read the same as the existing ones.

## File and section structure

- Each file has a title, then a short intro, then sections.
- Every section (and the intro, if a table follows it) starts with one sentence stating the pattern. That sentence ends with a colon and is followed directly by its table.
- Further explanation goes after the table, not before it.
- Pitfalls (words that look like the pattern but aren't, or forms that can mean two things) go in a section called "Watch out". It is always the last section of the file.
- Link to related notes inline, with the topic name as the link text.

## Tables

Columns appear in this order, using only the ones a table needs:

| Column | Content |
|---|---|
| Prefix or Ending | The affix the table is about |
| Meaning or Who | What the affix means, or which person it marks |
| Example | The example word or phrase |
| Root | The root of the example word |
| Note | Something the highlight can't show, such as a vowel |
| Translation | The English translation, always the last column |

- **Prefix or Ending column:** written with nikkud, exactly as the highlighted part of the example, with a maqaf (־) on the side where the rest of the word attaches. A prefix looks like וְ־ and an ending like ־ים.
- **Example column:** always called "Example", even when all examples are nouns or phrases.
- **Root column:** included in sections about how a word is built from its root (verb forms, noun templates). Left out in tables about attached prefixes and endings (prefix letters, possessive endings, plural, construct), and for phrases.
- **Comparison tables:** tables that show a change use the two forms as column names, such as "Singular | Plural | Translation" or "Normal | Construct | Translation". The translation shows the change with an arrow.
- **Mnemonic tables:** "Mnemonic | Translation".
- **Step tables:** "Step | Example | Translation".

## Hebrew

- Example words and phrases have full nikkud. Roots are written without nikkud.
- In prose, Hebrew appears only as single letters or short affixes (such as ת or נוּ). Whole Hebrew words go in tables.
- Letters are written as Hebrew letters, never by their English names.
- Endings and prefixes aren't transliterated. Refer to them by the Hebrew letters or by their meaning (such as "the ending for 'our'").
- Vowel signs are called by their English names: patach, holam, kubutz, shuruk, dagesh and so on.
- Proper names keep their usual English spelling (Moses, Caleb, Eitan, Torah, Kaddish).

## Highlighting

- In each example, the affix the section is about is bold and red: `<b style="color:red">…</b>`. GitHub shows it as bold only.
- Highlight only the affix's own letters, with their own nikkud. Never highlight root letters. A vowel that sits on a root letter can't be highlighted on its own.
- Highlight only the affix the section is about, not other prefixes or endings in the same word.
- When the point of an example is something that can't be colored (a vowel, a missing letter, the word's position), explain it in a Note column.
- The same affix is highlighted the same way everywhere. Pick examples where the affix doesn't merge with a root letter.
- In step tables, each row highlights the part the next step removes.

## Translations

- Translate literally: add "the" only when the Hebrew has it.
- Give a looser meaning in parentheses if the literal one is unclear, such as "forever (to the world)".
