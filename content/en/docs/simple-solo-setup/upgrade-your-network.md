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

## Find your deployment name

If you used the default deployment name, it is `one-shot`. Otherwise, find the current deployment name with one of these commands:

```bash
cat ~/.solo/cache/last-one-shot-deployment.txt
```

or:

```bash
solo deployment config info --deployment <deployment-name>
```

Use the value returned from these commands as `<deployment-name>` in the upgrade command.

## Upgrade the network

Run the following command to upgrade an existing Solo network deployment to a newer Hiero version:

```bash
solo consensus network upgrade --deployment <deployment-name> --upgrade-version <version>
```

Replace `<version>` with the target Hiero version, for example `v0.59.0`.

> **Important:** This command is only for networks already deployed with Solo. Do not run it immediately after Quickstart unless you are moving an older deployment to a newer version.

## Verify the upgrade

After upgrading, confirm the network is healthy by checking pod status:

```bash
kubectl get pods -n <namespace>
```

For one-shot deployments, the namespace typically matches the deployment name in `~/.solo/cache/last-one-shot-deployment.txt`.
