---
id: ADR-0006
category: deployment_target
title: "Deployment target: AWS, containerized (ECS Fargate) for the Web App and Calorie\
  \ Tracker API, with\u2026"
status: accepted
superseded_by: null
component_id: null
decision: AWS, containerized (ECS Fargate) for the Web App and Calorie Tracker API,
  with a managed relational database (RDS); single region with prod and staging environments.
evidence: Human chose AWS and left runtime choice to recommendation; containers chosen
  for straightforward, portable deployment of a web app + API without managing servers.
contested: true
alternatives_considered:
- "Serverless (Lambda) \u2014 viable but adds cold-start and local-dev friction for\
  \ a straightforward CRUD-style API"
- "VMs (EC2) \u2014 more operational overhead (patching, scaling) with no clear benefit\
  \ for this workload"
consequences:
- Team manages container images and ECS task/service definitions
- Scaling is per-service rather than per-function
- Easier local development parity with containers
---

## Context

Human chose AWS and left runtime choice to recommendation; containers chosen for straightforward, portable deployment of a web app + API without managing servers.

## Decision

AWS, containerized (ECS Fargate) for the Web App and Calorie Tracker API, with a managed relational database (RDS); single region with prod and staging environments.

## Alternatives considered

- Serverless (Lambda) — viable but adds cold-start and local-dev friction for a straightforward CRUD-style API
- VMs (EC2) — more operational overhead (patching, scaling) with no clear benefit for this workload

## Consequences

- Team manages container images and ECS task/service definitions
- Scaling is per-service rather than per-function
- Easier local development parity with containers
