# Dynamic Dashboard — Executive Brief (Stakeholder Slide Style)

## Title
Dynamic Dashboard System

## One-line Summary
Backend-driven dashboards that update layout and widgets without frontend redeploys.

## Business Value
- Faster rollout of new widgets
- Role-based dashboards from a single system
- Low maintenance, high flexibility

## How It Works (Simple)
1. Backend sends structure (sections + widgets + layout).
2. Frontend renders exactly as received.
3. Changes go live by updating data.

## Capabilities
- Dynamic layout grid (x, y, width, height)
- Widget types: Card, Chart, Table, List
- Preview Mode: drag/resize before saving

## What Backend Must Provide
- Unique `dashboard_widget_id`
- Layout for each widget (x, y, w, h)
- Stable widget keys

## Status
Frontend CRUD + Preview ready. Backend API can be connected directly.

