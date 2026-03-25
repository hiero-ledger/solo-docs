---
title: "Dynamically add, update, and remove Consensus Nodes"
weight: 3
description: >
  Learn how to dynamically add, update, and remove consensus nodes in a
  running Solo network without taking the network offline.
type: docs
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
  1. [**Quickstart**](/onboarding/quickstart) - single command deployment using
     `solo one-shot single deploy`.
  2. [**Manual Deployment**](/network-operators/manual-deployment) - step-by-step
     deployment with full control over each component.
- Set the required environment variables as described below:
  ```bash
    export SOLO_CLUSTER_NAME=solo
    export SOLO_NAMESPACE=solo
    export SOLO_CLUSTER_SETUP_NAMESPACE=solo-cluster
    export SOLO_DEPLOYMENT=solo-deployment
    ```
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
    alongside the keys for existing nodes in the same directory. For more detail, see [Where are my keys stored?](/docs/faq/#where-are-my-keys-stored).

2. **Persistent Volume Claims (PVCs)**

    By default, consensus node storage is **ephemeral** - data stored by a node
    is lost if its pod crashes or is restarted. This is intentional for
    lightweight local testing where persistence is not required.

    The `--pvcs true` flag creates
    [Persistent Volume Claims (PVCs)](https://kubernetes.io/docs/concepts/storage/volumes/#how-volumes-work)
    for the node, ensuring its state survives pod restarts. Enable this flag for
    any node that needs to persist across restarts or that will participate in
    longer-running test scenarios.

    > **Note:** PVCs are not enabled by default. Enable them only if your node
    > needs to persist state across pod restarts.

3. **Staging Directory**

     The `--output-dir context` flag specifies a local staging directory where Solo
      writes all artifacts produced during `prepare`. Solo's working files are stored
      under `~/.solo/` — if you use a relative path like `context`, the directory is
      created in your current working directory. Do not delete it until `execute` has
      completed successfully.

## Adding a Node to an Existing Network
  You can dynamically add a new consensus node to a running network without taking the network offline. 
  This process involves three stages: preparing the node's keys and configuration, submitting the on-chain transaction, and executing the addition.

  ### Step 1: Prepare the new node
  Generate the new node's gossip and TLS keys, create its persistent volumes, and stage its configuration into an output directory:
  
  ```bash
    solo consensus dev-node-add prepare \
    --gossip-keys true \
    --tls-keys true \
    --deployment "${SOLO_DEPLOYMENT}" \
    --pvcs true \
    --admin-key <admin-key> \
    --node-alias node2 \
    --output-dir context
  ```
  | Flag          | Description                                                                  |
  | ------------- | ---------------------------------------------------------------------------- |
  | --gossip-keys | Generate gossip keys for the new node.                                       |
  | --tls-keys    | Generate gRPC TLS keys for the new node.                                     |
  | --pvcs        | Create persistent volume claims for the new node.                            |
  | --admin-key   | The admin key used to authorize the node addition transaction.               |
  | --node-alias  | Alias for the new node (e.g., node2).                                        |
  | --output-dir  | Directory where prepared context files are saved for use in subsequent steps.|

  ### Step 2: Submit the transaction to add the node
  Submit the on-chain transaction to register the new node with the network:
 
  ```bash
  ssolo consensus dev-node-add submit-transaction \
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

> Note: For a complete walkthrough with expected outputs, see the Node Create Transaction example.

## Updating a Node
You can update an existing consensus node - for example, to upgrade its software version or modify its configuration - without removing it from the network. 

 ### Step 1: Prepare the update
Stage the updated configuration and any new software version for the target node:
  ```bash
    solo consensus dev-node-update prepare \
    --deployment "${SOLO_DEPLOYMENT}" \
    --node-alias node1 \
    --release-tag v0.61.0 \
    --output-dir context
  ```
  | Flag          | Description                                                                  |
  | ------------- | ---------------------------------------------------------------------------- |
  | --node-alias  | Alias of the node to update (e.g., node1).                                   |
  | --release-tag | The consensus node software version to update to.                            |
  | --output-dir  | Directory where prepared context files are saved for use in subsequent steps.|

 ### Step 2: Submit the update transaction
   Submit the on-chain transaction to register the node update with the network:
  
  ```bash
  solo consensus dev-node-update submit-transaction \
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

> Note: For a complete walkthrough with expected outputs, see the Node Update Transaction example.

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
| Flag         | Description                                                                  |
| ------------ | ---------------------------------------------------------------------------- |
| --node-alias | Alias of the node to remove (e.g., node2).                                   |
| --output-dir | Directory where prepared context files are saved for use in subsequent steps.|

 ### Step 2: Submit the delete transaction
  Submit the on-chain transaction to deregister the node from the network:

  ```bash
  solo consensus dev-node-delete submit-transaction \
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

> Note: For a complete walkthrough with expected outputs, see the Node Delete Transaction example.
