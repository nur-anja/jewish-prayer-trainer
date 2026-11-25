# Draft: literal vs natural translation

Status: on hold — not part of the breakdown skill yet.

## Question

The verse header uses a more natural translation, while the table is more literal (even if awkward in English). Should the skill say so? Keep the whole-verse translation as literal as possible while still natural English, and make the table fully literal. Can such a rule backfire?

## Answer

Worth adding — it's already what happens implicitly — but it can backfire in a few ways the rule should guard against:

1. **"Literal" read as "root meaning."** "Completely literal" may push the table toward etymological sense: עוֹלָמִים → "worlds" where it means "eternity", צוּר → "rock" where it's a divine title, רוּחַ → "wind" where it's "spirit". The table should be literal in *form* (construct "of", word order, number), but use the word's *contextual* sense. Root sense already has its own column.
2. **Verse and table drift apart.** If the verse says "endure" and the table says "stand", the learner can't map which Hebrew word became "endure". The current output hedged with "stand, endure"; that should be an explicit rule: when the verse uses a different English word, the table shows the literal sense first, then the verse's word.
3. **Hidden additions in the verse.** A natural verse often needs words not in the Hebrew ("[days]" in verse 4, "[Say]" in verse 15). Without marking, the learner can't tell what's actually in the text. Brackets were used but the skill doesn't require them.
4. **"Natural" drifting into interpretation.** Natural phrasing can slide into paraphrase or a familiar siddur translation that reads into the text. Limit: reorder and add connecting words, but don't swap images or add ideas.
5. **Which table column is literal?** "Meaning" translates the whole word including prefixes ("and endure"); "Word Breakdown" translates components ("and" + "stand"). Both should be literal, just at different granularity.

### Proposed rule

> **Translation levels:**
> * **Verse translation:** as literal as possible while still reading as natural English. You may reorder words and add small connecting words; put any word with no Hebrew counterpart in [square brackets]. Do not paraphrase, change images, or add interpretation.
> * **Meaning and Word Breakdown columns:** fully literal, even if awkward. Keep construct "of", number, and Hebrew word order within the word. Use the word's sense *in this context*, not its root or etymological meaning (that belongs in Root Meaning).
> * When the verse translation uses a different English word than the literal one, give both in Meaning, literal first: `stand, endure`.

---

## Question

Try to apply this new rule — what translations would change in Menucha V'simcha? Give both old and new translations.

## Answer

Only a handful of verse translations change, but the Meaning column changes in quite a few places, mostly where it had used the verse's natural wording instead of the literal one.

### Verse translations

| # | Hebrew | Old | New | Why |
|---|---|---|---|---|
| 5 | שְׁמֵי שָׁמַיִם אֶרֶץ וְיַמִּים | The highest heavens, earth and seas | The heavens of heavens, earth and seas | "highest" interprets; the literal phrase is natural enough |
| 7 | תַּנִּין וְאָדָם וְחַיַּת רְאֵמִים | The sea monster and man, and the wild beasts | The sea monster and man, and the beasts of the wild oxen | "wild beasts" dropped the oxen |
| 8 | כִּי בְּיָהּ יְיָ צוּר עוֹלָמִים | For in Yah, the LORD, is the Rock of the worlds | For in Yah, the LORD, [is] the Rock of ages | "is" isn't in the Hebrew; עוֹלָמִים here means eternity, and "ages" keeps the plural |
| 9 | הוּא אֲשֶׁר דִּבֶּר לְעַם סְגֻלָּתוֹ | It is He who spoke to His treasured people | He [is the One] who spoke to His treasured people | "It is" isn't in the Hebrew; additions now marked |
| 10 | שָׁמוֹר לְקַדְּשׁוֹ מִבּוֹאוֹ וְעַד צֵאתוֹ | Keep it, to sanctify it, from its coming until its departure | Keep [it] to sanctify it, from its coming until its going out | שָׁמוֹר has no object; "going out" is literal and natural |

The other 15 lines are already literal enough, or their additions are already bracketed ("[days]", "[Say]").

### Table: Meaning column (literal first, then the verse's wording)

| Line | Word | Old | New |
|---|---|---|---|
| 4 | בְּרוּאִים | were created | created, were created |
| 4 | וְעוֹמְדִים | and endure | and stand, endure |
| 6 | מָרוֹם | on high | height, on high |
| 6 | גְּבוֹהִים | lofty | high, lofty |
| 7 | תַּנִּין | the sea monster | sea monster (no article in Hebrew) |
| 7 | וְחַיַּת | and the beasts of | and the beast of (singular in Hebrew) |
| 8 | עוֹלָמִים | the worlds, eternity | ages, eternity (Word Breakdown: "worlds" → "ages") |
| 10 | צֵאתוֹ | its departure | its going out |
| 11 | קֹדֶשׁ | holiness | holiness, holy |
| 12 | בוֹ | on it | in it, on it |
| 15 | חַי | living thing | living, living thing |
| 16 | רָצָךְ | He has favored you | He favored you, has favored you |
| 17 | בְּמִשְׁנֶה | with a double portion of | with double of, with a double portion of |
| 18 | בְּרֹב | with an abundance of | with abundance of, with many |
| 19 | יִזְכּוּ | will merit | they will merit (subject is part of the verb) |
| 19 | לְרַב | to much | to much, great |
| 19 | טוּב | good | goodness, good |
| 20 | גּוֹאֵל | the Redeemer | redeemer, the Redeemer (no article in Hebrew) |
| 20 | הַבָּא | to come | the coming, to come |

### Limits found while applying it

- **Prefix senses.** בְּ was kept as "by" in בְּמִצְוַת and לְ as "in" in לְשִׁשָּׁה, which are their senses in context, rather than the basic "in" and "to". The "sense in context" clause covers this; without it the table would say "in the commandment of" and "to six", which is misleading, not just awkward.
- **Double Meaning entries.** Several rows now show two meanings, some differing only slightly ("He favored you, has favored you"). To keep the column short, the rule could say "give both only when the meaning differs, not just the wording."

### Open decision

Add the rule as proposed, or with the "only when the meaning differs" tweak?

---

## Lost in the move to the schema

The breakdown skill used to describe the Meaning column as a "**Direct** English translation of the word in context". When the rules moved into the schema, `word.meaning` in `data/schema/text.schema.json` became just "Meaning of the word in this context.", dropping the one word that asked for a literal translation. Restore it, or replace it with the wording of this rule, when the rule is adopted.

Done: `word.meaning` now says the word is "translated word for word: the context picks the sense, but no English word is added or dropped to fit the sentence", and `word.literal` is given only where the context picks a different sense for the word or one of its parts.

---

## Parts with two meanings

Status: decided and applied. An earlier pass that gave every part a single meaning was reverted (commit 02c5e16 reverts 952022e).

### Question

Some parts have two meanings in their meaning field. A part's meaning is meant to be literal, and the word's literal covers a sense the context picks. Should every part have a single meaning?

### Decision

A base word may give two senses where one English word doesn't cover the Hebrew word's meaning, even when the senses are near-synonyms: the Hebrew word doesn't map one to one onto English, and the pair gives the learner a fuller grasp of it. The part shows the word's range; the word's meaning shows the sense this context picks. The basic sense comes first, and each sense follows the part's grammatical form. Prefixes, suffixes and prepositions keep one meaning.

The word's literal is given only where the context picks a sense its parts' meanings don't list, so a sense among them needs no literal.

Both rules are in `part.meaning` and `word.literal` in `data/schema/text.schema.json`.

| Text | Hebrew | Part meaning before | Part meaning now | Word meaning |
|---|---|---|---|---|
| Chanukah Candles, Menucha V'simcha | אֲשֶׁר | who, that | who, that | who |
| Chanukah Candles | נֵר | light, candle | candle, light | light |
| Eshet Chayil | שָׁלָל | gain, spoil | spoil, gain | and gain |
| Eshet Chayil | טֶרֶף | food, prey | prey, food | food |
| Maoz Tsur | מָעוֹז | stronghold, fortress | stronghold, fortress | stronghold |
| Maoz Tsur | נָאֶה | fitting, becoming | fitting, becoming | fitting |
| Maoz Tsur | תּוֹדָה | thanks, thanksgiving offering | thanks, thanksgiving offering | thanksgiving offering |
| Menucha V'simcha | עוֹמְדִים | stand, endure | stand, endure | and endure (its literal, and stand, is dropped) |
| Menucha V'simcha | אֶרֶץ | earth, land | earth, land | earth |
| Menucha V'simcha | צְבָא | host, army of | host of, army of | host of |
| Menucha V'simcha | קִדּוּשׁ | Kiddush, sanctification | sanctification, Kiddush | and Kiddush |
| Menucha V'simcha | רַב | much, great | much, great | to much |

---

## Planned: he and she instead of it

Status: decided, not applied yet. The texts still use "it".

### Decision

A Hebrew pronoun or verb ending is masculine or feminine even when it refers to a thing. The word's meaning and literal translate it as "he" or "she" (him, her, his), by its Hebrew gender, not as "it". This follows the meaning rule: the Hebrew word dictates the English words, and "it" is English grammar for things.

### Words that would change

Verb subjects:

| Text | Hebrew | Meaning now | Literal now | Gender |
|---|---|---|---|---|
| Hamalach Hagoel | וְיִקָּרֵא | and may it be called | and it will be called | masc |
| Havdala | הָיְתָה | it was | | fem (its part says only "was") |
| Havdala | תִּהְיֶה | may it be | it will be | fem |
| Maoz Tsur | תִּכּוֹן | may it be established | it will be established | fem (its part already says "she") |

Pronoun endings:

| Text | Hebrew | Meaning now | Gender |
|---|---|---|---|
| Eshet Chayil | וַתִּקָּחֵהוּ | and she acquires it | masc |
| Menucha V'simcha | שׁוֹמְרָיו | those who keep it | masc |
| Menucha V'simcha | וְזוֹכְרָיו | and those who remember it | masc |
| Menucha V'simcha | לְקַדְּשׁוֹ | to sanctify it | masc |
| Menucha V'simcha | מִבּוֹאוֹ | from its coming | masc |
| Menucha V'simcha | צֵאתוֹ | its departure | masc |
| Menucha V'simcha | בוֹ | on it | masc |
| Menucha V'simcha | בָּהּ | in it | fem |

The parts' meanings change the same way.

### Open before applying

- Whether the rule covers pronoun endings as well as verb subjects.
- Where to word it in the schema (the word's meaning, the part's meaning, or both).
- Line and clause translations keep "it", since they read as English sentences.

---

## Words whose parts aren't words on their own

Status: decided and applied.

### Question

Some words are built from a prefix and a piece that never stands alone as a word. Should such a word be one part, or split into the prefix and the piece?

### Decision

Split off the prefixes and suffixes as usual. A base word that isn't a word on its own, even once the changes caused by its prefixes and suffixes are undone, is replaced by the whole word. The prefix the learner meets elsewhere is still split off, the whole word keeps its grammar (a demonstrative, common plural), and no part is a piece met nowhere else. Bound forms worth learning, such as pronoun endings and the construct forms they attach to, are still split off, since their base words are words on their own.

The rule is in the `parts` description in `data/schema/text.schema.json`. The note [This and that](../grammar/demonstratives.md#pronouns-only-with-the) explains the case, and Anki cards link to it from a word whose article is followed by the whole word. The breakdown report lists the words whose base word was replaced.

| Text | Hebrew | Parts before | Parts now | Meaning |
|---|---|---|---|---|
| Hanerot Halalu | הַלָּלוּ | one part, a demonstrative pronoun | the article, then the whole word as a demonstrative | these |

The article is the same one the other demonstratives take after a noun with "the", and Rendsburg, "Ancient Hebrew Morphology", 3.2 and note 5, describes the whole family (the forms meaning "that one" and their plural) as starting with it. He gives no origin for the rest of the word.

---

## Passive participles without "is" or "are"

Status: decided; matches what the texts already do.

### Question

A passive participle has no tense. Should its meaning add "is" or "are" so that it reads as present tense, instead of the bare English participle, which looks like an active past tense?

### Decision

The word's meaning is the bare English participle. It doesn't add "is" or "are". The clause translation chooses the tense, and on Anki cards the Meaning field adds "(passive)" so the bare participle isn't read as an active past tense (see [anki-deck.md](anki-deck.md)).

Why not "is" or "are":

- **The participle describes a state, not an action.** Whether "is ___" reads as a state depends on the English verb. "Is blessed" does, because English uses "blessed" as an adjective. "Are created" doesn't: English reads it as an action happening now or regularly, while the Hebrew means the things exist as created things, closer to "were created" or "have been created".
- **The "is" isn't in the word.** Hebrew leaves out the present tense of "to be", so it belongs to the sentence, not the participle. Its person and number come from the subject ("is", "are", "you are"). Adding it to the word's meaning breaks the meaning rule, which adds no English word to fit the sentence.
- **Many passive participles aren't the main verb.** A participle that describes a noun or is used as a noun would be wrong with "is" in front of it ("the blessed name", "the chosen one").

| Text | Hebrew | Meaning | With "is" or "are" | Clause translation |
|---|---|---|---|---|
| Shema | בָּרוּךְ | blessed | is blessed (fits) | Blessed is the name of His glorious kingdom forever and ever. |
| Menucha V'simcha | בְּרוּאִים | created | are created (misleading) | That in six [days] all were created and endure |
