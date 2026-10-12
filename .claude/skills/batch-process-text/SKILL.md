---
name: batch-process-text
description: Process text files from the texts folder with the breakdown skill and write the results to the processed/json folder. Use when asked to process or batch-process a prayer text file.
---

### Batch Processing Skill

This skill takes the specified text files and processes them using the breakdown skill.

**Input:**

Name of the text file from the "texts" folder.

**Workflow:**

Process each input file using the breakdown skill (.claude/skills/breakdown/SKILL.md), with the file name without extension as the `id`. If the output file already exists, overwrite it.

Then render the PDFs in every layout with `npm run render -- processed/json/<id>.json ...`.
