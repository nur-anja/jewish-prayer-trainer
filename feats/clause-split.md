# Clause split

Status: parked. Nothing decided; the schema rules stand as they are.

## Question

Should a short pasuk be split into clauses at its main pause (the break between its two halves), the way a poem's two-half verse is? Today the schema splits a pasuk at its main pause only when the clause is long, so a short pasuk can stay one clause.

## Background

- A verse of a poem made of two halves is one line, and no clause crosses the break between the halves (schema, line and clause descriptions). Added with Maoz Tsur, whose verses have two halves.
- A pasuk follows the clause rule: a clause with its verb and everything attached to it; a long clause is split at its main pause, as the cantillation divides it; a list of short parallel parts joined by ו stays together.
- Eshet Chayil is from the Tanakh but is sung as a song of two-half verses. Its clauses already follow the halves, because each of its verses is long enough to be split at the main pause.
- Havdala has a short pasuk with two halves that is one clause today:

| Pasuk | First half | Second half | Clauses today |
|---|---|---|---|
| וּשְׁאַבְתֶּם מַיִם בְּשָׂשׂוֹן מִמַּעַיְנֵי הַיְשׁוּעָה | וּשְׁאַבְתֶּם מַיִם בְּשָׂשׂוֹן | מִמַּעַיְנֵי הַיְשׁוּעָה | 1 |

- A clause without a verb of its own is already accepted: the second half of Maoz Tsur's last verse.

## Options

| Option | For | Against |
|---|---|---|
| Keep the current rule | No changes; works for every text so far | A short pasuk with two parallel halves stays one clause, unlike a poem's two-half verse |
| Split every pasuk at its main pause, however short | One simple rule for all pesukim | Makes one-word clauses and cuts lists joined by ו, against the list rule (see below) |
| Split only pesukim of biblical poetry | Matches how Eshet Chayil and the Havdala pasuk are sung | Needs a test for "poetry" that can't be misread |
| Split a pasuk whose two halves are parallel (the second half restates or completes the first), even when short | Fits the Havdala pasuk and Eshet Chayil, leaves prose pesukim alone | "Parallel" is a judgment call, though easier to apply than "poetry" |

Pesukim that splitting at the main pause would break:

| Pasuk | Text | What would happen |
|---|---|---|
| וּכְתַבְתָּם עַל־מְזוּזֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ | Shema | The last word becomes a one-word clause |
| לַיְּהוּדִים הָיְתָה אוֹרָה וְשִׂמְחָה וְשָׂשֹׂן וִיקָר | Havdala | A list joined by ו is cut in the middle |

## If an option is chosen

1. Word the rule in the clause description of data/schema/text.schema.json.
2. Check every text against it and re-split the clauses that change.
3. Rebuild the PDFs and Anki decks. Clause notes are identified by their number in the line: a re-split line updates the notes of the clause numbers it keeps, adds notes for new ones, and leaves notes of clause numbers it no longer has in Anki, to be deleted by hand.

---

## Decided: when a clause is long

Status: decided. The rule is in the clause description of data/schema/text.schema.json.

### Rule

> A clause with more than 7 entries in its words is split at its main pauses into clauses of at most 7 words, cutting at the biggest pause first. In a pasuk, the pauses and their order are the cantillation's. Elsewhere, a pause is a cut between two parts of the clause, never inside one. A cut between a phrase attached to the verb or to the whole sentence and the rest of the clause comes first; a cut between the subject, the verb and the verb's object, only when no such cut is left. A list joined by ו is cut between two of its items. Of cuts of the same kind, the biggest is the one that leaves the two parts' word counts closest, the first part being the longer one on a tie.

It replaces "a long clause is split at its main pause, as the cantillation divides it, and a list of short parallel parts joined by ו stays together", which didn't say what "long" is or where the main pause is without cantillation.

### Why this wording

- 7 words: of 97 clauses, all but 6 had 2–7 words.
- Lists are capped too: a list of 8 or more words is as hard to hold as any other long clause.
- Biggest pause first, rather than "chunks of at most 7 words at the main pauses": with several pauses, the shorter wording doesn't say which pauses to cut at or how many chunks to make. Cutting at the biggest pause first, and only while a part is over 7 words, settles both, and no clause spans a bigger break than the one it was cut at.
- Without cantillation, phrases first, then subject, verb and object: a text that isn't a pasuk has no cantillation. A phrase attached to the verb or to the whole sentence (when, where, how, why, through whom) comes off most cleanly, leaving a sentence that still reads whole; cutting between subject, verb and object breaks the sentence itself, so it is left for when no phrase is left to cut off. Rules built around one sentence part, such as a long subject, were set aside: extra words can attach to any part.
- Balance among cuts of the same kind, as for list items: it keeps the parts readable and is a test that can't be misread.
- A relative clause isn't named, because it is already a clause of its own: it has its own verb, and the schema already splits a clause around a relative clause inside it. An article with a participle, though translated as a relative clause, is part of the noun it describes.

### Clauses re-split

| Text | Line | Clauses now | Hebrew |
|---|---|---|---|
| Hamalach Hagoel | 1 | 1 | הַמַּלְאָךְ הַגֹּאֵל אֹתִי מִכָּל־רָע |
| Hamalach Hagoel | 1 | 2 | יְבָרֵךְ אֶת־הַנְּעָרִים |
| Hanerot Halalu | 1 | 2 | עַל הַנִּסִּים וְעַל הַנִּפְלָאוֹת |
| Hanerot Halalu | 1 | 3 | וְעַל הַתְּשׁוּעוֹת וְעַל הַמִּלְחָמוֹת |
| Hanerot Halalu | 2 | 1 | וְכָל שְׁמוֹנַת יְמֵי חֲנֻכָּה |
| Hanerot Halalu | 2 | 2 | הַנֵּרוֹת הַלָּלוּ קֹדֶשׁ הֵם |
| Al Hanissim | 1 | 1 | עַל הַנִּסִּים, וְעַל הַפֻּרְקָן, וְעַל הַגְּבוּרוֹת |
| Al Hanissim | 1 | 2 | וְעַל הַתְּשׁוּעוֹת, וְעַל הַמִּלְחָמוֹת |

Hamalach Hagoel is split at the revia on מִכָּל־רָע, the main division of the verse's first part before the segol on הַנְּעָרִים; its line got a comma there, as the line rule asks for a verse of the Tanakh.

### Related call, kept as is

Hanerot Halalu also makes the phrase after a comma its own clause, though it belongs to the verb before it ("through Your holy priests"). The schema's "usually ending at a comma" supports this.
