# Agent instructions for hiero-ledger/solo-docs

This file orients AI coding agents (Claude Code, Cursor, Copilot, Gemini CLI,
and compatible tools) working in this repository. Solo-docs is the Hugo +
Docsy source for [solo.hiero.org](https://solo.hiero.org) — a documentation
site, not application code.

## What this repo is

- **Purpose:** public documentation for Solo (`hiero-ledger/solo`), built with
  Hugo (extended, >= 0.110.0) and the Docsy theme.
- **Content root:** `content/en/docs/` — every user-facing page lives here as
  Markdown with Hugo front matter.
- **Not this repo:** application source, CLI code, and internal
  contributor/design docs live in `hiero-ledger/solo`, not here (see "Syncing
  from the solo repo" below).

## Commands

```bash
npm install
npm run serve          # local dev server (Hugo, live reload)
npm run build           # production build
npm run check:links:all # link checker (htmltest) — run before opening a PR
npm run fix:format       # prettier --write
```

## Front matter — required on every content page

```yaml
---
title: "Page Title"
weight: <number>        # controls sidebar order among siblings
description: >
  One or two sentence description for SEO and navigation.
categories: ["Category"]
tags: ["tag1", "tag2"]
type: docs
---
```

Do not add a page without `description` — it is used for SEO, on-site search,
and the site's AI-facing index (`/llms.txt`) once that ships (tracked in #304).

## Syncing from the solo repo

`hiero-ledger/solo` is the canonical source for some user-facing docs (under
`docs/site/content/en/docs/` there). When a doc changes in `solo`, port it
here — do not treat solo-docs as independently authoritative for content that
originates in `solo`. Full sync process, including the user/operator test for
what belongs here vs. staying internal to `solo`, is in `CONTRIBUTING.md`
("Syncing Documentation from the Solo Repository").

Style differences to apply when porting: remove any `# Title` H1 (becomes
front matter `title`), sentence-case headings, add front matter if missing,
use `${SOLO_NAMESPACE}` / `${SOLO_DEPLOYMENT}` env-var format consistently.

## Commit conventions

Scoped Conventional Commits: `type(scope): description` — e.g.
`docs(quickstart): fix typo in dependencies section`. Types: `feat`, `fix`,
`docs`, `style`, `refactor`, `test`, `chore`. Full scope list in
`CONTRIBUTING.md`.

## Before submitting a PR

- [ ] `npm run check:links:all` passes
- [ ] `npm run fix:format` applied
- [ ] Every new/changed page has `description` in front matter
- [ ] If porting from `solo`, PR description references the originating
      `solo` PR (`Follow-up to hiero-ledger/solo#XXXX`)
