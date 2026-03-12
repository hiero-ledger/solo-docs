// SPDX-License-Identifier: Apache-2.0
'use strict';

/**
 * @file generateHelp.mjs
 *
 * Automatically generates a Markdown CLI-reference page for the Solo tool by
 * introspecting its own `--help` output up to three levels deep.
 *
 * The generated file is written to:
 *   content/en/docs/solo-commands.md
 *
 * High-level flow:
 *  1. Run `solo --help` to get the list of top-level commands (e.g. "init",
 *     "cluster-ref", "deployment", "consensus", …).
 *  2. For each top-level command, run `solo <cmd> --help` to discover its
 *     sub-commands.
 *  3. For each sub-command, run `solo <cmd> <subcmd> --help` to discover any
 *     third-level commands (e.g. "consensus node setup").
 *  4. Build a Markdown document with:
 *       - A YAML front matter block (title, weight, description for Hugo).
 *       - A nested Table of Contents that links to every command section.
 *       - A full help dump for the root command.
 *       - A section for each command, sub-command, and third-level command,
 *         each containing its raw `--help` output in a fenced code block.
 *  5. Write everything to `OUTPUT_FILE` in one `fs.writeFileSync` call.
 *
 * The script runs three helper functions for discovery:
 *   getTopLevelCommands()            – parses the "Commands:" block of root help
 *   getSubcommands(cmd)              – parses the sub-command lines of a command
 *   getThirdLevelCommands(cmd,sub)   – parses the sub-sub-command lines
 *
 * All CLI invocations use `runCapture()` (silent, output returned as string) so
 * the output can be parsed or embedded without cluttering the terminal.
 */

import fs from "node:fs";
import path from 'node:path';
import { fileURLToPath } from "node:url";
import { runCapture } from "./utilities.mjs";
import kleur from 'kleur';

// Resolve the directory this script lives in and navigate to the repo root so
// all relative paths in the rest of the script are stable.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// scripts/ is one level inside the solo-docs repo root, so one ".." suffices.
const projectRoot = path.resolve(__dirname, "../");
process.chdir(projectRoot);

// Destination for the generated Markdown CLI reference page.
// In solo-docs the Hugo content lives at the repo root, not under docs/site/.
const OUTPUT_FILE = path.join(projectRoot, "content/en/docs/solo-commands.md");

/**
 * Fetch the list of top-level Solo CLI commands by running `solo --help` and
 * parsing only the lines that appear between the "Commands:" and "Options:"
 * headings.
 *
 * Example help snippet that this parses:
 *
 *   Commands:
 *     init        Initialize local environment
 *     cluster-ref Manage cluster references
 *     …
 *   Options:
 *     --help  Show help
 *
 * The reduce accumulator uses an `inCommands` flag that is set to `true` when
 * the "Commands:" line is encountered and reset to `false` at "Options:".  Any
 * non-blank line in between has its first whitespace-separated token taken as
 * the command name.
 *
 * Returns an empty array (rather than throwing) if the CLI call fails, so the
 * rest of the script degrades gracefully.
 *
 * @returns {Promise<string[]>} List of top-level command names, e.g. ["init", "cluster-ref", …]
 */
async function getTopLevelCommands() {
  try {
    // Run solo --help silently and capture the full text output.
    // solo is installed globally by the CI workflow (or locally via `npm link`).
    const output = await runCapture("solo --help");
    return output
      .split("\n")
      .reduce(
        (acc, line) => {
          // Entering the commands block.
          if (line.trim().startsWith("Commands:")) {
            acc.inCommands = true;
            return acc;
          }
          // Leaving the commands block when we hit "Options:".
          if (line.trim().startsWith("Options:")) {
            acc.inCommands = false;
            return acc;
          }
          // While inside the commands block, grab the first word of each line
          // (that's the command name; the rest is the description).
          if (acc.inCommands && line.trim()) {
            acc.commands.push(line.trim().split(/\s+/)[0]);
          }
          return acc;
        },
        { inCommands: false, commands: [] }
      ).commands;
  } catch {
    // If the CLI isn't available or fails, skip rather than crashing the script.
    return [];
  }
}

/**
 * Fetch the sub-commands of a given top-level Solo command by running
 * `solo <cmd> --help` and filtering lines whose first word matches cmd,
 * indicating they are sub-command listings.
 *
 * Example: for `cmd = "cluster-ref"`, a line like:
 *   "cluster-ref config   Manage cluster-ref configuration"
 * is identified because it starts with "cluster-ref " and the second word
 * ("config") is extracted as the sub-command name.
 *
 * @param {string} cmd - A top-level Solo command name (e.g. "cluster-ref").
 * @returns {Promise<string[]>} List of sub-command names, or [] on failure.
 */
async function getSubcommands(cmd) {
  try {
    const output = await runCapture(`solo ${cmd} --help`);
    return output
      .split("\n")
      // Keep only lines that look like "<cmd> <subcmd>  description…"
      .filter((l) => l.trim().startsWith(cmd + " "))
      // The second whitespace-separated token is the sub-command name.
      .map((l) => l.trim().split(/\s+/)[1]);
  } catch {
    return [];
  }
}

/**
 * Fetch any third-level commands beneath a given `<cmd> <subcmd>` pair by
 * running `solo <cmd> <subcmd> --help` and filtering lines whose prefix
 * matches "<cmd> <subcmd> ".
 *
 * Example: for cmd="consensus", subcmd="node", a line like:
 *   "consensus node setup   Set up consensus node"
 * is matched and "setup" is extracted as the third-level command name.
 *
 * @param {string} cmd    - Top-level command name.
 * @param {string} subcmd - Sub-command name.
 * @returns {Promise<string[]>} List of third-level command names, or [] on failure.
 */
async function getThirdLevelCommands(cmd, subcmd) {
  try {
    const output = await runCapture(`solo ${cmd} ${subcmd} --help`);
    return output
      .split("\n")
      // Keep only lines that start with the full "<cmd> <subcmd> " prefix.
      .filter((l) => l.trim().startsWith(`${cmd} ${subcmd} `))
      // The third whitespace-separated token is the third-level command name.
      .map((l) => l.trim().split(/\s+/)[2]);
  } catch {
    return [];
  }
}

/**
 * Main entry point – builds the entire Markdown CLI reference and writes it
 * to OUTPUT_FILE.  The function is declared as an immediately-invoked async
 * function expression (IIFE) so the script runs as soon as it is loaded by
 * Node.js without needing a separate `main()` call.
 *
 * The document is assembled in two passes over the list of commands:
 *
 *   Pass 1 – Table of Contents
 *     Iterates every top-level command → sub-command → third-level command and
 *     appends a nested Markdown list entry with an anchor link for each item.
 *     This gives readers a quick overview and lets them jump directly to the
 *     section they care about.
 *
 *   Pass 2 – Detailed sections
 *     Iterates the same command tree again and embeds the raw `--help` output
 *     for each command in a fenced code block under its own heading.
 *
 * The entire document string is accumulated in memory and written to disk in
 * one call at the end (so the file is never left in a partially-written state).
 */
void async function main() {
  // `doc` accumulates the full Markdown text that will be written to disk.
  let doc = "";

  // ── Front matter ────────────────────────────────────────────────────────────
  // Hugo reads the YAML block between the --- delimiters to determine the page
  // title, its position in the sidebar (weight), and the meta description.
  doc += `---\n`;
  doc += `title: "Solo CLI Commands"\n`;
  doc += `weight: 40\n`;
  doc += `description: >\n`;
  doc += `    This document provides a comprehensive reference for the Solo CLI commands, including their options and usage.\n`;
  doc += `---\n\n`;
  doc += `# Solo Command Reference\n\n`;
  doc += `## Table of Contents\n`;
  // Seed the TOC with a static entry for the root help section.
  doc += `\n* [Root Help Output](#root-help-output)\n`;

  // ── Pass 1: Discover command tree and build Table of Contents ────────────────
  // Fetch all top-level commands first; subsequent loops build on this list.
  const commands = await getTopLevelCommands();

  for (const cmd of commands) {
    console.log(`#1 Processing command: ${kleur.green(cmd)}`);
    // Each top-level command becomes a top-level bullet in the TOC.
    let entry = `\n* [${cmd}](#${cmd})`;

    // Fetch and loop sub-commands to create indented TOC entries.
    const subcommands = await getSubcommands(cmd);
    for (const subcmd of subcommands) {
      console.log(`#1 Processing subcommand: ${kleur.green(cmd)} ${kleur.cyan(subcmd)}`);
      // Anchor IDs follow the pattern "cmd-subcmd" (GitHub/Hugo Markdown standard).
      let sub = `\n  * [${cmd} ${subcmd}](#${cmd}-${subcmd})`;

      // If this sub-command has its own sub-commands, add a third level of indentation.
      const thirdLevel = await getThirdLevelCommands(cmd, subcmd);
      for (const t of thirdLevel) {
        sub += `\n    * [${cmd} ${subcmd} ${t}](#${cmd}-${subcmd}-${t})`;
      }

      entry += sub;
    }

    doc += entry;
  }

  // ── Root help section ────────────────────────────────────────────────────────
  // Embed the full output of `solo --help` in a code block so readers see
  // exactly what the CLI prints when run with no arguments.
  doc += `\n\n## Root Help Output\n\n`;
  doc += "```\n";
  doc += await runCapture(`solo --help`);
  doc += "\n```\n";

  // ── Pass 2: Write detailed help sections for every command ──────────────────
  // Now iterate the same tree again to produce the actual content sections that
  // the TOC anchors point to.
  for (const cmd of commands) {
    console.log(`#2 Processing command: ${kleur.green(cmd)}`);

    // H2 heading for the top-level command, followed by its --help code block.
    let section = `\n## ${cmd}\n\n\`\`\`\n`;
    section += await runCapture(`solo ${cmd} --help`);
    section += `\n\`\`\`\n`;

    const subcommands = await getSubcommands(cmd);
    for (const subcmd of subcommands) {
      console.log(`#2 Processing subcommand: ${kleur.green(cmd)} ${kleur.cyan(subcmd)}`);

      // H3 heading for the sub-command.
      let subSection = `\n### ${cmd} ${subcmd}\n\n\`\`\`\n`;
      subSection += await runCapture(`solo ${cmd} ${subcmd} --help`);
      subSection += `\n\`\`\`\n`;

      const thirdLevel = await getThirdLevelCommands(cmd, subcmd);
      for (const t of thirdLevel) {
        console.log(`#3 Processing third-level command: ${kleur.green(cmd)} ${kleur.cyan(subcmd)} ${kleur.yellow(t)}`);

        // H4 heading for the third-level command.
        let third = `\n#### ${cmd} ${subcmd} ${t}\n\n\`\`\`\n`;
        third += await runCapture(`solo ${cmd} ${subcmd} ${t} --help`);
        third += `\n\`\`\`\n`;

        subSection += third;
      }

      section += subSection;
    }

    doc += section;
  }

  // ── Write to disk ────────────────────────────────────────────────────────────
  // Accumulate everything first, then write once so the file is never in a
  // half-written state and a failed mid-run doesn't corrupt earlier content.
  fs.writeFileSync(OUTPUT_FILE, doc, "utf-8");

  console.log(`Documentation saved to ${OUTPUT_FILE}`);
  process.exit(0);
}();
