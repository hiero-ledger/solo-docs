// SPDX-License-Identifier: Apache-2.0
'use strict';

/**
 * Convenience wrapper to run both documentation generation scripts.
 *
 * Usage:
 *   node scripts/wrapperForUpdateDocs.mjs [version]
 *
 * Notes:
 * - `version` is forwarded to executeUpdateDocs.mjs.
 * - `solo` must already be available on PATH.
 * - `SOLO_SOURCE_DIR` can be provided by the caller when needed.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './utilities.mjs';

void async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(__dirname, '../');
  process.chdir(projectRoot);

  const version = process.argv[2];
  const versionArg = version ? ` ${version}` : '';

  await run(`node scripts/executeUpdateDocs.mjs${versionArg}`);
  await run('node scripts/generateHelp.mjs');
}();
