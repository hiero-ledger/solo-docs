// SPDX-License-Identifier: Apache-2.0
'use strict';

/**
 * @file updateDocs.mjs
 *
 * Runs the full Solo CLI lifecycle against a local Kind (Kubernetes-in-Docker)
 * cluster, captures the terminal output of every command, and uses that output
 * to render Markdown documentation pages from template files.
 *
 * This is the core of the documentation pipeline. executeUpdateDocs.mjs is a
 * thin wrapper around the single exported `update()` function defined here.
 *
 * What `update()` does, in order:
 *
 *  Phase 1 - Environment setup
 *    • Resolve the project root from the script's own location.
 *    • Set up path constants for templates, build output, and content targets.
 *    • Read an optional consensus-node version from the command-line argument.
 *    • Set Solo environment variables (cluster name, namespace, deployment).
 *
 *  Phase 2 - Cluster provisioning
 *    • Delete any leftover Kind cluster with the same name.
 *    • Clear the Solo cache and local config so this run starts clean.
 *    • Create a fresh Kind cluster.
 *
 *  Phase 3 - Solo deployment walkthrough
 *    Each step calls `runAndSave()` which:
 *      a) Runs the Solo CLI command and streams output to the terminal.
 *      b) Saves the output to a log file under build/.
 *      c) Stores the output in a process.env variable for template substitution.
 *    Steps performed:
 *      solo init → cluster-ref connect → deployment create/attach →
 *      key generation → cluster setup → block-node add → network deploy →
 *      node setup/start → mirror-node add → explorer add → relay add
 *    Then the reverse teardown:
 *      relay destroy → mirror-node destroy → explorer destroy →
 *      block-node destroy → network destroy
 *
 *  Phase 4 - Markdown generation
 *    • Read the step-by-step-guide and advanced-deployments Markdown templates.
 *    • Apply `envsubst()` to replace every `$ENV_VAR` placeholder with the
 *      captured command output stored in process.env.
 *    • Write the rendered files to content/en/docs/.
 *    • Build and render the examples index page from its template.
 *    • Strip ANSI colour codes and special CLI symbols (e.g. ↓ ❯ •) so the
 *      Markdown renders cleanly in a browser.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { run, runAndSave, envsubst } from './utilities.mjs';
import kleur from 'kleur';

export async function update () {
  // Resolve the directory this script lives in, then go three levels up to the
  // repository root so all subsequent relative paths start from a known anchor.
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // scripts/ is one level inside the solo-docs repo root, so one ".." suffices.
  const projectRoot = path.resolve(__dirname, "../");
  process.chdir(projectRoot);

  // ── Path constants ────────────────────────────────────────────────────────────
  // Where generated Markdown pages land (served by Hugo).
  // In solo-docs the Hugo content lives at the repo root, not under docs/site/.
  const TARGET_DIR = 'content/en';
  const TARGET_DIR_DOCS = 'content/en/docs';
  // Where the Markdown templates live (contain $VARIABLE placeholders).
  const TEMPLATE_DIR = 'content/en/templates';
  // Final output path for the step-by-step guide page.
  const TARGET_FILE = `${TARGET_DIR_DOCS}/step-by-step-guide.md`;
  const TEMPLATE_FILE = `${TEMPLATE_DIR}/step-by-step-guide.template.md`;
  // Final output path for the advanced deployments page.
  const TARGET_ADVANCED_FILE = `${TARGET_DIR_DOCS}/advanced-deployments.md`;
  const TEMPLATE_ADVANCED_FILE = `${TEMPLATE_DIR}/advanced-deployments.template.md`;
  // Template for the examples index page.
  const TEMPLATE_EXAMPLES_FILE = `${TEMPLATE_DIR}/examples-index.template.md`;
  // Intermediate build directory where per-command log files are written.
  const BUILD_DIR = 'build';
  // Source of the examples README that gets embedded into the examples page.
  // In CI the workflow sets SOLO_SOURCE_DIR to the checked-out solo repo path.
  // Locally, set the env var to your cloned solo repo; defaults to a sibling dir.
  const SOLO_SOURCE_DIR = process.env.SOLO_SOURCE_DIR
    ? path.resolve(process.env.SOLO_SOURCE_DIR)
    : path.resolve(projectRoot, '../solo');
  const EXAMPLES_DIR = path.join(SOLO_SOURCE_DIR, 'examples');

  // Create the build directory if it doesn't exist yet (recursive is safe
  // even if parts of the path already exist).
  mkdirSync(BUILD_DIR, { recursive: true });

  // Allow callers to pass a specific Hiero consensus-node release tag as the
  // first CLI argument.  A minimum of v0.62.6 is required for block-node
  // commands to work.  Falls back to a known-good version.
  const CONSENSUS_NODE_VERSION = process.argv[2] || 'v0.66.0';
  // Build the flag string once; individual `solo` commands append it where needed.
  const CONSENSUS_NODE_FLAG = CONSENSUS_NODE_VERSION ? `--release-tag ${CONSENSUS_NODE_VERSION}` : '';

  // ── Environment variables used by Solo commands ───────────────────────────
  // These are set once and reused by every subsequent `solo` invocation below.
  // They are also available as template placeholders via envsubst().
  process.env.SOLO_CLUSTER_NAME = 'solo';
  process.env.SOLO_NAMESPACE = 'solo';
  process.env.SOLO_CLUSTER_SETUP_NAMESPACE = 'solo-cluster';
  process.env.SOLO_DEPLOYMENT = 'solo-deployment';

  // ── Phase 2: Clean slate ─────────────────────────────────────────────────────
  // Delete any pre-existing Kind cluster with our name so we start fresh.
  // The `|| true` prevents the script from failing if no cluster exists yet.
  await run(`kind delete cluster -n ${process.env.SOLO_CLUSTER_NAME} || true`);
  // Remove the Solo disk cache and the local config file so this run isn't
  // polluted by state from previous runs.
  await run(`rm -Rf ~/.solo/cache || true`);
  await run(`rm ~/.solo/local-config.yaml || true`);

  // ── Phase 3: Solo deployment walkthrough ───────────────────────────────────
  // Each runAndSave() call:
  //   1. Runs the command and streams its output to the terminal.
  //   2. Writes the output to the named log file (useful in CI artifacts).
  //   3. Stores the output in process.env under the given key so Markdown
  //      templates can reference it as $KEY.

  // Create a brand-new Kind cluster to host the deployment.
  await runAndSave(
    `kind create cluster -n ${process.env.SOLO_CLUSTER_NAME}`,
    'KIND_CREATE_CLUSTER_OUTPUT',
    `${BUILD_DIR}/create-cluster.log`,
  );

  // Initialize Solo's local environment (creates config directories, etc.).
  await runAndSave(`solo init`, 'SOLO_INIT_OUTPUT', `${BUILD_DIR}/init.log`);

  // Register the Kind cluster as a named cluster-ref so Solo knows how to
  // talk to it via the corresponding kubeconfig context.
  await runAndSave(
    `solo cluster-ref config connect --cluster-ref kind-${process.env.SOLO_CLUSTER_NAME} --context kind-${process.env.SOLO_CLUSTER_NAME}`,
    'SOLO_CLUSTER_REF_CONNECT_OUTPUT',
    `${BUILD_DIR}/cluster-ref-connect.log`,
  );

  // Create a logical deployment record that groups the namespace and all
  // components (consensus nodes, mirror node, etc.) under one name.
  await runAndSave(
    `solo deployment config create -n ${process.env.SOLO_NAMESPACE} --deployment ${process.env.SOLO_DEPLOYMENT}`,
    'SOLO_DEPLOYMENT_CREATE_OUTPUT',
    `${BUILD_DIR}/deployment-create.log`,
  );

  // Associate the Kind cluster with the deployment and request 1 consensus node.
  await runAndSave(
    `solo deployment cluster attach --deployment ${process.env.SOLO_DEPLOYMENT} --cluster-ref kind-${process.env.SOLO_CLUSTER_NAME} --num-consensus-nodes 1`,
    'SOLO_DEPLOYMENT_ADD_CLUSTER_OUTPUT',
    `${BUILD_DIR}/deployment-attach.log`,
  );

  // Generate the cryptographic keys (gossip + TLS) that the consensus node
  // needs to participate in the network.
  await runAndSave(
    `solo keys consensus generate --gossip-keys --tls-keys --deployment ${process.env.SOLO_DEPLOYMENT}`,
    'SOLO_NODE_KEY_PEM_OUTPUT',
    `${BUILD_DIR}/keys.log`,
  );

  // Install cluster-wide infrastructure (e.g. cert-manager, ingress) into the
  // dedicated setup namespace.
  await runAndSave(
    `solo cluster-ref config setup -s ${process.env.SOLO_CLUSTER_SETUP_NAMESPACE}`,
    'SOLO_CLUSTER_SETUP_OUTPUT',
    `${BUILD_DIR}/cluster-setup.log`,
  );

  // Deploy the Block Node service alongside the consensus node.  The release
  // tag pins the Hiero platform version to use.
  await runAndSave(
    `solo block node add --deployment ${process.env.SOLO_DEPLOYMENT} --cluster-ref kind-${process.env.SOLO_CLUSTER_NAME} ${CONSENSUS_NODE_FLAG}`,
    'SOLO_BLOCK_NODE_ADD_OUTPUT',
    `${BUILD_DIR}/block-node-add.log`,
  );

  // Roll out the consensus network (Kubernetes resources, config maps, etc.).
  await runAndSave(
    `solo consensus network deploy --deployment ${process.env.SOLO_DEPLOYMENT} ${CONSENSUS_NODE_FLAG}`,
    'SOLO_NETWORK_DEPLOY_OUTPUT',
    `${BUILD_DIR}/network-deploy.log`,
  );

  // Run one-time node setup tasks (e.g. uploading config to the node pod).
  await runAndSave(
    `solo consensus node setup --deployment ${process.env.SOLO_DEPLOYMENT} ${CONSENSUS_NODE_FLAG}`,
    'SOLO_NODE_SETUP_OUTPUT',
    `${BUILD_DIR}/node-setup.log`,
  );

  // Start the consensus node process inside its pod.
  await runAndSave(
    `solo consensus node start --deployment ${process.env.SOLO_DEPLOYMENT}`,
    'SOLO_NODE_START_OUTPUT',
    `${BUILD_DIR}/node-start.log`,
  );

  // Add the Hiero Mirror Node (indexes transactions and exposes a REST API).
  // --enable-ingress makes it reachable from outside the cluster.
  // -q suppresses non-essential output.
  await runAndSave(
    `solo mirror node add --deployment ${process.env.SOLO_DEPLOYMENT} --cluster-ref kind-${process.env.SOLO_CLUSTER_NAME} --enable-ingress -q`,
    'SOLO_MIRROR_NODE_DEPLOY_OUTPUT',
    `${BUILD_DIR}/mirror-node-add.log`,
  );

  // Add the Hiero Explorer UI (a web dashboard for the network).
  await runAndSave(
    `solo explorer node add --deployment ${process.env.SOLO_DEPLOYMENT} --cluster-ref kind-${process.env.SOLO_CLUSTER_NAME} -q`,
    'SOLO_EXPLORER_DEPLOY_OUTPUT',
    `${BUILD_DIR}/explorer-add.log`,
  );

  // Add a JSON-RPC relay node (bridges EVM/Ethereum tooling to the Hiero network).
  // -i node1 specifies which consensus node to pair it with.
  await runAndSave(
    `solo relay node add -i node1 --deployment ${process.env.SOLO_DEPLOYMENT} --cluster-ref kind-${process.env.SOLO_CLUSTER_NAME}`,
    'SOLO_RELAY_DEPLOY_OUTPUT',
    `${BUILD_DIR}/relay-add.log`,
  );

  // ── Teardown (reverse order of creation) ─────────────────────────────────────
  // Each destroy/destroy step is also captured so templates can optionally
  // show teardown output in the docs.

  await runAndSave(
    `solo relay node destroy -i node1 --deployment ${process.env.SOLO_DEPLOYMENT} --cluster-ref kind-${process.env.SOLO_CLUSTER_NAME}`,
    'SOLO_RELAY_DESTROY_OUTPUT',
    `${BUILD_DIR}/relay-destroy.log`,
  );

  await runAndSave(
    `solo mirror node destroy --deployment ${process.env.SOLO_DEPLOYMENT} --force -q`,
    'SOLO_MIRROR_NODE_DESTROY_OUTPUT',
    `${BUILD_DIR}/mirror-node-destroy.log`,
  );

  await runAndSave(
    `solo explorer node destroy --deployment ${process.env.SOLO_DEPLOYMENT} --force -q`,
    'SOLO_EXPLORER_DESTROY_OUTPUT',
    `${BUILD_DIR}/explorer-destroy.log`,
  );

  await runAndSave(
    `solo block node destroy --deployment ${process.env.SOLO_DEPLOYMENT} --cluster-ref kind-${process.env.SOLO_CLUSTER_NAME}`,
    'SOLO_BLOCK_NODE_DESTROY_OUTPUT',
    `${BUILD_DIR}/block-node-destroy.log`,
  );

  // Destroy the entire consensus network last (it depends on - and should
  // outlive - all the add-on components removed above).
  await runAndSave(
    `solo consensus network destroy --deployment ${process.env.SOLO_DEPLOYMENT} --force -q`,
    'SOLO_NETWORK_DESTROY_OUTPUT',
    `${BUILD_DIR}/network-destroy.log`,
  );

  // ── Phase 4: Markdown file generation ───────────────────────────────────────────
  // At this point, every Solo command's output is stored in process.env as
  // variables like SOLO_INIT_OUTPUT, SOLO_NETWORK_DEPLOY_OUTPUT, etc.
  // envsubst() replaces $VARIABLE placeholders in the template files with the
  // real captured output so maintainers don't have to manually copy-paste
  // terminal output into the documentation.

  console.log(kleur.cyan(`Generating ${TARGET_FILE} from ${TEMPLATE_FILE}`));

  // Read the template, substitute all captured env vars, and write the final page.
  const templateContent = readFileSync(TEMPLATE_FILE, 'utf8');
  const substituted = envsubst(templateContent, process.env);
  writeFileSync(TARGET_FILE, substituted);

  console.log(kleur.cyan(`Generating ${TARGET_ADVANCED_FILE} from ${TEMPLATE_ADVANCED_FILE}`));

  // Same template-substitution flow for the advanced deployments page.
  const advancedTemplateContent = readFileSync(TEMPLATE_ADVANCED_FILE, 'utf8');
  const advancedSubstituted = envsubst(advancedTemplateContent, process.env);
  writeFileSync(TARGET_ADVANCED_FILE, advancedSubstituted);

  // Read the examples README and store its full text so the examples template
  // can embed it verbatim via $EXAMPLES_CONTENT.
  console.log(kleur.cyan('Extracting content from examples README'));
  process.env.EXAMPLES_CONTENT = readFileSync(`${EXAMPLES_DIR}/README.md`, 'utf8');

  // Ensure the Hugo examples section directory exists before writing into it.
  mkdirSync(`${TARGET_DIR}/examples`, { recursive: true });

  // Render and write the examples index page.
  const examplesTemplate = readFileSync(TEMPLATE_EXAMPLES_FILE, 'utf8');
  const examplesPage = envsubst(examplesTemplate, process.env);
  writeFileSync(`${TARGET_DIR}/examples/_index.md`, examplesPage);

  // ── Cleanup: strip terminal artefacts from the generated files ──────────────
  // The captured command output may contain ANSI colour escape codes (e.g.
  // \[32m for green, \[33m for yellow, \[39m to reset) and special spinner
  // symbols (↓ ❯ •) produced by the Solo CLI's interactive prompts.  These
  // are fine in a terminal but render as garbage in a browser, so we strip
  // them before finalising the files.
  console.log(kleur.cyan('Remove color codes and symbols from target files'));

  let cleaned = readFileSync(TARGET_FILE, 'utf8');
  cleaned = cleaned
    .replace(/\[32m|\[33m|\[39m/g, '') // remove ANSI colour escape suffixes
    .replace(/[↓❯•]/g, '');            // remove Solo CLI spinner/arrow symbols
  writeFileSync(TARGET_FILE, cleaned);

  let advancedCleaned = readFileSync(TARGET_ADVANCED_FILE, 'utf8');
  advancedCleaned = advancedCleaned
    .replace(/\[32m|\[33m|\[39m/g, '')
    .replace(/[↓❯•]/g, '');
  writeFileSync(TARGET_ADVANCED_FILE, advancedCleaned);

  console.log(kleur.cyan('✅ Script finished'));
}
