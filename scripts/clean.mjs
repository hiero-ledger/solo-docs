// SPDX-License-Identifier: Apache-2.0
'use strict';

/**
 * @file clean.mjs
 *
 * Cross-platform replacement for the previous `rm -Rf public/* resources`
 * clean script. Also clears the build-artifact cache populated by
 * fetch-solo-cli-doc.mjs so the next build re-downloads from the GitHub
 * release.
 *
 * Behavior:
 *   - Empties `public/` (preserves the directory itself so the existing
 *     `make:public` git-init flow still works).
 *   - Removes `resources/`.
 *   - Removes `.cache/solo-cli-docs/`.
 */

import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

async function emptyDir(dir) {
  let entries;
  try {
    entries = await readdir(dir);
  } catch (err) {
    if (err.code === 'ENOENT') return;
    throw err;
  }
  await Promise.all(
    entries.map((entry) =>
      rm(join(dir, entry), { recursive: true, force: true }),
    ),
  );
}

await emptyDir('public');
await rm('resources', { recursive: true, force: true });
await rm('.cache/solo-cli-docs', { recursive: true, force: true });
