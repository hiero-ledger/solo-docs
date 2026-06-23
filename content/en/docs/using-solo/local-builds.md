---
title: "Deploying a Local Consensus Node Build"
weight: 4
description: >
  Test unreleased hiero-consensus-node changes end-to-end using Solo's
  --local-build-path flag — no Docker image rebuild or registry push required.
categories: ["Developer", "Integration"]
tags: ["developer", "local-build", "consensus-node"]
type: docs
---

## Overview

Solo's `--local-build-path` flag lets you deploy a network using a consensus
node binary you compiled locally. Use this when you need to:

- Test unreleased hiero-consensus-node code against a live Solo network.
- Reproduce a bug with a specific build.
- Iterate on platform changes without a full release cycle.

Solo validates the path for the expected `apps/` and `lib/` subdirectories,
then uses `kubectl cp` to push the local binaries directly into the running
node pods — no Docker image rebuild or registry push required.

> **Scope:** This guide covers the consensus node local build workflow.
> Local build support for mirror node, block node, relay, and explorer
> requires additional engineering work and is not yet available as a
> first-class Solo feature.

---

## Prerequisites

- **Solo CLI installed** — if you have not yet deployed a network, follow the
  [Quickstart](/docs/simple-solo-setup/quickstart) first.
- **hiero-consensus-node cloned locally** — see
  [Step 1](#step-1-build-hiero-consensus-node).
- **Java 25 (Temurin)** — this is a hard Gradle toolchain requirement;
  Java 21 will fail with a cryptic toolchain error. Install with
  [SDKMAN](https://sdkman.io/):

  ```bash
  sdk install java 25.0.2-tem
  ```

- **Gradle** — the repository includes the Gradle wrapper (`./gradlew`); no
  separate Gradle install is needed.

---

## Step 1: Build hiero-consensus-node

Clone the repository and run `./gradlew assemble`. This compiles the consensus
node and populates `hedera-node/data/` with the runtime artifacts Solo needs:

- `hedera-node/data/lib/` — runtime dependency JARs
- `hedera-node/data/apps/HederaNode.jar` — the main consensus node binary

```bash
git clone https://github.com/hiero-ledger/hiero-consensus-node.git
cd hiero-consensus-node
./gradlew assemble
```

To build a specific release tag, use `--branch`:

```bash
git clone https://github.com/hiero-ledger/hiero-consensus-node.git \
  --depth 1 --branch @<VERSION>
cd hiero-consensus-node
./gradlew assemble
```

> **Note:** The initial Gradle build downloads dependencies and compiles all
> modules. Expect 10–30 minutes on a first run; subsequent incremental builds
> are faster.

> **Note:** Solo copies `data/lib/` and `data/apps/` from your build path but
> skips `data/config/` and `data/keys/` — those come from the container image.
> To customise consensus node configuration, see
> [Custom Application Properties](/docs/advanced-solo-setup/network-deployments/custom-application-properties).

---

## Step 2: Deploy with your local build

Choose the path that matches your situation.

### Option A — New cluster (Falcon deploy)

Creates a fresh Kind cluster and deploys the full Solo network from scratch,
using your local build for the consensus node.

Create a values file with the `--local-build-path` flag:

```yaml
# local-build-values.yaml
setup:
  --local-build-path: "/absolute/path/to/hiero-consensus-node/hedera-node/data"
```

Then deploy:

```bash
solo one-shot falcon deploy --values-file local-build-values.yaml
```

Use an absolute path — relative paths can behave unexpectedly depending on
where Solo is invoked.

For a full deployment with mirror node, explorer, and relay, add the
corresponding sections to your values file. See the
[One-Shot Falcon Deployment](/docs/advanced-solo-setup/network-deployments/falcon-deployment)
guide for the complete values file reference.

### Option B — Existing cluster (consensus node setup)

If you already have a running Solo deployment and want to swap in a new
consensus node binary without redeploying the whole network:

```bash
solo consensus node setup \
  --deployment <deployment-name> \
  --local-build-path /absolute/path/to/hiero-consensus-node/hedera-node/data
```

Replace `<deployment-name>` with your deployment name — retrieve it with:

```bash
cat ~/.solo/cache/last-one-shot-deployment.txt
```

---

## Step 3: Verify the local build is running

Confirm that the consensus node gRPC port is reachable:

```bash
nc -zv localhost 35211
```

**Expected output:**

```text
Connection to localhost port 35211 [tcp/*] succeeded!
```

Confirm that the pods are running your local build by inspecting the container
images:

```bash
kubectl get pods -n <namespace> -o \
  jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].image}{"\n"}{end}'
```

Replace `<namespace>` with your deployment namespace (default: `one-shot`).
The consensus node pod should reference the image tag that matches your
`--release-tag` (or the Solo built-in default if you omitted it). The key
indicator is that the node started successfully with your local `data/lib/` and
`data/apps/` artifacts copied in.

---

## Step 4: Tear down

```bash
solo one-shot falcon destroy
```

---

## Reference: ready-to-run example

The Solo repository ships a Task-based example that automates the full
workflow — cloning at the correct versions, building the consensus node,
generating an absolute-path values file, and deploying:

- [Browse on GitHub](https://github.com/hiero-ledger/solo/tree/main/examples/one-shot-local-build)
- Download from the [Solo releases page](https://github.com/hiero-ledger/solo/releases):

  ```text
  https://github.com/hiero-ledger/solo/releases/download/@<VERSION>/example-one-shot-local-build.zip
  ```

Run the full workflow with:

```bash
task
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `--local-build-path: path does not exist` | `./gradlew assemble` has not run, or the path is wrong | Confirm: `ls /absolute/path/to/hiero-consensus-node/hedera-node/data/apps/HederaNode.jar` |
| `./gradlew assemble` fails with `Unsupported class file major version` | Wrong Java version | Check `java -version`; Java 25 (Temurin) is required. Install: `sdk install java 25.0.2-tem` |
| Consensus node pods crash on start | Build artifacts incompatible with the base container image | Set `--release-tag` in your values file to match the source tag you built from |
| `nc -zv localhost 35211` fails after deploy | Port-forward died | Restore: `kubectl port-forward svc/haproxy-node1-svc -n one-shot 35211:50211 &` |
| Slow first deployment | Mirror node, relay, and explorer images pulling for the first time | Let it complete; subsequent runs reuse the [image cache](/docs/advanced-solo-setup/image-cache) |
