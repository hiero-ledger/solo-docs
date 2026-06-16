// SPDX-License-Identifier: Apache-2.0
'use strict';

/**
 * @file generateErrors.mjs
 *
 * Generates Hugo Markdown documentation pages for all SoloError subclasses by
 * parsing the TypeScript source files in the solo repository.
 *
 * For each error class the script extracts:
 *   - Error code (e.g. SOLO-1001)
 *   - Class name
 *   - Category (component / config / deployment / internal / system / validation)
 *   - Ownership (User / Infrastructure / Solo)
 *   - Retryable flag
 *   - Troubleshooting steps
 *   - Optional @description TSDoc tag
 *
 * Output (the error reference is nested under the Troubleshooting section):
 *   content/en/docs/troubleshooting/errors/_index.md               — listing page with tables per category
 *   content/en/docs/troubleshooting/errors/{category}/_index.md    — category section page
 *   content/en/docs/troubleshooting/errors/{category}/SOLO-XXXX.md — individual page per error
 *
 * Individual SOLO-XXXX.md pages include an alias at /docs/errors/SOLO-XXXX so
 * the URLs produced by SoloError.getDocumentUrl() continue to resolve even though
 * the canonical content now lives at /docs/troubleshooting/errors/{category}/SOLO-XXXX.
 *
 * Source of the error classes (precedence):
 *   1. SOLO_REPO_PATH — a local solo checkout (e.g. ../solo). Use this to generate
 *      against uncommitted/local changes.
 *   2. Otherwise the published release source is downloaded from GitHub for the
 *      version given by SOLO_VERSION, or — when unset — the npm `latest` version of
 *      @hiero-ledger/solo. fetch-solo-cli-doc.mjs passes SOLO_VERSION so the error
 *      pages match the fetched CLI reference. Release tarballs are cached under
 *      .cache/solo-src/<version>.
 *
 * Usage:
 *   node scripts/generateErrors.mjs                          # released latest
 *   SOLO_VERSION=0.77.0 node scripts/generateErrors.mjs      # a specific release
 *   SOLO_REPO_PATH=../solo node scripts/generateErrors.mjs   # a local checkout
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import kleur from 'kleur';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../');
process.chdir(projectRoot);

const SOLO_PKG = '@hiero-ledger/solo';
const SOLO_SRC_CACHE = path.join(projectRoot, '.cache/solo-src');

// Resolved in main() from a local checkout (SOLO_REPO_PATH) or the downloaded
// release source — the root of the solo tree the error classes are read from.
let SOLO_REPO;
let ERRORS_DIR;
let REGISTRY_FILE;

const OUTPUT_DIR = path.join(projectRoot, 'content/en/docs/troubleshooting/errors');
const BUG_REPORT_URL = 'https://github.com/hiero-ledger/solo/issues';

const CATEGORY_LABELS = {
  config: 'Configuration',
  deployment: 'Deployment',
  component: 'Component',
  validation: 'Validation',
  system: 'System',
  internal: 'Internal',
};

// Sidebar weight — lower numbers appear higher in the sidebar.
const CATEGORY_WEIGHTS = {
  config: 10,
  deployment: 20,
  component: 30,
  validation: 40,
  system: 50,
  internal: 60,
};


// ── Code registry ─────────────────────────────────────────────────────────────

/**
 * Reads error-code-registry.ts and returns a Map from registry key to code string.
 * e.g. 'LOCAL_CONFIG_NOT_FOUND' → 'SOLO-1001'
 */
function buildCodeMap() {
  const source = fs.readFileSync(REGISTRY_FILE, 'utf8');
  const map = new Map();
  for (const [, key, code] of source.matchAll(/^\s{2}(\w+):\s*'(SOLO-\d+)'/gm)) {
    map.set(key, code);
  }
  return map;
}

// ── Source parsing helpers ────────────────────────────────────────────────────

function extractClassName(source) {
  const match = source.match(/export class (\w+) extends SoloError/);
  return match ? match[1] : null;
}

function extractOwnership(source) {
  const match = source.match(/ErrorOwnership\.(\w+)/);
  return match ? match[1] : null;
}

function extractRetryable(source) {
  const match = source.match(/retryable:\s*boolean\s*=\s*(true|false)/);
  if (!match) return null;
  return match[1] === 'true';
}

function extractCodeKey(source) {
  const match = source.match(/code:\s*ErrorCodeRegistry\.(\w+)/);
  return match ? match[1] : null;
}

/**
 * Extracts troubleshooting steps from the source.  The steps are stored as a
 * multiline string in one of several forms:
 *   - Single-quoted strings joined with '+': 'Step 1\n' + 'Step 2'
 *   - A single single-quoted string:          'Only step'
 *   - A template literal:                     `Step with ${SoloError.bugReportUrl}`
 *   - Mixed: template literal + single-quoted string concatenated with '+'
 *
 * Returns an array of step strings (one element per `\n`-separated segment).
 */
function extractTroubleshootingSteps(source) {
  const tsIdx = source.indexOf('troubleshootingSteps:');
  if (tsIdx === -1) return [];

  const region = source.slice(tsIdx + 'troubleshootingSteps:'.length, tsIdx + 4000);

  // Stop at the first line that starts with whitespace + '}' (closes the SoloErrorInit
  // object), regardless of whether it's followed by cause, ')', or ';'.
  const closingMatch = region.match(/\n[ \t]+\}/);
  const valueSource = closingMatch ? region.slice(0, closingMatch.index) : region;

  // Replace ${SoloError.bugReportUrl} with the actual URL before string extraction
  const withBugUrl = valueSource.replace(/\$\{SoloError\.bugReportUrl\}/g, BUG_REPORT_URL);

  // Collect all string parts in source order (single-quoted or template literal)
  const parts = [];
  for (const match of withBugUrl.matchAll(/'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.|\$\{[^}]+\})*)`/g)) {
    if (match[1] !== undefined) {
      // Single-quoted string — use as-is
      parts.push(match[1]);
    } else if (match[2] !== undefined) {
      // Template literal — replace runtime variable references with <varName>
      parts.push(match[2].replace(/\$\{([^}]+)\}/g, '<$1>'));
    }
  }

  if (parts.length === 0) return [];

  return parts
    .join('')
    .split('\\n')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Extracts the @description TSDoc tag from the comment block immediately
 * preceding the `export class ... extends SoloError` declaration.
 * Returns null if no @description is found.
 */
function extractDescription(source) {
  const classIdx = source.search(/export class \w+ extends SoloError/);
  if (classIdx === -1) return null;

  const beforeClass = source.slice(0, classIdx);
  const lastCommentStart = beforeClass.lastIndexOf('/**');
  if (lastCommentStart === -1) return null;

  const comment = beforeClass.slice(lastCommentStart);
  const descMatch = comment.match(/@description\s+([\s\S]+?)(?:\n\s*\*\s*@|\s*\*\/)/);
  if (!descMatch) return null;

  return descMatch[1]
    .split('\n')
    .map(line => line.replace(/^\s*\*\s?/, '').trim())
    .filter(Boolean)
    .join(' ');
}

// ── File scanning ─────────────────────────────────────────────────────────────

function collectErrorFiles() {
  return fs
    .readdirSync(ERRORS_DIR, {recursive: true, withFileTypes: true})
    .filter(entry => entry.isFile() && entry.name.endsWith('.ts') && !entry.name.startsWith('index'))
    .map(entry => path.join(entry.parentPath, entry.name));
}

// ── Error metadata extraction ─────────────────────────────────────────────────

function parseErrorFile(filePath, codeMap) {
  const source = fs.readFileSync(filePath, 'utf8');
  const className = extractClassName(source);
  if (!className) return null;

  const codeKey = extractCodeKey(source);
  const code = codeKey ? codeMap.get(codeKey) : null;
  if (!code) return null;

  // Category is the first directory segment under 'classes/'
  const relative = path.relative(ERRORS_DIR, filePath);
  const category = relative.split(path.sep)[0];

  return {
    code,
    className,
    category,
    ownership: extractOwnership(source),
    retryable: extractRetryable(source),
    troubleshootingSteps: extractTroubleshootingSteps(source),
    description: extractDescription(source),
  };
}

// ── Sorting ───────────────────────────────────────────────────────────────────

function numericCode(code) {
  return parseInt(code.replace('SOLO-', ''), 10);
}

// ── Markdown generation ───────────────────────────────────────────────────────

function generateIndexPage(errors) {
  let doc = '';
  doc += `---\n`;
  doc += `title: "Error Codes"\n`;
  doc += `weight: 50\n`;
  doc += `hide_section_index: true\n`;
  doc += `description: >\n`;
  doc += `    Complete reference for all Solo error codes, including troubleshooting steps\n`;
  doc += `    and ownership classification.\n`;
  doc += `---\n\n`;
  doc += `All Solo errors carry a structured code, an ownership classification, and troubleshooting\n`;
  doc += `steps. Click an error code to see its dedicated page.\n\n`;

  // Group errors by category, preserving the canonical order defined in CATEGORY_LABELS.
  const byCategory = new Map(Object.keys(CATEGORY_LABELS).map(k => [k, []]));
  for (const error of errors) {
    const bucket = byCategory.get(error.category) ?? [];
    bucket.push(error);
    byCategory.set(error.category, bucket);
  }

  for (const [category, bucket] of byCategory) {
    if (bucket.length === 0) continue;
    const categoryLabel = CATEGORY_LABELS[category] ?? category;
    doc += `## ${categoryLabel}\n\n`;
    doc += `| Code | Class | Ownership | Retryable |\n`;
    doc += `|------|-------|-----------|----------|\n`;
    for (const error of bucket) {
      const retryableLabel = error.retryable === true ? 'Yes' : error.retryable === false ? 'No' : '—';
      // Link into the category subdirectory so Hugo resolves directly without a redirect.
      doc += `| [${error.code}](${error.category}/${error.code}) | \`${error.className}\` | ${error.ownership ?? '—'} | ${retryableLabel} |\n`;
    }
    doc += `\n`;
  }

  // When a visitor arrives via a category redirect (e.g. /docs/troubleshooting/errors/config/ →
  // /docs/troubleshooting/errors/#configuration), the sidebar category section should auto-expand.
  // Docsy's foldable nav uses hidden checkboxes: checking one expands its child ul.
  // Sidebar links for category sections have class td-sidebar-link__section and
  // href under /docs/troubleshooting/errors/.  We match on link text vs the hash target.
  doc += `<script>\n`;
  doc += `(function () {\n`;
  doc += `  function expandCategory(hash) {\n`;
  doc += `    if (!hash || hash.length < 2) return;\n`;
  doc += `    var target = hash.slice(1).toLowerCase();\n`;
  doc += `    var links = document.querySelectorAll('a.td-sidebar-link__section[href^="/docs/troubleshooting/errors/"]');\n`;
  doc += `    for (var i = 0; i < links.length; i++) {\n`;
  doc += `      if (links[i].textContent.trim().toLowerCase() === target) {\n`;
  doc += `        var li = links[i].closest('li');\n`;
  doc += `        if (li) { var cb = li.querySelector('input[type="checkbox"]'); if (cb) cb.checked = true; }\n`;
  doc += `        break;\n`;
  doc += `      }\n`;
  doc += `    }\n`;
  doc += `  }\n`;
  doc += `  document.addEventListener('DOMContentLoaded', function () { expandCategory(window.location.hash); });\n`;
  doc += `  window.addEventListener('hashchange', function () { expandCategory(window.location.hash); });\n`;
  doc += `})();\n`;
  doc += `</script>\n`;

  return doc;
}

function generateCategoryIndexPage(category) {
  const label = CATEGORY_LABELS[category] ?? category;
  const weight = CATEGORY_WEIGHTS[category] ?? 99;
  // Hugo generates heading IDs as the lowercase label: ## Configuration → #configuration.
  const anchor = label.toLowerCase();
  const target = `/docs/troubleshooting/errors/#${anchor}`;

  let doc = '';
  doc += `---\n`;
  doc += `title: "${label}"\n`;
  doc += `linkTitle: "${label}"\n`;
  doc += `weight: ${weight}\n`;
  doc += `hide_section_index: true\n`;
  doc += `---\n\n`;
  // Raw HTML redirect — goldmark.renderer.unsafe is true in hugo.yaml.
  doc += `<script>window.location.replace("${target}");</script>\n`;
  doc += `<meta http-equiv="refresh" content='0; url=${target}'>\n`;

  return doc;
}

function generateErrorPage(error) {
  const numCode = numericCode(error.code);
  const retryableLabel = error.retryable === true ? 'Yes' : error.retryable === false ? 'No' : '—';
  const categoryLabel = CATEGORY_LABELS[error.category] ?? error.category;

  let doc = '';
  doc += `---\n`;
  doc += `title: "${error.code}"\n`;
  doc += `linkTitle: "${error.code}"\n`;
  doc += `weight: ${numCode}\n`;
  doc += `description: "${error.className} — ${categoryLabel}"\n`;
  // Alias preserves the URL that SoloError.getDocumentUrl() generates
  // (https://solo.hiero.org/docs/errors/SOLO-XXXX) even though the canonical
  // content now lives at troubleshooting/errors/{category}/SOLO-XXXX.
  doc += `aliases: ['/docs/errors/${error.code}']\n`;
  doc += `---\n\n`;
  doc += `## \`${error.className}\`\n\n`;

  doc += `| | |\n`;
  doc += `|---|---|\n`;
  doc += `| **Code** | \`${error.code}\` |\n`;
  doc += `| **Category** | ${categoryLabel} |\n`;
  doc += `| **Ownership** | ${error.ownership ?? '—'} |\n`;
  doc += `| **Retryable** | ${retryableLabel} |\n\n`;

  if (error.description) {
    doc += `## Description\n\n`;
    doc += `${error.description}\n\n`;
  }

  if (error.troubleshootingSteps.length > 0) {
    doc += `## Troubleshooting Steps\n\n`;
    for (const step of error.troubleshootingSteps) {
      doc += `1. ${step}\n`;
    }
    doc += `\n`;
  }

  return doc;
}

// ── Solo source resolution ──────────────────────────────────────────────────

/**
 * Resolves the solo version to source error classes from, without a leading 'v'.
 * Precedence: SOLO_VERSION env (explicit pin; passed by fetch-solo-cli-doc.mjs so
 * the error pages match the CLI reference version) → npm `latest`.
 */
function resolveVersion() {
  const fromEnvironment = process.env.SOLO_VERSION;
  if (fromEnvironment) {
    return fromEnvironment.replace(/^v/, '');
  }
  return execFileSync('npm', ['view', SOLO_PKG, 'version'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  }).trim();
}

/**
 * Downloads and extracts the solo source for a version from its GitHub release
 * tarball, caching it under .cache/solo-src/<version>. Returns the extracted
 * repository root, reusing the cache on subsequent runs.
 */
async function ensureReleaseSource(version) {
  const tag = `v${version}`;
  const destination = path.join(SOLO_SRC_CACHE, version);
  const marker = path.join(destination, '.extracted');

  if (fs.existsSync(marker)) {
    console.log(kleur.dim(`Using cached solo release source for ${tag}`));
    return destination;
  }

  const url = `https://github.com/hiero-ledger/solo/archive/refs/tags/${tag}.tar.gz`;
  console.log(kleur.dim(`Downloading solo release source for ${tag}...`));
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download solo source from ${url}: ${response.status} ${response.statusText}`);
  }

  fs.rmSync(destination, {recursive: true, force: true});
  fs.mkdirSync(destination, {recursive: true});
  const tarball = path.join(SOLO_SRC_CACHE, `${version}.tar.gz`);
  fs.writeFileSync(tarball, Buffer.from(await response.arrayBuffer()));

  // GitHub tarballs nest everything under a single solo-<version>/ directory;
  // --strip-components=1 lifts the repository root directly into destination.
  execFileSync('tar', ['-xzf', tarball, '-C', destination, '--strip-components=1'], {stdio: 'inherit'});
  fs.rmSync(tarball, {force: true});
  fs.writeFileSync(marker, `${tag}\n`);

  return destination;
}

/**
 * Resolves the solo source tree to read error classes from: an explicit local
 * checkout when SOLO_REPO_PATH is set, otherwise the downloaded release source so
 * the generated pages match the released solo version.
 */
async function resolveSoloSource() {
  const localPath = process.env.SOLO_REPO_PATH;
  if (localPath) {
    const resolved = path.resolve(localPath);
    console.log(kleur.dim(`Using local solo source: ${resolved}`));
    return resolved;
  }
  return ensureReleaseSource(resolveVersion());
}

// ── Main ──────────────────────────────────────────────────────────────────────

void (async function main() {
  console.log(kleur.cyan('Generating Solo error code documentation pages...'));

  SOLO_REPO = await resolveSoloSource();
  ERRORS_DIR = path.join(SOLO_REPO, 'src/core/errors/classes');
  REGISTRY_FILE = path.join(SOLO_REPO, 'src/core/errors/error-code-registry.ts');
  console.log(kleur.dim(`Solo source: ${SOLO_REPO}`));

  if (!fs.existsSync(ERRORS_DIR)) {
    console.error(kleur.red(`Error: Solo errors directory not found at ${ERRORS_DIR}`));
    console.error(kleur.red('Set SOLO_REPO_PATH to a local solo checkout, or ensure the release source is reachable.'));
    process.exit(1);
  }

  const codeMap = buildCodeMap();
  console.log(kleur.dim(`Loaded ${codeMap.size} error codes from registry`));

  const errorFiles = collectErrorFiles();
  const errors = [];

  for (const filePath of errorFiles) {
    const meta = parseErrorFile(filePath, codeMap);
    if (meta) {
      errors.push(meta);
      process.stdout.write(kleur.dim('.'));
    }
  }
  process.stdout.write('\n');

  errors.sort((a, b) => numericCode(a.code) - numericCode(b.code));
  console.log(kleur.green(`✓ Parsed ${errors.length} error classes`));

  fs.mkdirSync(OUTPUT_DIR, {recursive: true});

  // Remove stale files from previous runs:
  //   - flat SOLO-*.md files (old layout, before category subdirectories)
  //   - all category subdirectories (rebuilt below)
  for (const existing of fs.readdirSync(OUTPUT_DIR)) {
    if (/^SOLO-\d+\.md$/.test(existing)) {
      fs.unlinkSync(path.join(OUTPUT_DIR, existing));
    }
  }
  for (const category of Object.keys(CATEGORY_LABELS)) {
    const categoryDir = path.join(OUTPUT_DIR, category);
    if (fs.existsSync(categoryDir)) {
      fs.rmSync(categoryDir, {recursive: true, force: true});
    }
  }

  // Write the main index page (all categories with full tables).
  const indexPath = path.join(OUTPUT_DIR, '_index.md');
  fs.writeFileSync(indexPath, generateIndexPage(errors), 'utf8');
  console.log(kleur.green(`✓ Wrote index page → ${path.relative(projectRoot, indexPath)}`));

  // Group errors by category.
  const byCategory = new Map(Object.keys(CATEGORY_LABELS).map(k => [k, []]));
  for (const error of errors) {
    (byCategory.get(error.category) ?? []).push(error);
  }

  let written = 0;
  for (const [category, categoryErrors] of byCategory) {
    if (categoryErrors.length === 0) continue;

    const categoryDir = path.join(OUTPUT_DIR, category);
    fs.mkdirSync(categoryDir, {recursive: true});

    // Category section page — redirects to the corresponding anchor on the main errors page.
    const categoryIndexPath = path.join(categoryDir, '_index.md');
    fs.writeFileSync(categoryIndexPath, generateCategoryIndexPage(category), 'utf8');

    // Individual error pages
    for (const error of categoryErrors) {
      const pagePath = path.join(categoryDir, `${error.code}.md`);
      fs.writeFileSync(pagePath, generateErrorPage(error), 'utf8');
      written++;
    }

    console.log(
      kleur.green(
        `✓ ${CATEGORY_LABELS[category]}: ${categoryErrors.length} pages → content/en/docs/troubleshooting/errors/${category}/`,
      ),
    );
  }

  console.log(kleur.green(`✓ Wrote ${written} individual error pages total`));
  console.log(kleur.cyan('Done.'));
})();
