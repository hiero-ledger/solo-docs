// SPDX-License-Identifier: Apache-2.0
'use strict';

/**
 * @file executeUpdateDocs.mjs
 *
 * The simplest possible entry point for the documentation update pipeline.
 *
 * This file exists so that the pipeline can be triggered directly with:
 *
 *   node scripts/executeUpdateDocs.mjs
 *
 * It does nothing except import and immediately call the `update()` function
 * from updateDocs.mjs.  All of the real work – spinning up a Kind cluster,
 * running Solo CLI commands, capturing their output, and rendering Markdown
 * files from templates – happens inside `update()`.
 *
 * The `void` keyword is used intentionally: it discards the returned Promise
 * and lets any uncaught rejection surface as an unhandled-rejection warning
 * rather than silently swallowing errors.
 *
 */
import { update } from './updateDocs.mjs';

// Kick off the documentation update and let Node.js handle the Promise.
void update();