---
title: "One-Shot Deploy with Custom Component Versions"
weight: 3
description: >
  Use the one-shot version flags, or the --edge flag, to deploy a Solo network
  against component versions other than the defaults — release candidates,
  newer stable releases, or specific older tags — without modifying Solo
  source or rebuilding the CLI.
categories: ["Advanced"]
tags: ["advanced", "one-shot", "deployment", "versions", "edge"]
type: docs
icon: "fas fa-layer-group"
---

## Overview

Solo's `one-shot single deploy`, `one-shot multi deploy`, and
`one-shot falcon deploy` commands each deploy a fixed set of default component
versions compiled into the CLI. You can change those versions in two ways:

- **Version flags** pin one component to an exact published tag, such as a
  release candidate: `--consensus-node-version`, `--mirror-node-version`,
  `--relay-version`, `--explorer-version`, and `--block-node-version`.
- **`--edge`** moves every component to its newest stable release at once.

Use this guide when you need to:

- Test a Hiero Consensus Node release candidate against the rest of the
  Solo-managed stack.
- Reproduce a specific component version combination for a bug report or
  regression test.
- Try the newest stable release of every component before Solo adopts them as
  defaults.

> **Local binary builds vs published version overrides:** version flags and
> `--edge` pin components to **published container image tags** — the image
> must exist in the registry. If you need to deploy a binary you compiled
> locally (before any tag or release exists), use `--local-build-path`
> instead.

---

## How It Works

For each component, Solo uses the first version it finds in this order:

1. The component's version flag, for example
   `--consensus-node-version v0.74.0-rc.1`.
2. A version set in a `solo.config.yaml` or `solo.config.json` file in the
   current directory or one of its parents, for example
   `consensus-node-version: v0.74.0-rc.1` (YAML) or
   `{"consensusNodeVersion": "v0.74.0-rc.1"}` (JSON).
3. With `--edge`: the newest stable release of the component.
   Without `--edge`: Solo's default version, which the `*_VERSION`
   environment variables (for example `CONSENSUS_NODE_VERSION`) can override.

With `--edge`, Solo looks up the latest stable (non-pre-release) GitHub release
of the consensus node, mirror node, Explorer, JSON-RPC relay, and block node.
The `*_EDGE_VERSION` environment variables (for example
`CONSENSUS_NODE_EDGE_VERSION`) are used **only as a fallback** when that lookup
fails, for example when GitHub is unreachable or rate-limits the request. To
pin an exact version, such as a release candidate, use a version flag rather
than a `*_EDGE_VERSION` variable. The Solo chart is the exception: with
`--edge`, Solo uses `SOLO_CHART_EDGE_VERSION` if it is set, otherwise the
default Solo chart version.

> **Image cache:** Solo's [image cache](/docs/advanced-solo-setup/image-cache)
> holds only the default component versions of your Solo release. A component
> pinned to another version is not cached; the cluster pulls its image from the
> registry during the deploy, so the first deploy with a new version takes
> longer.

---

## Quick Start

Deploy a single-node network with a Consensus Node release candidate:

```bash
solo one-shot single deploy --consensus-node-version v0.74.0-rc.1 --debug
```

What this does:

- `--consensus-node-version v0.74.0-rc.1` pins the consensus node to that tag.
- `--debug` enables Solo's debug mode — appropriate for local development,
  not for production-shaped deployments.
- Mirror Node, Relay, Explorer, Block Node, and the Solo chart keep their
  default versions.

Deploy with the newest stable release of every component instead:

```bash
solo one-shot single deploy --edge --debug
```

> **Note:** Every successive `solo one-shot single deploy` command will remove the
> existing components and will create a new deployment.

> **Deprecated:** The `--dev` flag has been renamed to `--debug`. `--dev` still
> works as an alias but is deprecated and prints a warning; update your scripts
> to use `--debug`. The `--dev` alias will no longer be supported once Solo
> `0.82.0` reaches its end of support date.
---

## Where to Find Version Tags

Each version you pass is a published release tag from the component's
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
| Solo Chart      | [hiero-ledger/solo-charts](https://github.com/hiero-ledger/solo-charts/releases)                      | `MAJOR.MINOR.PATCH`               | `0.64.0`        |

> **Note:** Consensus Node, Mirror Node, and Block Node tags are prefixed
> with `v`; Relay, Explorer, and Solo Chart tags are not. The tag must exist
> in the component's container registry, otherwise the deploy fails with an
> image-pull error — see [Troubleshooting](#troubleshooting).

---

## Command Reference

All three one-shot deploy variants accept the version flags and `--edge`.
Solo chart versions have no one-shot flag; set `SOLO_CHART_VERSION` (or, with
`--edge`, `SOLO_CHART_EDGE_VERSION`) instead.

### Single-node deploy

```bash
solo one-shot single deploy \
  --consensus-node-version <version> \
  --mirror-node-version <version> \
  [--edge] [--debug] [other flags]
```

### Multi-node deploy

```bash
solo one-shot multi deploy --num-consensus-nodes 3 \
  --consensus-node-version <version> \
  --mirror-node-version <version> \
  [--edge] [--debug] [other flags]
```

### Falcon deploy

```bash
solo one-shot falcon deploy --values-file falcon-values.yaml \
  --consensus-node-version <version> \
  [--edge] [other flags]
```

---

## Examples

### Override Consensus Node and Mirror Node

```bash
solo one-shot single deploy \
  --consensus-node-version v0.73.0 \
  --mirror-node-version v0.153.1 \
  --debug
```

### Override every component

```bash
SOLO_CHART_VERSION=0.64.0 \
solo one-shot single deploy \
  --consensus-node-version v0.73.0 \
  --mirror-node-version v0.153.1 \
  --relay-version 0.77.0 \
  --explorer-version 27.0.0 \
  --block-node-version v0.32.0 \
  --debug
```

### Newest stable releases, with one component pinned

Explicit version flags win over `--edge`, so you can move everything to the
newest stable release while holding one component at a known tag:

```bash
solo one-shot single deploy --edge --mirror-node-version v0.153.1 --debug
```

### Reuse versions across a development session

If you are iterating and running deploy/destroy/deploy cycles, put the versions
in a `solo.config.yaml` in your working directory so every `one-shot` deploy run
from there picks them up:

```yaml
consensus-node-version: v0.74.0-rc.1
mirror-node-version: v0.153.1
```

```bash
solo one-shot single deploy --debug

# Destroy and redeploy without re-typing the versions
solo one-shot single destroy
solo one-shot single deploy --debug
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

Omitting `--edge` uses the default versions compiled into the Solo CLI you are
running, unless a version flag, a `solo.config.yaml`/`solo.config.json` file, or
a `*_VERSION` environment variable overrides them. Any `*_EDGE_VERSION`
variables you have set are ignored.

```bash
# Default versions
solo one-shot single deploy --debug
```

For the `*_VERSION` environment variables, see
[Component Versions](/docs/advanced-solo-setup/using-environment-variables#component-versions)
in the environment variables reference.

---

## Troubleshooting

**The version I set is not being used.**

- If you set a `*_EDGE_VERSION` variable: with `--edge`, Solo uses the newest
  stable GitHub release and reads `*_EDGE_VERSION` only when that lookup fails.
  Pass the version with the component's version flag instead.
- If you set a `*_VERSION` variable together with `--edge`: `--edge` replaces
  the defaults, so the variable is not used. Use the version flag, or drop
  `--edge`.
- A `solo.config.yaml` or `solo.config.json` in the current directory or a
  parent directory takes precedence over environment variables and `--edge`.
  Check for one if versions change unexpectedly.

**The deploy fails with an image-pull error.**

The tag you supplied does not exist in the component's container registry, or
the format is wrong (missing `v` prefix, extra spaces, …). Cross-check the tag
against the official release list for that component before retrying.

**The deploy starts but a component crashes immediately.**

Different component versions are not guaranteed to be mutually compatible.
When mixing edge versions, prefer combinations Solo's CI already exercises
(see the [Version Compatibility Reference](/docs/simple-solo-setup/system-readiness#version-compatibility-reference)).
