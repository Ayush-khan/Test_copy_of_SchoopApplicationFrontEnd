# Dynamic Dashboard — Stakeholder Summary (1 Page)

## What is it?
A dynamic dashboard where **all layout and widgets are driven by the backend response**. This makes it flexible for different roles (Admin / Principal / Teacher) without separate hardcoded screens.

## Why it matters
- Faster rollout of new widgets without app redeploy.
- Role-based dashboards from a single UI system.
- Layout changes managed centrally by backend or admin tools.

## How it works (simple)
1. Backend sends a dashboard structure (sections + widgets + layout).
2. Frontend renders exactly what’s sent.
3. If structure changes, UI updates automatically.

## Example (Layout Concept)
```
Section 1: Cards (Students, Staff, Fee, etc.)
Section 2: Charts + Tables (Attendance, Events, etc.)
Section 3: Additional Widgets
```

## Key Capabilities
- **Dynamic layout** using grid (x, y, width, height).
- **Widget types:** Card, Chart, Table, List.
- **Preview Mode:** Drag and resize to adjust layout before saving.
- **No hardcoding:** New widgets appear if backend sends them.

## Benefits for Stakeholders
- **Flexible:** New dashboard views without frontend rebuild.
- **Scalable:** Multiple roles supported with one system.
- **Configurable:** Layout can be changed via data, not code.

## What’s needed from backend
- Unique `dashboard_widget_id` per widget.
- Layout fields (`x, y, w, h`) for all widgets.
- Consistent widget keys for mapping.

## Status
Frontend CRUD + Preview are ready. Backend API integration can be plugged in directly.

