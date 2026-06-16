// SPDX-License-Identifier: Apache-2.0
'use strict';

/**
 * @file fetch-solo-cli-doc.mjs
 *
 * Build-time fetch for the canonical Solo CLI reference page.
 *
 * What this does:
 *   1. Reads the npm `latest` version for `@hiero-ledger/solo`.
 *   2. Downloads the matching `solo-cli.md` asset from the corresponding
 *      hiero-ledger/solo GitHub release.
 *   3. Prepends Hugo frontmatter so the page renders inside this Docsy site.
 *   4. Writes the result into a gitignored cache directory whose layout is
 *      mounted into Hugo's `content` tree via `hugo.yaml` so the page appears
 *      at the same URL as the previously checked-in copy used to.
 *   5. Skips the download when the cached `version.txt` matches the current
 *      npm `latest` and the output file is already on disk.
 *
 * The script is invoked from `prebuild` / `preserve` lifecycle hooks in
 * `package.json`, so it runs automatically on `npm run build`, `npm run
 * build:production`, `npm run build:preview`, and `npm run serve` — locally
 * (macOS/Linux/Windows) and in CI.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const pkg = '@hiero-ledger/solo';
const owner = 'hiero-ledger';
const repo = 'solo';
const assetName = 'solo-cli.md';

const cacheRoot = '.cache/solo-cli-docs';
const versionFile = join(cacheRoot, 'version.txt');
// The cache mirrors the language-prefixed layout of `content/en/...` so it can
// be mounted as `source: .cache/solo-cli-docs/content/en` → `target: content`
// in hugo.yaml, matching the existing `content/en` mount convention.
const outFile = join(
  cacheRoot,
  'content/en/docs/advanced-solo-setup/cli/solo-cli.md',
);

// `shell: true` on Windows so `npm` resolves to `npm.cmd` without spawn errors.
const version = execFileSync('npm', ['view', pkg, 'version'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
}).trim();

const tag = `v${version}`;

if (existsSync(versionFile)) {
  const cachedVersion = (await readFile(versionFile, 'utf8')).trim();
  if (cachedVersion === version && existsSync(outFile)) {
    console.log(`Solo CLI docs already cached for ${tag}`);
    process.exit(0);
  }
}

const url = `https://github.com/${owner}/${repo}/releases/download/${tag}/${assetName}`;

const res = await fetch(url);
if (!res.ok) {
  throw new Error(
    `Failed to download ${url}: ${res.status} ${res.statusText}`,
  );
}

const markdown = await res.text();

const frontmatter = `---
title: "Solo CLI Reference"
weight: 1
aliases:
  - /docs/solo-cli/
  - /docs/solo-commands/
  - /docs/advanced-solo-setup/solo-cli/
description: >
  Canonical Solo CLI command and flag reference for end users.
categories: ["Advanced", "Reference"]
tags: ["cli", "commands", "reference"]
type: docs
---

`;

await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, `${frontmatter}${markdown}`);
await writeFile(versionFile, `${version}\n`);

console.log(`Generated Solo CLI docs from ${tag}`);
