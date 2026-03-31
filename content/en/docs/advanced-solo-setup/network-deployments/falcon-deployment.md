---
title: "Falcon Deployment"
description: >
  Deploy a complete Solo network from a single YAML file for repeatable advanced setups,
  CI pipelines, and custom component configuration. Falcon combines simplicity with
  full customization using the Solo values file format.
categories: ["Advanced", "Deployment"]
tags: ["advanced", "operator", "falcon", "deployment"]
weight: 1
type: docs
---

## Overview

Falcon deployment is Solo's YAML-driven one-shot workflow. It uses the same core
deployment pipeline as `solo one-shot single deploy`, but lets you inject
component-specific flags through a single values file.

Use Falcon deployment when you need a repeatable advanced setup, want to check a
complete deployment into source control, or need to customise component flags
without running every Solo command manually.

Falcon is especially useful for:

- CI/CD pipelines and automated test environments.
- Reproducible local developer setups.
- Advanced deployments that need custom chart paths, image versions, ingress,
  storage, TLS, or node startup options.

> **Important:** Falcon is an orchestration layer over Solo's standard commands.
> It does not introduce a separate deployment model. Solo still creates a
> deployment, attaches clusters, deploys the network, configures nodes, and then
> adds optional components such as mirror node, explorer, and relay.

## Prerequisites

Before proceeding, ensure you have completed the following:

- [**System Readiness**](/docs/simple-solo-setup/system-readiness) -your local environment
  meets the hardware and software requirements for Solo, Kubernetes, Docker,
  Kind, kubectl, and Helm.
- [**Quickstart**](/docs/simple-solo-setup/quickstart) -you are already familiar with the
  standard one-shot deployment workflow.
- Set your environment variables if you have not already done so:

  ```bash
  export SOLO_CLUSTER_NAME=solo
  export SOLO_NAMESPACE=solo
  export SOLO_CLUSTER_SETUP_NAMESPACE=solo-cluster
  export SOLO_DEPLOYMENT=solo-deployment
  ```

## How Falcon Works

When you run Falcon deployment, Solo executes the same end-to-end deployment
sequence used by its one-shot workflows:

1. Connect to the Kubernetes cluster.
2. Create a deployment and attach the cluster reference.
3. Set up shared cluster components.
4. Generate gossip and TLS keys.
5. Deploy the consensus network and, if enabled, the block node (in parallel).
6. Set up and start consensus nodes.
7. Optionally, deploy mirror node, explorer, and relay in parallel for faster
   startup.
8. Create predefined test accounts.
9. Write deployment notes, versions, port-forward details, and account data to a
   local output directory.

The difference is that Falcon reads a YAML file and maps its top-level sections
to the underlying Solo subcommands.

| Values file section | Solo subcommand invoked |
| ------------------- | ----------------------- |
| `network` | `solo consensus network deploy` |
| `setup` | `solo consensus node setup` |
| `consensusNode` | `solo consensus node start` |
| `mirrorNode` | `solo mirror node add` |
| `explorerNode` | `solo explorer node add` |
| `relayNode` | `solo relay node add` |
| `blockNode` | `solo block node add` (when `ONE_SHOT_WITH_BLOCK_NODE=true`) |

For the full list of supported CLI flags per section, see the
[**Falcon Values File Reference**](/docs/advanced-solo-setup/advanced-network-deployments/falcon-flags-reference).

## Create a Falcon Values File

Create a YAML file to control every component of your Solo deployment. The file can have any name -`falcon-values.yaml` is used throughout this guide as a convention.

> **Note:** Keys within each section must be the full CLI flag name including the `--` prefix - for example, `--release-tag`, not `release-tag` or `-r`. Any section you omit
> from the file is skipped, and Solo uses the built-in defaults for that component.

### Example: Single-Node Falcon Deployment

The following `falcon-values.yaml` example deploys a standard single-node network with mirror node,
explorer, and relay enabled:

```yaml
network:
  --release-tag: "v0.71.0"
  --pvcs: false

setup:
  --release-tag: "v0.71.0"

consensusNode:
  --force-port-forward: true

mirrorNode:
  --enable-ingress: true
  --pinger: true
  --force-port-forward: true

explorerNode:
  --enable-ingress: true
  --force-port-forward: true

relayNode:
  --node-aliases: "node1"
  --force-port-forward: true
```

## Deploy with Falcon one-shot

Run Falcon deployment by pointing Solo at the values file:

```bash
solo one-shot falcon deploy --values-file falcon-values.yaml
```

Solo creates a one-shot deployment, applies the values from the YAML file to the
appropriate subcommands, and then deploys the full environment.

### What Falcon Does Not Read from the File

Some Falcon settings are controlled directly by the top-level command flags,
not by section entries in the values file:

- `--values-file` selects the YAML file to load.
- `--deploy-mirror-node`, `--deploy-explorer`, and `--deploy-relay` control
  whether those optional components are deployed at all.
- `--deployment`, `--namespace`, `--cluster-ref`, and `--num-consensus-nodes`
  are top-level one-shot inputs.

> **Important:** Do not rely on `--deployment` inside `falcon-values.yaml`.
> Solo intentionally ignores `--deployment` values from section content during
> Falcon argument expansion. Set the deployment name on the command line if you
> need a specific name.

<br/>

> **Tip:** When not specified, Falcon uses these defaults: `--deployment one-shot`,
> `--namespace one-shot`, `--cluster-ref one-shot`, and `--num-consensus-nodes 1`.
> Pass any of these explicitly on the command line to override them.

**Example:**

```bash
solo one-shot falcon deploy \
  --deployment falcon-demo \
  --cluster-ref one-shot \
  --values-file falcon-values.yaml
```

## Multi-Node Falcon Deployment

For multiple consensus nodes, set the node count on the Falcon command and then
provide matching per-node settings where required.

- **Example:**

  ```bash
  solo one-shot falcon deploy \
    --deployment falcon-multi \
    --num-consensus-nodes 3 \
    --values-file falcon-values.yaml
  ```

- **Example multi-node values file:**

  ```yaml
  network:
    --release-tag: "v0.71.0"
    --pvcs: true

  setup:
    --release-tag: "v0.71.0"

  consensusNode:
    --force-port-forward: true
    --stake-amounts: "100,100,100"

  mirrorNode:
    --enable-ingress: true
    --pinger: true

  explorerNode:
    --enable-ingress: true

  relayNode:
    --node-aliases: "node1,node2,node3"
  ```

- The `--node-aliases` value in the `relayNode` section must match the node aliases
generated by `--num-consensus-nodes`. Nodes are auto-named `node1`, `node2`,
`node3`, and so on. Setting this to only `node1` is valid if you want the relay
to serve a single node, but specifying all aliases is typical for full coverage.

- Use this pattern when you need a repeatable multi-node deployment but do not
want to manage each step manually.

> **Note:** Multi-node deployments require more host resources than single-node
> deployments. Follow the resource guidance in
> [**System Readiness**](/docs/simple-solo-setup/system-readiness), and increase Docker
> memory and CPU allocation before deploying.

## (Optional) Component Toggles

Falcon can skip optional components at the command line without requiring a
second YAML file.

For example, to deploy only the consensus network and mirror node:

```bash
solo one-shot falcon deploy \
  --values-file falcon-values.yaml \
  --deploy-explorer=false \
  --deploy-relay=false
```

Available toggles and their defaults:

| Flag | Default | Description |
| ---- | ------- | ----------- |
| `--deploy-mirror-node` | `true` | Include the mirror node in the deployment. |
| `--deploy-explorer` | `true` | Include the explorer in the deployment. |
| `--deploy-relay` | `true` | Include the JSON RPC relay in the deployment. |

> **Important**: The explorer and relay both depend on the mirror node. Setting `--deploy-mirror-node=false` while keeping `--deploy-explorer=true` or `--deploy-relay=true` is not a supported configuration and will result in a failed deployment.

This is useful when you want to:

- Reduce resource usage in CI jobs.
- Isolate one component during testing.
- Reuse the same YAML file across multiple deployment profiles.

## Common Falcon Customisations

Because each YAML section maps directly to the corresponding Solo subcommand,
you can use Falcon to centralise advanced options such as:

- Custom release tags for the consensus node platform.
- Local chart directories for mirror node, relay, explorer, or block node.
- Local consensus node build paths for development workflows.
- Ingress and domain settings.
- Mirror node external database settings.
- Node startup settings such as state files, port forwarding, and stake amounts.
- Storage backends and credentials for stream file handling.

### Example: Local Development with Local Chart Directories

```yaml
setup:
  --local-build-path: "/path/to/hiero-consensus-node/hedera-node/data"

mirrorNode:
  --mirror-node-chart-dir: "/path/to/hiero-mirror-node/charts"

relayNode:
  --relay-chart-dir: "/path/to/hiero-json-rpc-relay/charts"

explorerNode:
  --explorer-chart-dir: "/path/to/hiero-mirror-node-explorer/charts"
```

This pattern is useful for local integration testing against unpublished
component builds.

## Falcon with Block Node

Falcon can also include block node configuration.

> **Note:** Block node workflows are advanced and require higher resource
> allocation and version compatibility across consensus node, block node, and
> related components.
>Docker memory must be set to at least 16 GB before deploying with block node enabled.
>
> Block node support also requires the
> `ONE_SHOT_WITH_BLOCK_NODE=true` environment variable to be set before
> running `falcon deploy`. Without it, Solo skips the block node add step even
> if a `blockNode` section is present in the values file.

Block node deployment is subject to version compatibility requirements. Minimum
versions are consensus node ≥ v0.72.0 and block node ≥ 0.29.0. Mixing
incompatible versions will cause the deployment to fail. Check the
[Version Compatibility Reference](/docs/simple-solo-setup/system-readiness#version-compatibility-reference)
before enabling block node.

Example:

```yaml
network:
  --release-tag: "v0.72.0"

setup:
  --release-tag: "v0.72.0"

consensusNode:
  --force-port-forward: true

blockNode:
  --release-tag: "v0.29.0"
  --enable-ingress: false

mirrorNode:
  --enable-ingress: true
  --pinger: true

explorerNode:
  --enable-ingress: true

relayNode:
  --node-aliases: "node1"
  --force-port-forward: true
```

Use block node settings only when your target Solo and component versions are
known to be compatible.

## Rollback and Failure Behaviour

Falcon deployment enables automatic rollback by default.

If deployment fails after resources have already been created, Solo attempts to
destroy the one-shot deployment automatically and clean up the namespace.

If you want to preserve the failed deployment for debugging, disable rollback:

```bash
solo one-shot falcon deploy \
  --values-file falcon-values.yaml \
  --no-rollback
```

Use `--no-rollback` only when you explicitly want to inspect partial resources,
logs, or Kubernetes objects after a failed run.

## Deployment Output

After a successful Falcon deployment, Solo writes deployment metadata to
`~/.solo/one-shot-<deployment>/` where `<deployment>` is the value of the
`--deployment` flag (default: `one-shot`).

This directory typically contains:

- `notes` - human-readable deployment summary
- `versions` - component versions recorded at deploy time
- `forwards` - port-forward configuration
- `accounts.json` - predefined test account keys and IDs. All accounts are
  ECDSA Alias accounts (EVM-compatible) and include a `publicAddress` field.
  The file also includes the system operator account.

This makes Falcon especially useful for automation, because the deployment
artifacts are written to a predictable path after each run.

To inspect the latest one-shot deployment metadata later, run:

```bash
solo one-shot show deployment
```

If port-forwards are interrupted after deployment - for example after a system
restart or network disruption - restore them without redeploying:

```bash
solo deployment refresh port-forwards
```

## Destroy a Falcon Deployment

- Destroy the Falcon deployment with:

  ```bash
  solo one-shot falcon destroy
  ```

- Solo removes deployed extensions first, then destroys the mirror node, network,
cluster references, and local deployment metadata.

- If multiple deployments exist locally, Solo prompts you to choose which one to
destroy unless you pass `--deployment` explicitly.

  ```bash
  solo one-shot falcon destroy --deployment falcon-demo
  ```

## When to Use Falcon vs. Manual Deployment

Use Falcon deployment when you want a single, repeatable command backed by a
versioned YAML file.

Use [**Step-by-Step Manual Deployment**](/docs/advanced-solo-setup/advanced-network-deployments/manual-deployment)
when you need to pause between steps, inspect intermediate state, or debug a
specific deployment phase in isolation.

In practice:

- Falcon is better for automation and repeatability.
- Manual deployment is better for debugging and low-level control.

## Reference

- [**Falcon Values File Reference**](/docs/advanced-solo-setup/advanced-network-deployments/falcon-flags-reference) - full list of supported CLI flags, types, and defaults for every section.
- [**Upstream example values file**](https://github.com/hiero-ledger/solo/tree/main/examples/one-shot-falcon) - working reference from the Solo repository.

> **Tip:** If you are creating a values file for the first time, start from the
> annotated template in the Solo repository rather than writing one from scratch:
>
> **[`examples/one-shot-falcon/falcon-values.yaml`](https://github.com/hiero-ledger/solo/blob/main/examples/one-shot-falcon/falcon-values.yaml)**
>
> This file includes all supported sections and flags with inline comments
> explaining each option. Copy it, remove what you do not need, and adjust the
> values for your environment.

---
