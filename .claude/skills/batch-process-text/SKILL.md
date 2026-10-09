---
name: batch-process-text
description: Process text files from the texts folder with the breakdown skill and write the results to the processed/md folder. Use when asked to process or batch-process a prayer text file.
---

### Batch Processing Skill

This skill takes the specified text files and processes them using the breakdown skill.

**Input:** 

Name of the text file from the "texts" folder.

**Workflow:**

Process each of the input file using the breakdown skill (.claude/skills/breakdown/SKILL.md).

**Output:**
Write results as Markdown to the file with the same name and a .md extension in the "processed/md" folder. If the output file already exists - overwrite it. 


