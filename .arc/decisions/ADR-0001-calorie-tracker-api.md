---
id: ADR-0001
category: component
title: Calorie Tracker API
status: accepted
superseded_by: null
component_id: comp_calorie_tracker_api
responsibility: Handles meal logging, calorie/nutrition tracking, fitness goal management,
  and serves data for dashboards and reports.
kind: api_service
split_reason: Core backend domain logic for the application, separate from any client.
talks_to:
- component_id: comp_relational_database
  interaction: sync
  evidence: API must persist and query meal logs, goals, and reports data on behalf
    of users.
evidence: 'Human''s description: logging meals, tracking calories, setting fitness
  goals, viewing progress through dashboards and reports.'
---

## Context

Human's description: logging meals, tracking calories, setting fitness goals, viewing progress through dashboards and reports.

## Decision

Handles meal logging, calorie/nutrition tracking, fitness goal management, and serves data for dashboards and reports.

Kept separate because Core backend domain logic for the application, separate from any client..

## Talks to

- **Relational Database** (sync) — API must persist and query meal logs, goals, and reports data on behalf of users.
