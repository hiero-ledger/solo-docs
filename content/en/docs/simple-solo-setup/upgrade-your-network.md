---
title: "Upgrade Your Network"
weight: 4
description: >
  Learn how to upgrade an existing Solo network deployment to a newer Hiero
  version using the Solo CLI and verify compatibility before you begin.
categories: ["Operations"]
tags: ["operations", "cli", "consensus-nodes", "upgrade"]
type: docs
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

### Apply updated fee schedules and throttles

By default, an upgrade does not change the network's fee schedule (system file
`0.0.113`) or throttles (system file `0.0.123`). They keep the content they had
before, including any customizations. To replace them as part of the upgrade,
pass the new files:

```bash
solo consensus network upgrade --deployment <deployment-name> --upgrade-version <version> \
  --simple-fees-schedules-file ./simpleFeesSchedules.json \
  --throttles-file ./throttles.json
```

Each flag is optional, so you can pass either file on its own. Keep the
following in mind:

- **Use the files from the release you are upgrading to.** A node rejects files
  that reference transaction types it does not know, and keeps its previous
  file. Download them from the `hiero-consensus-node` repository at the matching
  tag, under `hedera-node/configuration/mainnet/upgrade/`, for example
  `https://raw.githubusercontent.com/hiero-ledger/hiero-consensus-node/<version>/hedera-node/configuration/mainnet/upgrade/simpleFeesSchedules.json`.
- **Files apply only during a version upgrade.** Upgrading to the version the
  network already runs does not apply them.
- **Each upgrade applies only the files passed to it.** An upgrade without these
  flags leaves the current fee schedule and throttles as they are.
- **Minimum versions.** `--simple-fees-schedules-file` requires a target version
  of v0.68.0 or later, and `--throttles-file` v0.54.0 or later. Both require
  Solo **v0.XX.0** or later.
- **Not with `--upgrade-zip-file`.** If you supply your own upgrade zip, place
  the files under `data/config/` inside it instead.

If topic messages fail with `FAIL_INVALID` after an upgrade, see
[Topic messages fail with `FAIL_INVALID` after a network upgrade](/docs/troubleshooting#topic-messages-fail-with-fail_invalid-after-a-network-upgrade).

## Step 3: Verify the upgrade

After upgrading, confirm the network is healthy by checking pod status:

```bash
kubectl get pods -n <namespace>
```

For one-shot deployments, the namespace matches the deployment name, which defaults to `one-shot` unless you passed `--deployment` (retrieve it with `solo one-shot show deployment`).
