---
type: project
title: "Mental Health Text Classification (NLP)"
tags: [nlp, deep-learning, classification, transformers]
date: 2025-03-01
---

## Problem

Classify mental-health-related text from Reddit posts into four categories —
ADHD, depression, OCD, and PTSD — a realistic healthcare NLP task with noisy,
informal, user-generated language where surface keywords overlap heavily
across classes.

## Approach

- Built and fine-tuned a DistilBERT model with Hugging Face Transformers and
  PyTorch for four-class mental-health text classification.
- Benchmarked the transformer against classical and neural baselines: Naive
  Bayes and feedforward neural networks — a proper model-selection study
  rather than defaulting to the trendiest architecture.
- Evaluated on a held-out test set with standard classification metrics.

## Stack

Python, PyTorch, DistilBERT, Hugging Face Transformers, Scikit-learn, pandas,
statistics.

## Results and what it demonstrates

**91.8% accuracy** with fine-tuned DistilBERT on the held-out test set, with
transformers outperforming traditional approaches by **15+ percentage
points**. Demonstrates the classical ML engineering loop — baseline first,
benchmark rigorously, measure on held-out data — and hands-on transformer
fine-tuning rather than API-only ML experience.
