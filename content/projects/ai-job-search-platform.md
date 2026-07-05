---
type: project
title: "AI-Powered Job Search & Resume Tailoring Platform"
tags: [generative-ai, llm, full-stack, evaluation]
date: 2025-06-01
links:
  github: https://github.com/srikarchowdary03
---

## Problem

Job seekers tailor resumes to every posting by hand: reading job descriptions,
guessing at fit, and rewriting bullet points — slow, repetitive, and easy to
get wrong. LLMs can help, but naive LLM output is unreliable: hallucinated
claims, broken formatting, and no way to measure whether the tailoring
actually improved the match.

## Approach

Built a full-stack AI product (FastAPI backend, React frontend) that:

- Aggregates listings from 5+ job boards and auto-extracts job descriptions
  from URLs via LLM.
- Scores resume-to-job match on a 1–10 scale using an LLM evaluation pipeline
  that emits structured JSON metadata — making model judgments inspectable
  rather than free-text.
- Renders resumes deterministically through a Jinja2 → LaTeX → PDF pipeline,
  which eliminates an entire class of LLM-generated compile failures via
  automated guardrails: the model proposes content, the template guarantees
  valid output.
- Provides a chat-based resume refinement UX with conversation history,
  per-message snapshots, and one-click revert — human-in-the-loop iteration on
  model outputs instead of blind acceptance.

## Stack

FastAPI, React, SQLAlchemy, Anthropic Claude API, LaTeX, Jinja2, Tailwind CSS.

## Results and what it demonstrates

A working end-to-end LLM product where the interesting engineering is around
the model, not just in calling it: structured-output evaluation, deterministic
rendering guardrails against generation failures, and human-in-the-loop
revision control. This is the project that most directly demonstrates
production LLM engineering judgment — treating model output as untrusted input
to be validated, scored, and rendered safely.
