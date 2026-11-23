---
title: "Dynamically add, update, and remove Consensus Nodes"
weight: 4
description: >
  Learn how to dynamically add, update, and remove consensus nodes in a
  running Solo network without taking the network offline. Execute operations
  independently while the network remains operational.
categories: ["Advanced", "Operations"]
tags: ["advanced", "operator", "consensus-nodes", "operations"]
type: docs
nav_next: /docs/advanced-solo-setup/jvm-debugger/
icon: "fas fa-exchange-alt"
---

## Overview

This guide covers how to dynamically manage consensus nodes in a running Solo
network - adding new nodes, updating existing ones, and removing nodes that
are no longer needed. All three operations can be performed without taking
the network offline.

## Prerequisites

Before proceeding, ensure you have:

- A running Solo network. If you don't have one, deploy using one of the
  following methods:
  1. [**Quickstart**](/docs/simple-solo-setup/quickstart) - single command deployment using
     `solo one-shot single deploy`.
  2. [**Manual Deployment**](/docs/advanced-solo-setup/network-deployments/manual-deployment) - step-by-step
     deployment with full control over each component.

- Persistent Volume Claims (PVCs) enabled on that network if you plan to
  **add** a node — see [Persistent Volume Claims](#persistent-volume-claims-pvcs) below.

- Set `SOLO_DEPLOYMENT` to the name of the deployment you want to operate on.
  The commands on this page only need the deployment name.

  - **Quickstart** (`solo one-shot single deploy`): the deployment is named
    `one-shot` unless you passed `--deployment`.
  - **Manual Deployment**: use the `SOLO_DEPLOYMENT` value from that guide
    (`solo-deployment`).

{{< tabpane text=true >}}
{{% tab header="Bash" lang="bash" %}}
```bash
# Quickstart deployment; use solo-deployment for the Manual Deployment guide
export SOLO_DEPLOYMENT=one-shot
```
{{% /tab %}}
{{% tab header="PowerShell" lang="powershell" %}}
```powershell
# Quickstart deployment; use solo-deployment for the Manual Deployment guide
$env:SOLO_DEPLOYMENT = 'one-shot'
```
{{% /tab %}}
{{< /tabpane >}}

  On native Windows (PowerShell), reference the variable as `$env:SOLO_DEPLOYMENT`
  in the commands that follow.

## Key and Storage Concepts

Before running any node operation, it helps to understand two concepts that
appear in the `prepare` step.

1. **Cryptographic Keys**

    Solo generates two types of keys for each consensus node:

    - **Gossip keys** — used for encrypted node-to-node communication within the
      network. Stored as `s-private-node*.pem` and `s-public-node*.pem` under
      `~/.solo/cache/keys/`.
    - **TLS keys** — used to secure gRPC connections to the node. Stored as
      `hedera-node*.crt` and `hedera-node*.key` under `~/.solo/cache/keys/`.

    When adding a new node, Solo generates a fresh key pair and stores it
    alongside the keys for existing nodes in the same directory. For more detail, see [Where are my keys stored?](/docs/faqs/#5-where-are-my-keys-stored).

2. <a id="persistent-volume-claims-pvcs"></a>**Persistent Volume Claims (PVCs)**

    The `--pvcs` flag creates
    [Persistent Volume Claims (PVCs)](https://kubernetes.io/docs/concepts/storage/volumes/#how-volumes-work)
    for consensus node storage, so a node's state survives pod restarts.
    Without PVCs, node storage is **ephemeral** and is lost when its pod
    restarts.

    **Adding a node requires PVCs.** Solo checks that `--pvcs` is enabled on
    the add command and that the existing nodes already have PVCs; otherwise
    the add fails. The network you add the node to must therefore have been
    deployed with PVCs enabled.

    - **Solo v0.99.0 and later** enable PVCs by default (`--pvcs` defaults to
      `true`) for `solo consensus network deploy`, `solo one-shot single deploy`,
      and the node add commands, so a default deployment is ready for node
      additions. A Falcon values file can still turn them off (`--pvcs: false`).
    - **Earlier versions** default `--pvcs` to `false`. Deploy the network with
      `solo consensus network deploy --pvcs true` (or set `--pvcs: true` in the
      Falcon values file), and pass `--pvcs true` to the node add commands.
      A Quickstart network deployed with an earlier version has no PVCs and
      cannot accept new nodes.

3. **Staging Directory**

     The `--output-dir context` flag specifies a local staging directory where Solo
      writes all artifacts produced during `prepare`. Solo's working files are stored
      under `~/.solo/` — if you use a relative path like `context`, the directory is
      created in your current working directory. Do not delete it until `execute` has
      completed successfully.

## Adding a Node to an Existing Network

You can dynamically add a new consensus node to a running network without taking the network offline.

Solo assigns the new node's alias automatically: it takes the alias of the last
existing node and increments its number (for example, `node2` after `node1`), and
gives the node the next free account ID. There is no flag to choose the alias.

The simplest way to add a node is the single command `solo consensus node add`,
which runs the prepare, submit, and execute stages in one go:

```bash
solo consensus node add \
  --gossip-keys true \
  --tls-keys true \
  --pvcs true \
  --deployment "${SOLO_DEPLOYMENT}"
```

To run (or script) each stage separately, use the `solo consensus dev-node-add`
commands below. The process has three stages: preparing the node's keys and
configuration, submitting the on-chain transaction, and executing the addition.

### Step 1: Prepare the new node

Generate the new node's gossip and TLS keys, create its persistent volumes, and stage its configuration into an output directory:

```bash
solo consensus dev-node-add prepare \
  --gossip-keys true \
  --tls-keys true \
  --deployment "${SOLO_DEPLOYMENT}" \
  --pvcs true \
  --admin-key <admin-key> \
  --output-dir context
```

| Flag | Description |
| --- | --- |
| --gossip-keys | Generate gossip keys for the new node. |
| --tls-keys | Generate gRPC TLS keys for the new node. |
| --pvcs | Create persistent volume claims for the new node. Required; defaults to `true` in Solo v0.99.0 and later. |
| --admin-key | The admin key used to authorize the node addition transaction. |
| --output-dir | Directory where prepared context files are saved for use in subsequent steps. |

### Step 2: Submit the transaction to add the node

Submit the on-chain transaction to register the new node with the network:

```bash
solo consensus dev-node-add submit-transactions \
  --deployment "${SOLO_DEPLOYMENT}" \
  --input-dir context
```

### Step 3: Execute the node addition

Apply the node addition and bring the new node online:

```bash
solo consensus dev-node-add execute \
  --deployment "${SOLO_DEPLOYMENT}" \
  --input-dir context
```

> Note: For a complete walkthrough with expected outputs, see the [Node Create Transaction example](https://github.com/hiero-ledger/solo/tree/main/examples/node-create-transaction).

## Updating a Node

You can update an existing consensus node - for example, to upgrade its software version or modify its configuration - without removing it from the network.

### Step 1: Prepare the update

Stage the updated configuration and any new software version for the target node:

```bash
solo consensus dev-node-update prepare \
  --deployment "${SOLO_DEPLOYMENT}" \
  --node-alias node1 \
  --consensus-node-version v0.66.0 \
  --output-dir context
```

| Flag | Description |
| --- | --- |
| --node-alias | Alias of the node to update (e.g., node1). |
| --consensus-node-version | The consensus node software version to update to. |
| --new-admin-key | (Optional) New admin key for the node's Hedera account. Omit to keep the existing admin key. |
| --output-dir | Directory where prepared context files are saved for use in subsequent steps. |

### Step 2: Submit the update transaction

Submit the on-chain transaction to register the node update with the network:

```bash
solo consensus dev-node-update submit-transactions \
  --deployment "${SOLO_DEPLOYMENT}" \
  --input-dir context
```

### Step 3: Execute the update

Apply the update and restart the node with the new configuration:

```bash
solo consensus dev-node-update execute \
  --deployment "${SOLO_DEPLOYMENT}" \
  --input-dir context
```

> Note: For a complete walkthrough with expected outputs, see the [Node Update Transaction example](https://github.com/hiero-ledger/solo/tree/main/examples/node-update-transaction).

## Removing a Node from a Network

You can dynamically remove a consensus node from a running network without taking the remaining nodes offline.

> Note: Removing a node permanently reduces the number of consensus nodes in the network.
> Ensure the remaining nodes meet the minimum threshold required for consensus before proceeding.

### Step 1: Prepare the Node for Deletion

Stage the deletion context for the target node:

```bash
solo consensus dev-node-delete prepare \
  --deployment "${SOLO_DEPLOYMENT}" \
  --node-alias node2 \
  --output-dir context
```

| Flag | Description |
| --- | --- |
| --node-alias | Alias of the node to remove (e.g., node2). |
| --output-dir | Directory where prepared context files are saved for use in subsequent steps. |

### Step 2: Submit the delete transaction

Submit the on-chain transaction to deregister the node from the network:

```bash
solo consensus dev-node-delete submit-transactions \
  --deployment "${SOLO_DEPLOYMENT}" \
  --input-dir context
```

### Step 3: Execute the deletion

Remove the node and clean up its associated resources:

```bash
solo consensus dev-node-delete execute \
  --deployment "${SOLO_DEPLOYMENT}" \
  --input-dir context
```

> Note: For a complete walkthrough with expected outputs, see the [Node Delete Transaction example](https://github.com/hiero-ledger/solo/tree/main/examples/node-delete-transaction).
