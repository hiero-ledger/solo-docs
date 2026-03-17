// SPDX-License-Identifier: Apache-2.0
'use strict';

/**
 * @file utilities.mjs
 *
 * Shared helper functions used by all other scripts in this directory.
 *
 * There are four exported functions here, each serving a different purpose:
 *
 *   run(cmd, opts)          - Run a shell command while streaming its output
 *                             live to the terminal.  Use this when you want the
 *                             user to see what is happening in real time (e.g.
 *                             "kind create cluster …").
 *
 *   runAndSave(cmd, key, logFile)
 *                           - Same as `run`, but also writes the combined
 *                             output to a log file AND stores it in an
 *                             environment variable so later commands in the
 *                             same process can reference the captured text.
 *                             Used by updateDocs.mjs to preserve the terminal
 *                             output of every Solo CLI command so it can later
 *                             be embedded into Markdown templates.
 *
 *   runCapture(cmd, opts)   - Run a shell command silently (no live output)
 *                             and return its output as a plain string.  Use
 *                             this when you need to parse the output in code
 *                             rather than display it (e.g. reading CLI help
 *                             text to build a docs page).
 *
 *   envsubst(template, vars)
 *                           - Replace every `$VARIABLE_NAME` placeholder in a
 *                             template string with the matching value from the
 *                             supplied object.  Works like the Unix `envsubst`
 *                             program but runs entirely in Node.js.
 */

import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import kleur from 'kleur';

/**
 * Run a shell command, stream its output live, and return the full output as a
 * string when the command exits successfully.
 *
 * How it works:
 *  1. The command string (e.g. "kind create cluster -n solo") is split on
 *     spaces so the first token becomes the executable and the rest become its
 *     arguments.  The `shell: true` option means the OS shell handles things
 *     like pipes and environment variable expansion inside the command itself.
 *  2. stdin is inherited from the parent process so interactive prompts (if
 *     any) pass through to the user.
 *  3. Both stdout and stderr are piped – meaning Node.js intercepts them – so
 *     we can accumulate the text in `output` while also forwarding it to the
 *     terminal in real time via `process.stdout.write` / `process.stderr.write`.
 *  4. Carriage-return characters (\r) are stripped to keep the accumulated
 *     string clean when it is later written to a file.
 *  5. When the process closes, a non-zero exit code triggers a rejection with a
 *     descriptive error message.
 *
 * @param {string} cmd - The full shell command to run, including any arguments
 *                        (e.g. "solo init" or "kind delete cluster -n solo").
 * @param {Object} [opts={}] - Optional overrides forwarded directly to
 *                              Node's `spawn()` (e.g. `{ cwd: '/some/path' }`).
 * @returns {Promise<string>} Resolves with the trimmed combined output (stdout
 *                             + stderr) on success, or rejects with an Error on
 *                             non-zero exit.
 */
export async function run(cmd, opts = {}) {
  // Log the command in green so developers can follow along in the terminal.
  console.log(kleur.green(cmd));

  // Split "kind create cluster -n solo" → command="kind", args=["create","cluster","-n","solo"]
  const [command, ...args] = cmd.split(' ');

  return new Promise((resolve, reject) => {
    // Copy the current environment so the spawned process inherits all variables
    // (e.g. SOLO_NAMESPACE, PATH).  Provide a safe fallback PATH if the parent
    // process somehow has none set.
    const env = { ...process.env };
    if (!env.PATH) env.PATH = '/usr/local/bin:/usr/bin:/bin';

    const child = spawn(command, args, {
      // inherit: stdin passes through so interactive prompts work
      // pipe:    stdout/stderr are captured by the event listeners below
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true, // let the shell handle special characters and env vars
      env,
      ...opts,   // caller can override any of the above
    });

    let output = '';

    // Stream stdout to the terminal AND accumulate it in `output`.
    child.stdout.on('data', (data) => {
      const text = data.toString();
      process.stdout.write(text); // live display
      output += text.replace(/\r/g, ''); // strip carriage returns for clean files
    });

    // Do the same for stderr (e.g. warnings from kubectl / solo).
    child.stderr.on('data', (data) => {
      const text = data.toString();
      process.stderr.write(text);
      output += text.replace(/\r/g, '');
    });

    // Resolve or reject once the child process has fully exited.
    child.on('close', (code) => {
      if (code === 0) resolve(output.trim());
      else reject(new Error(`Command failed: ${cmd} (exit code ${code})`));
    });
  });
}

/**
 * Run a shell command, capture its output, persist it to a log file, and also
 * store it in a named environment variable so downstream commands can reference
 * it.
 *
 * This is a thin wrapper around `run()` that adds two side-effects:
 *  - Writes the output to `logFile` (useful for CI artifacts and debugging).
 *  - Assigns the output to `process.env[key]` so that Markdown templates can
 *    later reference it via `$KEY` placeholders processed by `envsubst()`.
 *
 * Example usage in updateDocs.mjs:
 *   await runAndSave('solo init', 'SOLO_INIT_OUTPUT', 'build/init.log');
 *   // → process.env.SOLO_INIT_OUTPUT now contains the init command's output
 *   // → build/init.log contains the same text on disk
 *
 * @param {string} cmd     - The shell command to run.
 * @param {string} key     - The environment variable name to assign the output to.
 * @param {string} logFile - Absolute or relative path where the output is saved.
 * @returns {Promise<string>} The command's output, same as `run()`.
 */
export async function runAndSave(cmd, key, logFile) {
  console.log(`beginning runAndSave for '${cmd}'`);

  // Run the command and wait for it to finish, streaming output to the terminal.
  const output = await run(cmd);

  // Write the output to a file (appending a newline for clean log files).
  writeFileSync(logFile, output + '\n');

  // Store in the process environment so template substitution can embed it.
  process.env[key] = output;

  console.log(`ended runAndSave for '${cmd}', output saved to ${logFile}`);
  return output;
}

/**
 * Run a shell command silently and return its output as a string.
 *
 * Unlike `run()`, this function does NOT stream output to the terminal.
 * It is designed for cases where the output needs to be parsed in code – for
 * example, reading the help text of the Solo CLI to extract a list of
 * sub-commands (see generateHelp.mjs).
 *
 * The key differences from `run()`:
 *  - stdin is 'ignore' (no interactive prompts).
 *  - Nothing is written to the terminal while the command runs.
 *  - The raw accumulated output is returned for programmatic processing.
 *
 * @param {string} cmd     - Command to execute, including all arguments.
 * @param {Object} [opts={}] - Optional spawn overrides (e.g. `{ cwd }`).
 * @returns {Promise<string>} Resolves to the trimmed stdout+stderr output,
 *                             or rejects with an Error on non-zero exit.
 */
export async function runCapture(cmd, opts = {}) {
  // Split into executable + argument array (same approach as `run()`).
  const [command, ...args] = cmd.split(' ');

  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    if (!env.PATH) env.PATH = '/usr/local/bin:/usr/bin:/bin';

    const child = spawn(command, args, {
      // 'ignore' for stdin: the command must not need user input.
      // 'pipe' for stdout/stderr: we want to capture the text in code.
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      env,
      ...opts,
    });

    let output = '';

    // Silently accumulate stdout – no forwarding to the terminal.
    child.stdout.on('data', (data) => {
      output += data.toString().replace(/\r/g, '');
    });

    // Accumulate stderr too so error messages are included in the output string.
    child.stderr.on('data', (data) => {
      output += data.toString().replace(/\r/g, '');
    });

    child.on('close', (code) => {
      if (code === 0) resolve(output.trim());
      else reject(new Error(`Command failed: ${cmd} (exit code ${code})`));
    });
  });
}

/**
 * Replace `$VARIABLE_NAME` placeholders in a template string with actual values.
 *
 * This is a pure Node.js re-implementation of the Unix `envsubst` program.
 * It is used by updateDocs.mjs to embed live command output into Markdown
 * documentation templates.
 *
 * How it works:
 *  - Iterates over every key-value pair in `vars`.
 *  - For each key, constructs a global regular expression that matches the
 *    literal string `$KEY` anywhere in the template.
 *  - Replaces all occurrences with the corresponding value (an empty string
 *    if the value is falsy / undefined).
 *
 * Example:
 *   envsubst('Cluster output:\n$SOLO_INIT_OUTPUT', { SOLO_INIT_OUTPUT: 'ok' })
 *   // → 'Cluster output:\nok'
 *
 * Note: Only `$KEY` style placeholders are supported.  `${KEY}` (brace-wrapped)
 * is NOT handled by this function.
 *
 * @param {string} template - The template string containing `$VAR` placeholders.
 * @param {Record<string, string>} vars - Key-value map of variable names to
 *                                        their replacement strings.  Passing
 *                                        `process.env` here substitutes all
 *                                        current environment variables.
 * @returns {string} The template with every recognised placeholder replaced.
 */
export function envsubst(template, vars) {
  let result = template;

  for (const [key, val] of Object.entries(vars)) {
    // Build a regex like /\$SOLO_INIT_OUTPUT/g so ALL occurrences are replaced.
    const regex = new RegExp(`\\$${key}`, 'g');
    // Replace with the value, or '' if the value is null/undefined/empty.
    result = result.replace(regex, val || '');
  }

  return result;
}
