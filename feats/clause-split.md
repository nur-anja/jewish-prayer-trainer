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
