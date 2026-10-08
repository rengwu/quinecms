---
title: Readable reference summaries
updated: 2026-10-08
status: Implemented
---
# Readable reference summaries

The user finds the **Used by** section confusing because it exposes `site_main · site.layout.settings.navigation[0].to` without a recognizable location or useful next action. The implementation uses **Used in N places**, places the explanation beside the deletion area, and replaces raw identifiers with editor locations and labels. For Home, the row reads **Site Layout** with **Header › Navigation › Home** underneath and an **Open** button.

A small presentation mapper resolves owners, declared field labels, list names/positions and schema-default locations. Open uses existing editor navigation; page-block sources open their block, entry sources open Content, schema sources open the correct definition and site sources open Site Layout. It does not automatically enter arbitrary nested fields. Named-object schema usage shares the component. Core storage paths remain available internally for validation; reference counting and deletion guards retain their existing scope. Self-references are excluded from the blocker display to match the deletion guard.

Verification exposed a related Starter issue: its inherited navigation records survived removing or changing their visible header links. Editing the header now retains only inherited links with the same row identity and destination, preserving remaining labels and order. Users can therefore resolve the displayed blocker by following Open and editing the link. New arbitrary URL strings remain ordinary URLs under the existing content contract.

The [verification run](../verification/runs/2026-10-08-readable-usage.md) records the tested build, focused and full automated checks, browser observations and limits. No provider operation or deployment is part of this change.
