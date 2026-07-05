---
type: project
title: "Cloud Resume Challenge"
tags: [cloud, devops, iac, aws]
date: 2024-12-01
links:
  github: https://github.com/srikarchowdary03
---

## Problem

The Cloud Resume Challenge is a well-known end-to-end cloud engineering
exercise: host a resume site on a full production-grade AWS stack, with
everything defined as code and deployed through CI/CD — no console clicking.

## Approach

- Provisioned the complete AWS stack with Terraform (Infrastructure as Code):
  S3 for static hosting, CloudFront CDN, Lambda + API Gateway for the visitor
  counter, DynamoDB for storage, Route53 for DNS, and IAM for least-privilege
  access.
- Built a GitHub Actions CI/CD pipeline so every change deploys reproducibly.

## Stack

Terraform, AWS (S3, CloudFront, Lambda, DynamoDB, API Gateway, Route53, IAM),
GitHub Actions, Python.

## Results and what it demonstrates

A fully reproducible cloud deployment — destroy and recreate the entire stack
from code. Demonstrates the DevOps/MLOps-adjacent skills (IaC, CI/CD, AWS
serverless) that AI engineering roles increasingly expect alongside modeling
ability.
