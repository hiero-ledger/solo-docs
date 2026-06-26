// SPDX-License-Identifier: Apache-2.0
'use strict';

/**
 * @file fetch-solo-docs-content.mjs
 *
 * Build-time fetch for the generated Solo documentation content.
 *
 * The solo repository builds a single combined archive (solo-docs-content.tar.gz)
 * and attaches it to each GitHub release. The archive contains the *bodies* of the
 * generated pages — no Hugo frontmatter — laid out as:
 *
 *   cli/solo-cli.md
 *   troubleshooting/errors/_index.md
 *   troubleshooting/errors/<category>/_index.md
 *   troubleshooting/errors/<category>/SOLO-XXXX.md
 *
 * This script:
 *   1. Resolves the solo version (npm `latest` for `@hiero-ledger/solo`, or the
 *      SOLO_VERSION override).
 *   2. Downloads (or, with SOLO_DOCS_CONTENT_ARCHIVE, reuses a local) archive.
 *   3. Extracts it and prepends the appropriate Hugo/Docsy frontmatter to every
 *      page — this site owns the presentation layer — writing the result into a
 *      gitignored cache directory that hugo.yaml mounts into `content`.
 *   4. Skips the download when the cached `version.txt` matches the current npm
 *      `latest` and the output is already on disk (download path only).
 *
 * The script is invoked from the `pre_hugo` lifecycle hook in package.json, so it
 * runs automatically on `npm run build`, `npm run build:production`, `npm run
 * build:preview`, and `npm run serve` — locally (macOS/Linux/Windows) and in CI.
 *
 * Escape hatch for local testing before a release exists:
 *   SOLO_DOCS_CONTENT_ARCHIVE=../solo/docs/site/build/solo-docs-content.tar.gz npm run pre_hugo
 */

import { mkdir, readFile, rm, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
process.chdir(projectRoot);

const pkg = '@hiero-ledger/solo';
const owner = 'hiero-ledger';
const repo = 'solo';
const assetName = 'solo-docs-content.tar.gz';

const cacheRoot = '.cache/solo-cli-docs';
const versionFile = join(cacheRoot, 'version.txt');
// The cache mirrors the language-prefixed layout of `content/en/...` so it can be
// mounted as `source: .cache/solo-cli-docs/content/en` → `target: content` in
// hugo.yaml, matching the existing `content/en` mount convention.
const contentRoot = join(cacheRoot, 'content/en');
const cliOutFile = join(
  contentRoot,
  'docs/advanced-solo-setup/cli/solo-cli.md',
);
const errorsOutDir = join(contentRoot, 'docs/troubleshooting/errors');
const extractDir = join(cacheRoot, 'archive-src');

const localArchive = process.env.SOLO_DOCS_CONTENT_ARCHIVE;

// Sidebar weight — lower numbers appear higher in the sidebar.
const CATEGORY_LABELS = {
  config: 'Configuration',
  deployment: 'Deployment',
  component: 'Component',
  validation: 'Validation',
  system: 'System',
  internal: 'Internal',
};

const CATEGORY_WEIGHTS = {
  config: 10,
  deployment: 20,
  component: 30,
  validation: 40,
  system: 50,
  internal: 60,
};

// ── Frontmatter blocks ──────────────────────────────────────────────────────

const cliFrontmatter = `---
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

const errorsIndexFrontmatter = `---
title: "Error Codes"
weight: 50
hide_section_index: true
description: >
    Complete reference for all Solo error codes, including troubleshooting steps
    and ownership classification.
---

`;

function categoryIndexFrontmatter(category) {
  const label = CATEGORY_LABELS[category] ?? category;
  const weight = CATEGORY_WEIGHTS[category] ?? 99;
  return `---
title: "${label}"
linkTitle: "${label}"
weight: ${weight}
hide_section_index: true
---

`;
}

function errorPageFrontmatter(category, code, body) {
  const label = CATEGORY_LABELS[category] ?? category;
  const numCode = Number.parseInt(code.replace('SOLO-', ''), 10);
  // ClassName is the first `## \`ClassName\`` heading in the generated body.
  const classMatch = body.match(/^##\s+`([^`]+)`/m);
  const className = classMatch ? classMatch[1] : code;
  return `---
title: "${code}"
linkTitle: "${code}"
weight: ${numCode}
description: "${className} — ${label}"
aliases: ['/docs/errors/${code}']
---

`;
}

// ── Archive acquisition ─────────────────────────────────────────────────────

function resolveVersion() {
  const fromEnvironment = process.env.SOLO_VERSION;
  if (fromEnvironment) {
    return fromEnvironment.replace(/^v/, '');
  }
  // `shell: true` on Windows so `npm` resolves to `npm.cmd` without spawn errors.
  return execFileSync('npm', ['view', pkg, 'version'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  }).trim();
}

async function downloadArchive(version, destination) {
  const tag = `v${version}`;
  const url = `https://github.com/${owner}/${repo}/releases/download/${tag}/${assetName}`;
  console.log(`Downloading ${assetName} from ${tag}...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to download ${url}: ${res.status} ${res.statusText}`,
    );
  }
  await writeFile(destination, Buffer.from(await res.arrayBuffer()));
}

// ── Output writers ──────────────────────────────────────────────────────────

async function writeWithFrontmatter(outPath, frontmatter, body) {
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${frontmatter}${body}`);
}

async function processErrorTree(srcErrorsDir) {
  // Rebuild the errors tree so removed errors don't leave orphaned pages.
  await rm(errorsOutDir, { recursive: true, force: true });

  // Main listing page.
  const indexBody = await readFile(join(srcErrorsDir, '_index.md'), 'utf8');
  await writeWithFrontmatter(
    join(errorsOutDir, '_index.md'),
    errorsIndexFrontmatter,
    indexBody,
  );

  const entries = await readdir(srcErrorsDir, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const category = entry.name;
    const srcCategoryDir = join(srcErrorsDir, category);
    const categoryFiles = await readdir(srcCategoryDir);

    for (const file of categoryFiles) {
      const body = await readFile(join(srcCategoryDir, file), 'utf8');
      if (file === '_index.md') {
        await writeWithFrontmatter(
          join(errorsOutDir, category, '_index.md'),
          categoryIndexFrontmatter(category),
          body,
        );
      } else if (file.endsWith('.md')) {
        const code = file.replace(/\.md$/, '');
        await writeWithFrontmatter(
          join(errorsOutDir, category, file),
          errorPageFrontmatter(category, code, body),
          body,
        );
        count++;
      }
    }
  }
  console.log(`Wrote ${count} error pages with frontmatter`);
}

// ── Main ────────────────────────────────────────────────────────────────────

const version = localArchive ? null : resolveVersion();

if (!localArchive && existsSync(versionFile)) {
  const cachedVersion = (await readFile(versionFile, 'utf8')).trim();
  if (cachedVersion === version && existsSync(cliOutFile)) {
    console.log(`Solo docs content already cached for v${version}`);
    process.exit(0);
  }
}

await rm(extractDir, { recursive: true, force: true });
await mkdir(extractDir, { recursive: true });

const tarball = join(cacheRoot, assetName);
if (localArchive) {
  console.log(`Using local archive: ${localArchive}`);
  if (!existsSync(localArchive)) {
    throw new Error(`SOLO_DOCS_CONTENT_ARCHIVE not found: ${localArchive}`);
  }
} else {
  await downloadArchive(version, tarball);
}

const archivePath = localArchive ?? tarball;
execFileSync('tar', ['-xzf', archivePath, '-C', extractDir], {
  stdio: 'inherit',
});

// solo-cli.md → Solo CLI Reference page.
const cliBody = await readFile(join(extractDir, 'cli/solo-cli.md'), 'utf8');
await writeWithFrontmatter(cliOutFile, cliFrontmatter, cliBody);
console.log('Wrote Solo CLI reference with frontmatter');

// Error pages.
await processErrorTree(join(extractDir, 'troubleshooting/errors'));

// Tidy up the extracted archive sources; keep version.txt for the skip-check.
await rm(extractDir, { recursive: true, force: true });
if (!localArchive) {
  await rm(tarball, { force: true });
  await writeFile(versionFile, `${version}\n`);
  console.log(`Generated Solo docs content from v${version}`);
} else {
  console.log('Generated Solo docs content from local archive');
}
