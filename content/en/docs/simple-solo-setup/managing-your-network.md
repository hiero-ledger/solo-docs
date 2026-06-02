---
title: "Managing Your Network"
weight: 3
description: >
  Learn how to start, stop, and restart consensus nodes, capture logs and
  diagnostics, and upgrade your Solo network to a new Hiero version.
  Master day-to-day network operations and troubleshooting.
categories: ["Operations"]
tags: ["operations", "cli", "consensus-nodes"]
type: docs
---

## Overview

This guide covers day-to-day management operations for a running Solo network,
including starting, stopping, and restarting nodes, capturing logs, and upgrading the network.

## Prerequisites

Before proceeding, ensure you have completed the following:

- **[System Readiness](/docs/simple-solo-setup/system-readiness)** - your local environment meets all hardware and software requirements.
- **[Quickstart](/docs/simple-solo-setup/quickstart)** - you have a running Solo network deployed using `solo one-shot single deploy`.

## Find Your Deployment Name

Most management commands require your deployment name. Run the following command to retrieve it:

  ```bash
  cat ~/.solo/cache/last-one-shot-deployment.txt
  ```

Expected output — the deployment name you passed to `solo one-shot single deploy`, or the default `one-shot` if you did not specify `--deployment`:

  ```bash
  one-shot% 
  ```

Use the value returned from this command as `<deployment-name>` in all commands on this page.

## Stopping and Starting Nodes

> **Important:** The `solo consensus node` stop/start/restart commands act on
> **consensus nodes only**. They do not stop the mirror node, Hiero Explorer,
> JSON-RPC relay, block node, or the shared services (PostgreSQL, Redis,
> MinIO) - those keep running. Solo has no stop/start command for the
> non-consensus components (their lifecycle is `add`/`destroy`). To pause the
> whole network, see [Stop the entire network](#stop-the-entire-network).

### Stop consensus nodes
Pause the consensus node(s) without destroying the deployment:

```bash
solo consensus node stop --deployment <deployment-name>
```

### Start consensus nodes
Bring stopped consensus node(s) back online:

```bash
solo consensus node start --deployment <deployment-name>
```

### Restart consensus nodes
Stop and start all consensus nodes in a single operation:

```bash
solo consensus node restart --deployment <deployment-name>
```

To verify pod status after any of the above commands, see [Verify the network](/docs/simple-solo-setup/quickstart#verify-the-network) in the Quickstart guide.

### Stop the entire network

Solo does not provide a single command to stop every component. To pause the
**entire** network - consensus, mirror, Explorer, relay, block node, and
shared services - while preserving its data, scale every workload in the
deployment namespace to zero with `kubectl`. For one-shot deployments the
namespace matches your deployment name.

```bash
kubectl scale deployment  --all --replicas=0 -n <namespace>
kubectl scale statefulset --all --replicas=0 -n <namespace>
```

This stops all pods but keeps the Kind cluster, persistent volumes, and
configuration intact. To bring the network back online, scale the workloads
back up (Solo's default deployments run a single replica each):

```bash
kubectl scale statefulset --all --replicas=1 -n <namespace>
kubectl scale deployment  --all --replicas=1 -n <namespace>
```

> **Note:** Scaling to zero pauses the network without deleting it. To remove
> the network entirely (cluster, volumes, and configuration), use
> `solo one-shot single destroy` - see the
> [Cleanup guide](/docs/simple-solo-setup/cleanup).

### Verify Network is Working

To confirm your Hedera network is fully operational, create a test account using the Ledger account creation command:

```bash
solo ledger account create --deployment <deployment-name>
```

Example output:

```bash
 *** new account created ***
-------------------------------------------------------------------------------
{
  "accountId": "0.0.1001",
  "publicKey": "302a300506032b6570032100439379b330f3b57b5deffda196c7c0c3387f3330a838c021954303e260606f24",
  "balance": 100
}
```

Once the account is created, verify it in the web-based Explorer UI:

1. Open your browser to **http://localhost:38080**
2. In the search bar, enter the account ID (e.g., `0.0.1001`)
3. View the account details, balance, and transaction history

This confirms that:
* The network is processing transactions
* The consensus node is responding correctly
* The mirror node is indexing transactions
* The explorer is displaying data properly

## Viewing Logs

To capture logs and diagnostic information for your deployment:

  ```bash
  solo deployment diagnostics all --deployment <deployment-name>
  ```

Logs are saved to `~/.solo/logs/`.

**Expected output**:

  ```bash
  ******************************* Solo *********************************************
  Version : 0.59.1
  Kubernetes Context : kind-solo
  Kubernetes Cluster : kind-solo
  Current Command : deployment diagnostics all --deployment <deployment-name>
  **********************************************************************************
  
  ✔ Initialize [0.3s]
  ✔ Get consensus node logs and configs [15s]
  ✔ Get Helm chart values from all releases [2s]
  ✔ Downloaded logs from 10 Hiero component pods [1s]
  ✔ Get node states [10s]
  
  Configurations and logs saved to /Users/<username>/.solo/logs
  Log zip file network-node1-0-log-config.zip downloaded to /Users/<username>/.solo/logs/<deployment-name>
  Helm chart values saved to /Users/<username>/.solo/logs/helm-chart-values
  ```

You can also retrieve logs for a specific pod directly using `kubectl`:

  ```bash
  kubectl logs -n <namespace> <pod-name>
  ```

> **Important:** Solo deploys each network into a Kubernetes namespace. For one-shot deployments, the namespace defaults to `one-shot` (matching the default deployment name). You can override it by passing `--namespace` to `solo one-shot single deploy`.

To find your deployment namespace, use any of:

  ```bash
  # Look up the namespace Solo recorded for this deployment
  solo deployment config info --deployment <deployment-name>

  # Or list all namespaces and pick the one matching your deployment
  kubectl get ns

  # Or inspect pods and use the NAMESPACE column
  kubectl get pods -A | grep -v kube-system
  ```

For one-shot deployments the namespace matches the deployment name in `~/.solo/cache/last-one-shot-deployment.txt` (default: `one-shot`).

Replace `<namespace>` and `<pod-name>` with the values from your deployment.

## Updating the Network

To update your consensus nodes to a new Hiero version:

```bash
solo consensus network upgrade --deployment <deployment-name> --upgrade-version <version>
```

Replace <version> with the target Hiero version, for example v0.59.0.

> **Note:** Check the [Version Compatibility Reference](/docs/simple-solo-setup/system-readiness#version-compatibility-reference)
> in the System Readiness guide to confirm the Hiero version supported by your
> current Solo release before upgrading.
