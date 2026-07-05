---
type: project
title: "vital-stream — Spring Boot + Kafka Biometric Event Pipeline"
tags: [backend, streaming, kafka, distributed-systems]
date: 2025-09-01
links:
  github: https://github.com/srikarchowdary03
---

## Problem

Biometric monitoring produces high-frequency event streams (heart rate,
vitals) that must be ingested reliably at thousands of events per second —
without losing data, without unbounded consumer lag, and with fault tolerance
if a broker dies.

## Approach

- Built a 3-broker Apache Kafka cluster (KRaft mode, replication factor 3) so
  the pipeline survives broker failure without data loss.
- Spring Boot producer/consumer services with Spring Kafka, persisting to
  PostgreSQL 16 via Spring Data JPA.
- Entire stack reproducible with Docker Compose.
- Load-tested for sustained throughput and consumer-lag behavior.

## Stack

Java 21, Spring Boot 3, Spring Kafka, Spring Data JPA, Apache Kafka (KRaft,
RF=3), PostgreSQL 16, Docker Compose.

## Results and what it demonstrates

Sustained ingestion of **5,000 events per second** with **sub-millisecond
producer latency and zero consumer lag** under sustained load. Demonstrates
the distributed-systems and data-engineering foundation that production ML
systems sit on: real AI products need reliable data pipelines as much as they
need models.
