---
title: "Quickstart"
weight: 2
description: >
  Deploy a local Hiero test network with a single command using the Solo CLI.
  This guide covers installation, one-shot deployment, network verification,
  and accessing local service endpoints.
categories: ["Getting Started", "Deployment"]
tags: ["beginner", "one-shot", "deployment", "cli"]
type: docs
---

## Overview

Solo Quickstart provides a single, one-shot command path to deploy a running Hiero test network using the Solo CLI tool.
This guide covers installing Solo, running the one-shot deployment, verifying the network, and accessing local service endpoints.

> **Note:** This guide assumes basic familiarity with command-line interfaces and Docker.

## Prerequisites

Before you begin, ensure you have completed the following:

- System Readiness:
  - Prepare your local environment (Docker, Kind, Kubernetes, and related tooling) by following the **[System Readiness](/docs/simple-solo-setup/system-readiness)** guide.

> **Note:** Quickstart only covers what you need to run `solo one-shot single deploy` and verify that the network is working.
> Detailed version requirements, OS-specific notes, and optional tools are documented in **System Readiness**.

## Install Solo CLI

Install the latest Solo CLI globally using one of the following methods:

- **Homebrew** (**recommended** for macOS/Linux/WSL2):

  ```bash
  brew install hiero-ledger/tools/solo
  ```

- **npm** (alternative installation method):

  ```bash
  npm install -g @hiero-ledger/solo@latest
  ```

  > **Note:** npm installation is an alternative to Homebrew. The Homebrew tap is the recommended installation method as it includes kubectl and Helm as dependencies and may have more up-to-date releases.

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

{{< details summary="Multiple Node Deployment - for testing consensus scenarios" >}}

To deploy multiple consensus nodes, pass the `--num-consensus-nodes` flag:

```bash
solo one-shot multi deploy --num-consensus-nodes 3
```

This deploys 3 consensus nodes along with the same components as the
single-node setup (mirror node, explorer, relay).

> **Note:** Multiple node deployments require more resources. Ensure you have
> at least **16 GB of memory** and **8 CPU cores** allocated to Docker before
> running this command. See
> [System Readiness](/docs/simple-solo-setup/system-readiness#hardware-requirements) for
> the full multi-node requirements.

When finished, destroy the network as usual:

```bash
solo one-shot multi destroy
```

{{< /details >}}

### Verify the network

After the one-shot deployment completes, verify that the Kubernetes workloads are healthy.

You can monitor the Kubernetes workloads with standard tools:

```bash
kubectl get pods -A | grep -v kube-system
```

Confirm that all Solo-related pods are in a `Running` or `Completed` state.

> **Tip:** The Solo testing team recommends [k9s](https://k9scli.io/) for managing Kubernetes clusters. It provides a terminal-based UI that makes it easy to view pods, logs, and cluster status. Install it with `brew install k9s` and run `k9s` to launch.

## Access your local network

After the one-shot deployment completes and all pods are running, Solo sets up port-forwards so you can reach your local services. The endpoints below are the **default** ports for Solo 0.63 and later:

| Service               | Endpoint                 | Description                            | Verification |
|-----------------------|--------------------------|----------------------------------------|--------------|
| Explorer UI           | `http://localhost:38080` | Web UI for inspecting the network.     | Open URL in your browser |
| Consensus node (gRPC) | `localhost:35211`        | gRPC endpoint for transactions.        | `nc -zv localhost 35211` |
| Mirror node REST API  | `http://localhost:38081` | REST API for queries.                  | `curl http://localhost:38081/api/v1/transactions` |
| JSON RPC relay        | `http://localhost:37546` | Ethereum-compatible JSON RPC endpoint. | `curl -X POST http://localhost:37546 -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'` |

Open `http://localhost:38080` in your browser to explore your network.

### Port availability

The ports above are Solo's defaults. Solo uses `kubectl port-forward` to tunnel traffic from your machine to services running inside Kubernetes. Before opening each tunnel, Solo tries the configured port:

- If the port is free, Solo logs: `Using requested port <port>`.
- If the port is already occupied (by another process, or by a previous Solo session that did not clean up its port-forwards), Solo finds the next available port and logs: `Using available port <port>`.

The actual ports used are printed at the end of `solo one-shot single deploy` and saved to a file. To see them:

  ```bash
  cat ~/.solo/one-shot-$(cat ~/.solo/cache/last-one-shot-deployment.txt)/forwards
  ```

To check deployment info including port assignments:

  ```bash
  solo deployment config info --deployment $(cat ~/.solo/cache/last-one-shot-deployment.txt)
  ```

To restore port-forwards after a system restart without redeploying:

  ```bash
  solo deployment refresh port-forwards --deployment $(cat ~/.solo/cache/last-one-shot-deployment.txt)
  ```

### Endpoints for Solo 0.62 and earlier

If you are using Solo 0.62 or earlier, the default port-forward targets differ:

| Service               | Endpoint                | Description                            |
|-----------------------|-------------------------|----------------------------------------|
| Explorer UI           | `http://localhost:8080` | Web UI for inspecting the network.     |
| Consensus node (gRPC) | `localhost:50211`       | gRPC endpoint for transactions.        |
| Mirror node REST API  | `http://localhost:8081` | REST API for queries (via mirror-ingress). |
| JSON RPC relay        | `http://localhost:7546` | Ethereum-compatible JSON RPC endpoint. |

Open `http://localhost:8080` in your browser to explore your network.

> **Note:** `localhost:5551` is the direct Mirror Node REST service, accessible only via manual `kubectl port-forward`, and is being phased out. Always use the ingress-based port (`8081` for Solo 0.62 and earlier, `38081` for Solo 0.63+).
