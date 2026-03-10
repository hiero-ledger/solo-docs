---
title: "Solo Quickstart"
weight: 30
description: >
  Deploy a local Hiero test network with a single command using the Solo CLI.
  This guide covers installing Solo, running the one-shot deployment, verifying
  the network, and accessing local service endpoints.
type: docs
---

# Solo Quickstart

Solo Quickstart provides a single, one-shot command path to deploy a running Hiero test network using the Solo CLI tool.
This guide assumes basic familiarity with command-line interfaces and Docker.

## Prerequisites

Before you begin, ensure you have completed the following:

- System Readiness:
  - Prepare your local environment (Docker, Kind, Kubernetes, and related tooling) by following the **[System Readiness](/system-readiness.md)** guide.

> **Note:** Quickstart only covers what you need to run `solo one-shot single deploy` and verify that the network is working.
> Detailed version requirements, OS-specific notes, and optional tools are documented in **System Readiness**.

## Install Solo CLI

Install the latest Solo CLI globally using one of the following methods:

- **Homebrew** (**recommended** for macOS/Linux/WSL2):

  ```bash
  brew install hiero-ledger/tools/solo
  ```

- **npm** (alternatively, install Solo via npm):

  ```bash
  npm install -g @hashgraph/solo@latest
  ```

### Verify the installation

Confirm that Solo is installed and available on your PATH:

```bash
solo --version
```

Expected output (version may be different):

```text
** Solo **
Version : 0.59.1
**
```

If you see a similar banner with a valid Solo version (for example, 0.59.1), your installation is successful.

## Deploy a local network (one-shot)

Use the one-shot command to create and configure a fully functional local Hiero network:

```bash
solo one-shot single deploy
```

This command performs the following actions:

- Creates or connects to a local Kubernetes cluster using Kind.
- Deploys the Solo network components.
- Sets up and funds default test accounts.
- Exposes gRPC and JSON-RPC endpoints for client access.

### What gets deployed

| Component      | Description                                          |
|----------------|------------------------------------------------------|
| Consensus Node | Hiero consensus node for processing transactions.    |
| Mirror Node    | Stores and serves historical transaction data.       |
| Explorer UI    | Web interface for viewing accounts and transactions. |
| JSON RPC Relay | Ethereum-compatible JSON RPC interface.              |

### Verify the network

After the one-shot deployment completes, verify that the Kubernetes workloads are healthy.

You can monitor the Kubernetes workloads with standard tools:

```bash
kubectl get pods -A | grep -v kube-system
```

Confirm that all Solo-related pods are in a `Running` or `Completed` state.

> **Tip:** The Solo testing team recommends [k9s](https://k9scli.io/) for managing Kubernetes clusters. It provides a terminal-based UI that makes it easy to view pods, logs, and cluster status. Install it with `brew install k9s` and run `k9s` to launch.

## Access your local network

After the one-shot deployment completes and all pods are running, your local services are available at the following endpoints:

| Service               | Endpoint                | Description                            |
|-----------------------|-------------------------|----------------------------------------|
| Explorer UI           | `http://localhost:8080` | Web UI for inspecting the network.     |
| Consensus node (gRPC) | `localhost:50211`       | gRPC endpoint for transactions.        |
| Mirror node REST API  | `http://localhost:5551` | REST API for queries.                  |
| JSON RPC relay        | `localhost:7546`        | Ethereum-compatible JSON RPC endpoint. |

Open `http://localhost:8080` in your browser to explore your network.
