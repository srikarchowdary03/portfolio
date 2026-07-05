---
type: project
title: "AI-Powered Portfolio (this site)"
tags: [generative-ai, rag, agents, llm, full-stack]
date: 2026-07-05
links:
  github: https://github.com/srikarchowdary03/portfolio
---

## Problem

A static portfolio tells a hiring manager what a candidate claims; it can't
answer their actual questions. And for an AI engineering candidate, the
portfolio itself is a chance to demonstrate the craft: retrieval-augmented
generation that cites sources instead of hallucinating.

## Approach

This portfolio is itself an AI product with two modes: a portfolio website and
an AI Recruiter Assistant grounded in a real knowledge base.

- **Single source of truth:** one directory of markdown documents (resume,
  projects, experience, FAQ) feeds both the rendered website and the RAG
  vector index — the site and the AI can never drift apart.
- **RAG pipeline:** heading-aware chunking (~500 tokens with overlap),
  OpenAI text-embedding-3-small embeddings, embedded ChromaDB index rebuilt
  deterministically on every deploy, with a swappable embedding-provider
  boundary so the pipeline is testable without API spend.
- **Agent architecture:** an explicit LangGraph state machine — router →
  retrieve → relevance grading → generate with citations → groundedness check
  — so unanswerable questions get an honest "I don't know" instead of a
  hallucination.
- **Evaluation:** golden-dataset eval harness measuring retrieval hit-rate and
  MRR plus LLM-judged faithfulness, gating deploys.
- Architecture decision records document every trade-off, including what was
  deliberately rejected.

## Stack

Python, FastAPI, LangGraph, OpenAI (gpt-4o-mini, text-embedding-3-small),
ChromaDB, Next.js 16, TypeScript, Tailwind CSS, Docker, GitHub Actions,
deployed on Vercel + Railway.

## Results and what it demonstrates

End-to-end AI product development: RAG system design, agent orchestration,
prompt engineering, evaluation methodology, and production deployment — with
every architectural decision documented and defensible.
