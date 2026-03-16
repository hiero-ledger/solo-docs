---
title: "Managing Your Network"
weight: 1
description: >
  Learn how to start, stop, and restart consensus nodes, capture logs and
  diagnostics, and upgrade your Solo network to a new Hiero version.
type: docs
---

# Managing Your Network

This guide covers day-to-day management operations for a running Solo network,
including starting, stopping, and restarting nodes, capturing logs, and upgrading the network.

## Prerequisites

Before proceeding, ensure you have completed the following:

- [**System Readiness**](/onboarding/system-readiness) - your local environment meets all hardware and software requirements.
- [**Quickstart**](/onboarding/quickstart) - you have a running Solo network deployed using `solo one-shot single deploy`.

## Find Your Deployment Name

Most management commands require your deployment name. Run the following command to retrieve it:

  ```bash
  cat ~/.solo/cache/last-one-shot-deployment.txt
  ```

Expected output:

  ```bash
  solo-deployment-<hash>
  ```

Use the value returned from this command as `<deployment-name>` in all commands on this page.

## Stopping and Starting Nodes

### Stop all nodes
Use this command to pause all consensus nodes without destroying the deployment:

```bash
solo consensus node stop --deployment <deployment-name>
```

### Start nodes
Use this command to bring stopped nodes back online:

```bash
solo consensus node start --deployment <deployment-name>
```

### Restart nodes
Use this command to stop and start all nodes in a single operation:

```bash
solo consensus node restart --deployment <deployment-name>
```

To verify pod status after any of the above commands, see [Verify the network](/onboarding/quickstart#verify-the-network) in the Quickstart guide.

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

Replace <namespace> and <pod-name> with the values from your deployment.
You can find the available pods and namespaces by running:

  ```bash
  kubectl get pods -A | grep -v kube-system
  ```

## Updating the Network

To update your consensus nodes to a new Hiero version:

```bash
solo consensus network upgrade --deployment <deployment-name> --upgrade-version <version>
```

Replace <version> with the target Hiero version, for example v0.59.0.

> **Note:** Check the [Version Compatibility Reference](/onboarding/system-readiness#version-compatibility-reference)
> in the System Readiness guide to confirm the Hiero version supported by your
> current Solo release before upgrading.
