---
title: "Upgrade Your Network"
weight: 4
description: >
  Learn how to upgrade an existing Solo network deployment to a newer Hiero
  version using the Solo CLI and verify compatibility before you begin.
categories: ["Operations"]
tags: ["operations", "cli", "consensus-nodes", "upgrade"]
type: docs
icon: "fas fa-arrow-up"
---

## Overview

This guide explains how to upgrade an existing local Solo network deployment to a newer Hiero version. It is intended for networks that were already deployed with `solo one-shot single deploy`.

> **Note:** If you just completed Quickstart with the latest Solo release, you do not need to upgrade unless you are intentionally moving an older deployment to a newer version.

## Prerequisites

Before upgrading, ensure you have completed the following:

- **[Quickstart](/docs/simple-solo-setup/quickstart)** - you have already deployed a running Solo network using `solo one-shot single deploy`.
- **[System Readiness](/docs/simple-solo-setup/system-readiness)** - your local environment meets Solo requirements.
- A currently running Solo deployment to upgrade.

## Step 1: Find your deployment name

The default for one-shot deployments is `one-shot`. If you used a different name, find it with `solo one-shot show deployment` (see [Capture your deployment name](/docs/simple-solo-setup/quickstart#capture-your-deployment-name)). Use that value as `<deployment-name>` in the upgrade command.

## Step 2: Upgrade the network

Run the following command to upgrade an existing Solo network deployment to a newer Hiero version:

```bash
solo consensus network upgrade --deployment <deployment-name> --upgrade-version <version>
```

Replace `<version>` with the target Hiero version, for example `v0.59.0`.

> **Important:** This command is only for networks already deployed with Solo. Do not run it immediately after Quickstart unless you are moving an older deployment to a newer version.

### Version checks before the upgrade

Before it changes anything, Solo checks the target version against the block node and mirror node already deployed, using the [component version rules](/docs/simple-solo-setup/system-readiness#component-version-rules). The upgrade stops with an error in these cases:

- **The deployed block node or mirror node is too old for the target version.** Upgrade that component first with `solo block node upgrade` or `solo mirror node upgrade`, then upgrade the consensus nodes.
- **The upgrade crosses consensus node v0.79.0.** A network on an earlier version cannot be upgraded to v0.79.0 or later in place. Destroy the network and deploy it again at the new version. See [Upgrading to consensus node v0.79.0](/docs/simple-solo-setup/system-readiness#upgrading-to-consensus-node-v0790).

Sometimes the consensus node and the block node must change together, because neither new version works with the old version of the other. For example, moving the consensus node from v0.76.x to v0.77.0 or later also requires block node 0.41.0 or later. In that case, stage the upgrade:

```bash
# 1. Upgrade the consensus nodes but leave them stopped
solo consensus network upgrade --deployment <deployment-name> --upgrade-version <version> --skip-node-start

# 2. Upgrade the block node
solo block node upgrade --deployment <deployment-name> --upgrade-version <block-node-version> --consensus-node-version <version>

# 3. Start the upgraded consensus nodes
solo consensus node start --deployment <deployment-name> --node-aliases <node-aliases>
```

In step 1, Solo warns that the versions do not match yet and continues, because the consensus nodes stay stopped until the block node is upgraded.

## Step 3: Verify the upgrade

After upgrading, confirm the network is healthy by checking pod status:

```bash
kubectl get pods -n <namespace>
```

For one-shot deployments, the namespace matches the deployment name, which defaults to `one-shot` unless you passed `--deployment` (retrieve it with `solo one-shot show deployment`).
