---
title: "Node Management"
weight: 5
description: >
  Learn how to dynamically add, update, and delete consensus nodes in a
  running Solo network.
type: docs
---

# Overview

This guide covers how to dynamically manage consensus nodes in a running Solo
network - including adding new nodes, updating existing ones, and removing
nodes that are no longer needed.

## Prerequisites

Before proceeding, ensure you have:

- Set the required environment variables as described in
  [**Network Operators**](/network-operators).
- A running Solo network. If you don't have one, deploy using one of the
  following methods:
  1. [**Quickstart**](/onboarding/quickstart) - single command deployment using
     `solo one-shot single deploy`.
  2. [**Manual Deployment**](/network-operators/manual-deployment) - step-by-step
     deployment with full control over each component.

## Adding a Node to an Existing Network
  You can dynamically add a new consensus node to a running network without taking the network offline. 
  This process involves three stages: preparing the node's keys and configuration, submitting the on-chain transaction, and executing the addition.

  ### Step 1 - Prepare the new node
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

  ### Step 2 - Submit the transaction to add the node
  Submit the on-chain transaction to register the new node with the network:
 
  ```bash
  ssolo consensus dev-node-add submit-transaction \
  --deployment "${SOLO_DEPLOYMENT}" \
  --input-dir context
  ```

  ### Step 3 - Execute the node addition
 Apply the node addition and bring the new node online:
 
  ```bash
  solo consensus dev-node-add execute \
  --deployment "${SOLO_DEPLOYMENT}" \
  --input-dir context
  ```

> Note: For a complete walkthrough with expected outputs, see the Node Create Transaction example.

## Updating a Node
You can update an existing consensus node - for example, to upgrade its software version or modify its configuration - without removing it from the network. 
This process follows the same three-stage pattern as node addition: prepare, submit the transaction, then execute.

 ### Step 1 - Prepare the update
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

 ### Step 2 - Submit the update transaction
   Submit the on-chain transaction to register the node update with the network:
  
  ```bash
  solo consensus dev-node-update submit-transaction \
  --deployment "${SOLO_DEPLOYMENT}" \
  --input-dir context
  ```

 ### Step 3 - Execute the update
  Apply the update and restart the node with the new configuration:
  
  ```bash
  solo consensus dev-node-update execute \
  --deployment "${SOLO_DEPLOYMENT}" \
  --input-dir context
  ```

> Note: For a complete walkthrough with expected outputs, see the Node Update Transaction example.

## Removing a Node from a Network

You can dynamically remove a consensus node from a running network without taking the remaining nodes offline. 
This process follows the same three-stage pattern as node addition: prepare, submit the transaction, then execute.


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

 ### Step 2 - Submit the delete transaction
  Submit the on-chain transaction to deregister the node from the network:

  ```bash
  solo consensus dev-node-delete submit-transaction \
  --deployment "${SOLO_DEPLOYMENT}" \
  --input-dir context
  ```

 ### Step 3 — Execute the deletion
  Remove the node and clean up its associated resources:
  
  ```bash
  solo consensus dev-node-delete execute \
  --deployment "${SOLO_DEPLOYMENT}" \
  --input-dir context
  ``` 

> Note: For a complete walkthrough with expected outputs, see the Node Delete Transaction example.
