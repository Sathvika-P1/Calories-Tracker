---
id: ADR-0004
category: nfr
title: "NFR: scale \u2014 Up to ~10,000 monthly active users, ~500 concurrent, scalable\
  \ horizontally via\u2026"
status: accepted
superseded_by: null
dimension: scale
metric: monthly active users / concurrent users
threshold: Up to ~10,000 monthly active users, ~500 concurrent, scalable horizontally
  via additional ECS Fargate tasks
component_id: null
needs_dedicated_tracking: true
evidence: Human had no specific scale target ('Not sure yet / your recommendation');
  proposed as a reasonable default for an early-stage consumer health app.
contested: true
alternatives_considered:
- "Design for large scale (100k+ users) upfront \u2014 rejected as premature given\
  \ no stated demand"
- "Leave scale completely unspecified \u2014 rejected as it leaves no checkable target\
  \ to validate the deployment target against"
consequences:
- Single-region containerized deployment (ECS Fargate + RDS) is sufficient at this
  scale
- Revisit if user growth or backlog signals push past this threshold
---

## Context

Human had no specific scale target ('Not sure yet / your recommendation'); proposed as a reasonable default for an early-stage consumer health app.

## Decision

monthly active users / concurrent users: Up to ~10,000 monthly active users, ~500 concurrent, scalable horizontally via additional ECS Fargate tasks

## Alternatives considered

- Design for large scale (100k+ users) upfront — rejected as premature given no stated demand
- Leave scale completely unspecified — rejected as it leaves no checkable target to validate the deployment target against

## Consequences

- Single-region containerized deployment (ECS Fargate + RDS) is sufficient at this scale
- Revisit if user growth or backlog signals push past this threshold
