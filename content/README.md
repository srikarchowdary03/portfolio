# Knowledge Base Content

This directory is the **single source of truth** for everything the portfolio
says — both modes read from it:

1. The **Next.js site** renders these files as pages (projects, resume, bio).
2. The **RAG pipeline** chunks and embeds these files into the vector index
   that grounds every AI assistant answer.

Update a file here → the site and the AI both update. No drift.

## Structure (populated in Phase 1)

```
content/
├── profile/            bio.md, elevator-pitch.md
├── resume/             resume.md
├── projects/           one .md per project
├── experience/         one .md per role/company
├── skills/             skills.md
├── certifications/     certifications.md
└── faq/                hiring-faq.md
```

## File format

Markdown with YAML frontmatter:

```markdown
---
type: project            # resume | project | experience | skill | certification | faq | profile
title: "Project Name"
tags: [nlp, generative-ai]
date: 2025-06-01
links:
  github: https://github.com/...
---

## Problem
...

## Approach
...

## Results
...
```

The frontmatter becomes chunk **metadata** in the vector store, which enables
filtered retrieval ("show NLP projects" → `tags contains nlp`) and precise
source citations in AI answers.
