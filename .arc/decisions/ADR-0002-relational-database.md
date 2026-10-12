---
id: ADR-0002
category: component
title: Relational Database
status: accepted
superseded_by: null
component_id: comp_relational_database
responsibility: Stores user accounts, logged meals, calorie/nutrition data, fitness
  goals, and historical records used for dashboards and reports; runs on PostgreSQL
  (AWS RDS).
kind: infrastructure
split_reason: Backing data store the project needs to persist user and tracking data.
evidence: 'Human''s description implies persistent tracking of meals, goals and progress
  over time; engine choice: human said ''PostgreSQL''.'
---

## Context

Human's description implies persistent tracking of meals, goals and progress over time; engine choice: human said 'PostgreSQL'.

## Decision

Stores user accounts, logged meals, calorie/nutrition data, fitness goals, and historical records used for dashboards and reports; runs on PostgreSQL (AWS RDS).

Kept separate because Backing data store the project needs to persist user and tracking data..
