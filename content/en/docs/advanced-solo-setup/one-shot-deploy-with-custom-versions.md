---
title: "One-Shot Deploy with Custom Component Versions"
weight: 3
description: >
  Use the --edge flag and *_EDGE_VERSION environment variables to deploy a
  Solo network against arbitrary component versions — release candidates,
  pre-releases, or local builds — without modifying Solo source or rebuilding
  the CLI.
categories: ["Advanced"]
tags: ["advanced", "one-shot", "deployment", "versions", "edge"]
type: docs
---

## Overview

Solo's `one-shot single deploy` and `one-shot multi deploy` commands accept
an `--edge` flag that switches every component from its built-in stable
default to a separate set of "edge" versions. Each edge version is read from
an environment variable at startup, so you can pin any component to any tag
the container registry exposes — including release candidates and unreleased
builds — without editing Solo source or rebuilding the CLI.

Use this guide when you need to:

- Test a Hiero Consensus Node release candidate against the rest of the
  Solo-managed stack.
- Reproduce a specific component version combination for a bug report or
  regression test.
- Iterate on a single component (Mirror Node, Relay, Explorer, …) while the
  other components stay on stable defaults.

For the canonical list of `*_EDGE_VERSION` variables, see
[Edge Component Versions](/docs/advanced-solo-setup/using-environment-variables#edge-component-versions)
in the environment variables reference.

> **Local binary builds vs published version overrides:** `--edge` and
> `*_EDGE_VERSION` variables pin components to **published container image
> tags** — they require the image to exist in the registry. If you need to
> deploy a binary you compiled locally (before any tag or release exists), use
> `--local-build-path` instead. See
> [Deploying a Local Consensus Node Build](/docs/using-solo/local-builds).

---

## How It Works

```text
*_EDGE_VERSION env var (e.g. CONSENSUS_NODE_EDGE_VERSION)
      │
      ▼
solo one-shot ... deploy --edge
      │
      ▼
Each component is pinned to its edge version for this deploy.
Components without an explicit override fall back to the compiled-in
edge defaults, which themselves fall back to the stable defaults.
```

- Without `--edge`, Solo uses the stable defaults compiled into the CLI.
- With `--edge`, Solo reads the `*_EDGE_VERSION` constants — and any matching
  environment variable you set in the shell overrides those constants.

You only need to set variables for the components you want to override. All
others fall back to their compiled-in defaults.

> **Image cache:** Because you pin versions with environment variables, Solo's
> [image cache](/docs/advanced-solo-setup/image-cache) pulls the matching image
> versions automatically. Pinning a version with a `--*-version` CLI flag (or in
> `solo.config.yaml`) instead does **not** update the cache — it would pull the
> default versions and cause a cache miss on first deploy. Use the environment
> variables shown here to keep the cache aligned with the deployed versions.

---

## Quick Start

Deploy a single-node network with a custom Consensus Node release candidate:

```bash
CONSENSUS_NODE_EDGE_VERSION=v0.74.0-rc.1 \
solo one-shot single deploy --edge --dev
```

What this does:

- `CONSENSUS_NODE_EDGE_VERSION=v0.74.0-rc.1` overrides the consensus node
  version for this command invocation.
- `--edge` tells Solo to read `*_EDGE_VERSION` variables instead of stable
  defaults.
- `--dev` enables Solo's developer mode — appropriate for local development,
  not for production-shaped deployments.
- Mirror Node, Relay, Explorer, Block Node, and the Solo chart keep their
  compiled-in edge defaults because no `*_EDGE_VERSION` was set for them.

> **Note:** If you already have a running `one-shot` deployment and want to
> keep it, the command above fails with
> *"A deployment named one-shot already exists"* because `one-shot` is the
> default deployment name. Pass `--deployment <name> --namespace <name>` to
> deploy the edge build alongside the existing one:
>
> ```bash
> CONSENSUS_NODE_EDGE_VERSION=v0.74.0-rc.1 \
> solo one-shot single deploy --edge --dev \
>   --deployment one-shot-edge --namespace one-shot-edge
> ```
>
> Every `solo one-shot` deploy overwrites `~/.solo/cache/last-one-shot-deployment.txt`
> with its own deployment name. After this command, the cache file points at
> `one-shot-edge`, not the original `one-shot`. Pass `--deployment` explicitly
> when running follow-up commands against a specific deployment.

---

## Where to Find Version Tags

Each `*_EDGE_VERSION` value is a published release tag from the component's
GitHub release page. Pick a tag from the appropriate page below, and match
the format the component publishes — a missing or extra `v` prefix is the
most common cause of image-pull failures.

| Component       | Release tags                                                                                          | Format                            | Example         |
| --------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------- | --------------- |
| Consensus Node  | [hiero-consensus-node](https://github.com/hiero-ledger/hiero-consensus-node/releases)                 | `vMAJOR.MINOR.PATCH[-qualifier]`  | `v0.74.0-rc.1`  |
| Mirror Node     | [hiero-mirror-node](https://github.com/hiero-ledger/hiero-mirror-node/releases)                       | `vMAJOR.MINOR.PATCH`              | `v0.153.1`      |
| JSON-RPC Relay  | [hiero-json-rpc-relay](https://github.com/hiero-ledger/hiero-json-rpc-relay/releases)                 | `MAJOR.MINOR.PATCH`               | `0.77.0`        |
| Explorer        | [hiero-mirror-node-explorer](https://github.com/hiero-ledger/hiero-mirror-node-explorer/releases)     | `MAJOR.MINOR.PATCH`               | `27.0.0`        |
| Block Node      | [hiero-block-node](https://github.com/hiero-ledger/hiero-block-node/releases)                         | `vMAJOR.MINOR.PATCH[-qualifier]`  | `v0.32.0`       |
| Solo Chart      | [hashgraph/solo-charts](https://github.com/hashgraph/solo-charts/releases)                            | `MAJOR.MINOR.PATCH`               | `0.64.0`        |

> **Note:** Consensus Node, Mirror Node, and Block Node tags are prefixed
> with `v`; Relay, Explorer, and Solo Chart tags are not. The tag must exist
> in the component's container registry, otherwise the deploy fails with an
> image-pull error — see [Troubleshooting](#troubleshooting).

---

## Command Reference

In Solo v0.72.0, `--edge` is accepted by the `single` and `multi` one-shot
deploy variants. `solo one-shot falcon deploy` does **not** currently accept
`--edge` — use one of the two variants below to test custom component
versions.

### Single-node deploy

```bash
CONSENSUS_NODE_EDGE_VERSION=<version> \
MIRROR_NODE_EDGE_VERSION=<version> \
solo one-shot single deploy --edge [--dev] [other flags]
```

### Multi-node deploy

```bash
CONSENSUS_NODE_EDGE_VERSION=<version> \
MIRROR_NODE_EDGE_VERSION=<version> \
solo one-shot multi deploy --edge --num-consensus-nodes 3 [--dev] [other flags]
```

---

## Examples

### Override Consensus Node and Mirror Node

```bash
CONSENSUS_NODE_EDGE_VERSION=v0.73.0 \
MIRROR_NODE_EDGE_VERSION=v0.153.1 \
solo one-shot single deploy --edge --dev
```

### Override every component

```bash
CONSENSUS_NODE_EDGE_VERSION=v0.73.0 \
MIRROR_NODE_EDGE_VERSION=v0.153.1 \
RELAY_EDGE_VERSION=0.77.0 \
EXPLORER_EDGE_VERSION=27.0.0 \
BLOCK_NODE_EDGE_VERSION=v0.32.0 \
SOLO_CHART_EDGE_VERSION=0.64.0 \
solo one-shot single deploy --edge --dev
```

### Export once, reuse across a development session

If you are iterating and running deploy/destroy/deploy cycles, export the
variables so every `one-shot` command in the shell session picks them up:

```bash
export CONSENSUS_NODE_EDGE_VERSION=v0.74.0-rc.1
export MIRROR_NODE_EDGE_VERSION=v0.153.1

solo one-shot single deploy --edge --dev

# Destroy and redeploy without re-typing the variables
solo one-shot single destroy
solo one-shot single deploy --edge --dev
```

---

## Verifying the Versions in Use

After the deploy starts, confirm the resolved versions in the structured Solo
log:

```bash
tail -f $HOME/.solo/logs/solo.ndjson | jq '.msg, .version // empty'
```

> **Note:** Use `solo.ndjson` (newline-delimited JSON, machine-readable) for
> `jq` pipes. The companion `solo.log` is pino-pretty formatted text and will
> not parse as JSON.

Inspect the deployed Helm releases and their chart versions:

```bash
helm list -A
helm get values <release-name> -n <namespace>
```

Confirm the consensus node container image tag:

```bash
kubectl get pods -n <namespace> -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].image}{"\n"}{end}'
```

Replace `<namespace>` with your deployment namespace (default `one-shot` —
see [Find your deployment namespace](/docs/simple-solo-setup/managing-your-network#viewing-logs)).

---

## Without `--edge`

Omitting `--edge` uses the stable defaults compiled into the Solo CLI you are
running — any `*_EDGE_VERSION` variables you have set are ignored for that
invocation.

```bash
# Stable defaults — *_EDGE_VERSION variables are ignored.
solo one-shot single deploy --dev
```

If you want to pin versions without using `--edge` (for example, to test a
specific stable release of one component), see
[Pinning Component Versions](/docs/advanced-solo-setup/using-environment-variables#pinning-component-versions)
in the environment variables reference.

---

## Troubleshooting

**The version I set is not being used.**

Confirm you passed `--edge`. Without it, Solo ignores every `*_EDGE_VERSION`
variable and uses the compiled-in stable defaults.

**Solo is ignoring my environment variable.**

The variable must be exported in (or prefixed to) the same shell process that
runs Solo. Verify with:

```bash
echo $CONSENSUS_NODE_EDGE_VERSION   # should print your value
```

If you set the variable inline (`FOO=bar solo ...`), double-check the variable
name is spelled exactly as listed in
[Edge Component Versions](/docs/advanced-solo-setup/using-environment-variables#edge-component-versions)
— the names are case-sensitive.

**The deploy fails with an image-pull error.**

The tag you supplied does not exist in the component's container registry, or
the format is wrong (missing `v` prefix, extra spaces, …). Cross-check the tag
against the official release list for that component before retrying.

**The deploy starts but a component crashes immediately.**

Different component versions are not guaranteed to be mutually compatible.
When mixing edge versions, prefer combinations Solo's CI already exercises
(see the [Version Compatibility Reference](/docs/simple-solo-setup/system-readiness#version-compatibility-reference)).
