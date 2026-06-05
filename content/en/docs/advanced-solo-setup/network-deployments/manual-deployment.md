---
title: "Step-by-Step Manual Deployment"
description: >
  Deploy each Solo network component individually for maximum control over
  configuration and debugging. Execute each step manually through the Solo CLI
  and integrate Solo into bespoke automation pipelines.
categories: ["Advanced", "Deployment"]
tags: ["advanced", "operator", "manual-deployment", "cli"]
weight: 3
type: docs
---

## Overview

Manual deployment lets you deploy each Solo network component individually,
giving you full control over configuration, sequencing, and troubleshooting.
Use this approach when you need to customise specific steps, debug a component
in isolation, or integrate Solo into a bespoke automation pipeline.

---

## Prerequisites

Before proceeding, ensure you have completed the following:

- [**System Readiness**](/docs/simple-solo-setup/system-readiness) — your local environment
  meets all hardware and software requirements (Docker, kind, kubectl, helm, Solo).
- [**Quickstart**](/docs/simple-solo-setup/quickstart) — you have a running Kind cluster.
- Set your environment variables if you have not already done so:

  ```bash
  export SOLO_CLUSTER_NAME=solo
  export SOLO_NAMESPACE=solo
  export SOLO_CLUSTER_SETUP_NAMESPACE=solo-cluster
  export SOLO_DEPLOYMENT=solo-deployment
  ```

---

## Deployment Steps

> **Note:** The expected output blocks below are fetched from the latest published Solo release
> at build time and will always reflect the current version.

### 1. Connect Cluster and Create Deployment

- Connect Solo to the Kind cluster and create a new deployment configuration:

  ```bash
  # Connect to the Kind cluster
  solo cluster-ref config connect \
    --cluster-ref kind-${SOLO_CLUSTER_NAME} \
    --context kind-${SOLO_CLUSTER_NAME}

  # Create a new deployment
  solo deployment config create \
    -n "${SOLO_NAMESPACE}" \
    --deployment "${SOLO_DEPLOYMENT}"
  ```

- **Expected Output**:

  {{< solo-output ref="solo-cluster-ref-config-connect" lang="bash" >}}

- {{< solo-output ref="solo-deployment-config-create" lang="bash" >}}

---

### 2. Add Cluster to Deployment

- Attach the cluster to your deployment and specify the number of consensus nodes:

  #### 1. Single node:

    ```bash
    solo deployment cluster attach \
      --deployment "${SOLO_DEPLOYMENT}" \
      --cluster-ref kind-${SOLO_CLUSTER_NAME} \
      --num-consensus-nodes 1
    ```

  #### 2. Multiple nodes (e.g., --num-consensus-nodes 3):

    ```bash
    solo deployment cluster attach \
      --deployment "${SOLO_DEPLOYMENT}" \
      --cluster-ref kind-${SOLO_CLUSTER_NAME} \
      --num-consensus-nodes 3
    ```

- **Expected Output**:

  {{< solo-output ref="solo-deployment-cluster-attach" lang="bash" >}}

---

### 3. Generate Keys

- Generate the gossip and TLS keys for your consensus nodes:

  ```bash
  solo keys consensus generate \
    --gossip-keys \
    --tls-keys \
    --deployment "${SOLO_DEPLOYMENT}"
  ```

  PEM key files are written to `~/.solo/cache/keys/`.

- **Expected output**:

  {{< solo-output ref="solo-keys-consensus-generate" lang="bash" >}}

---

### 4. Set Up Cluster with Shared Components

- Install shared cluster-level components (MinIO Operator, Prometheus CRDs, etc.)
into the cluster setup namespace:

  ```bash
  solo cluster-ref config setup --cluster-setup-namespace "${SOLO_CLUSTER_SETUP_NAMESPACE}"
  ```

- **Expected output**:

  {{< solo-output ref="solo-cluster-ref-config-setup" lang="bash" >}}

---

### 5. Deploy the Network

- Deploy the Solo network Helm chart, which provisions the consensus node pods,
HAProxy, Envoy, and MinIO:

  ```bash
  solo consensus network deploy --deployment "${SOLO_DEPLOYMENT}"
  ```

- **Expected output**:

  {{< solo-output ref="solo-consensus-network-deploy" lang="bash" >}}

---

### 6. Set Up Consensus Nodes

- Download the consensus node platform software and configure each node:

  ```bash
  export CONSENSUS_NODE_VERSION=v0.66.0

  solo consensus node setup \
    --deployment "${SOLO_DEPLOYMENT}" \
    --release-tag "${CONSENSUS_NODE_VERSION}"
  ```

- **Expected output**:

  {{< solo-output ref="solo-consensus-node-setup" lang="bash" >}}

---

### 7. Start Consensus Nodes

- Start all configured nodes and wait for them to reach ACTIVE status:

  ```bash
  solo consensus node start --deployment "${SOLO_DEPLOYMENT}"
  ```

- **Expected output**:

  {{< solo-output ref="solo-consensus-node-start" lang="bash" >}}

---

### 8. Deploy Mirror Node

- Deploy the Hedera Mirror Node, which indexes all transaction data and exposes a
REST API and gRPC endpoint:

  ```bash
  solo mirror node add \
    --deployment "${SOLO_DEPLOYMENT}" \
    --cluster-ref kind-${SOLO_CLUSTER_NAME} \
    --enable-ingress \
    --pinger
  ```

  The `--pinger` flag keeps the mirror node's importer active by regularly
submitting record files. The `--enable-ingress` flag installs the HAProxy
ingress controller for the mirror node REST API.

- **Expected output**:

  {{< solo-output ref="solo-mirror-node-add" lang="bash" >}}

---

### 9. Deploy Explorer

- Deploy the Hiero Explorer, a web UI for browsing transactions and accounts:

  ```bash
  solo explorer node add \
    --deployment "${SOLO_DEPLOYMENT}" \
    --cluster-ref kind-${SOLO_CLUSTER_NAME}
  ```

- **Expected output**:

  {{< solo-output ref="solo-explorer-node-add" lang="bash" >}}

---

### 10. Deploy JSON-RPC Relay

- Deploy the Hiero JSON-RPC Relay to expose an Ethereum-compatible JSON-RPC
endpoint for EVM tooling (MetaMask, Hardhat, Foundry, etc.):

  ```bash
  solo relay node add \
    -i node1 \
    --deployment "${SOLO_DEPLOYMENT}"
  ```
> TODO: double check these, and update in solo repo if needed to match, also double check the exported variables match

- **Expected output**:

  {{< solo-output ref="solo-relay-node-add" lang="bash" >}}

---

## Cleanup

When you are done, destroy components in the reverse order of deployment.

> **Important:** Always destroy components before destroying the network. Skipping
> this order can leave orphaned Helm releases and PVCs in your cluster.

### 1. Destroy JSON-RPC Relay

```bash
solo relay node destroy \
  -i node1 \
  --deployment "${SOLO_DEPLOYMENT}" \
  --cluster-ref kind-${SOLO_CLUSTER_NAME}
```

### 2. Destroy Explorer

```bash
solo explorer node destroy \
  --deployment "${SOLO_DEPLOYMENT}" \
  --force
```

### 3. Destroy Mirror Node

```bash
solo mirror node destroy \
  --deployment "${SOLO_DEPLOYMENT}" \
  --force
```

### 4. Destroy the Network

```bash
solo consensus network destroy \
  --deployment "${SOLO_DEPLOYMENT}" \
  --force
```
