---
id: ADR-0005
category: nfr
title: "NFR: availability \u2014 99.5% monthly uptime, excluding planned maintenance\
  \ windows"
status: accepted
superseded_by: null
dimension: availability
metric: uptime
threshold: 99.5% monthly uptime, excluding planned maintenance windows
component_id: null
needs_dedicated_tracking: true
evidence: Human had no specific availability target ('Not sure yet / your recommendation');
  proposed as a reasonable default for a non-critical consumer health app (not 24/7
  life-critical).
contested: true
alternatives_considered:
- "99.99% high-availability multi-AZ/multi-region \u2014 rejected as unnecessary cost/complexity\
  \ without a stated driver"
- "Business-hours-only availability \u2014 rejected since users may log meals at any\
  \ time of day"
consequences:
- Single-region deployment with standard RDS backups is sufficient; no need for multi-region
  failover
---

## Context

Human had no specific availability target ('Not sure yet / your recommendation'); proposed as a reasonable default for a non-critical consumer health app (not 24/7 life-critical).

## Decision

uptime: 99.5% monthly uptime, excluding planned maintenance windows

## Alternatives considered

- 99.99% high-availability multi-AZ/multi-region — rejected as unnecessary cost/complexity without a stated driver
- Business-hours-only availability — rejected since users may log meals at any time of day

## Consequences

- Single-region deployment with standard RDS backups is sufficient; no need for multi-region failover
