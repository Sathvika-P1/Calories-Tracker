---
id: ADR-0003
category: component
title: Web App
status: accepted
superseded_by: null
component_id: comp_web_app
responsibility: Browser-based client where users log meals, set fitness goals, and
  view progress dashboards and reports.
kind: web_ui
split_reason: Distinct runtime (browser client) from the backend API.
talks_to:
- component_id: comp_calorie_tracker_api
  interaction: sync
  evidence: Web App calls the API to log meals, manage goals, and fetch dashboard/report
    data.
evidence: 'Human''s answer: ''Web app only''.'
---

## Context

Human's answer: 'Web app only'.

## Decision

Browser-based client where users log meals, set fitness goals, and view progress dashboards and reports.

Kept separate because Distinct runtime (browser client) from the backend API..

## Talks to

- **Calorie Tracker API** (sync) — Web App calls the API to log meals, manage goals, and fetch dashboard/report data.
