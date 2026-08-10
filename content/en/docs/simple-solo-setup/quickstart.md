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

> **macOS prerequisite:** Docker Desktop must be installed and open before running `solo one-shot single deploy`. The Docker daemon is not started automatically on macOS, so confirm Docker Desktop is running from your menu bar before you begin.

> **Apple Silicon:** If `solo one-shot single deploy` fails with a **"mounts denied"** error, see [Troubleshooting Installation](/docs/simple-solo-setup/system-readiness#troubleshooting-installation).

> **Windows (PowerShell):** Complete the [System Readiness](/docs/simple-solo-setup/system-readiness) **Windows** tab first, then run the commands on this page from a PowerShell terminal. The `solo` and `kubectl` commands are identical in PowerShell; only shell-specific commands (pipes, port checks, and `~/.solo` paths) differ, and those show a **PowerShell** tab.

> **Note:** Quickstart only covers what you need to run `solo one-shot single deploy` and verify that the network is working.
> Detailed version requirements, OS-specific notes, and optional tools are documented in the [System Readiness](/docs/simple-solo-setup/system-readiness).

## Install Solo CLI

Install the latest Solo CLI globally using one of the following methods:

- **npm** (**recommended** for all platforms):

  ```bash
  npm install -g @hiero-ledger/solo@latest
  ```

  > **Note:** npm requires Node.js >= 22.0.0 to already be present (check with `node --version`; upgrade via [nvm](https://github.com/nvm-sh/nvm) or [nodejs.org](https://nodejs.org/en/download) if needed — Solo will fail with an `EBADENGINE` warning on Node.js 20.x or earlier). Solo provisions kubectl, Helm, and Kind automatically at deploy time.

- **Homebrew** (deprecated — macOS/Linux/WSL2 only):

  ```bash
  brew install hiero-ledger/tools/solo
  ```

  > ⚠️ **Homebrew support is being deprecated.** Solo will stop publishing updates to Homebrew after August 31, 2026. New users should install via npm. Existing Homebrew users should migrate before August 31.

### Verify the installation

Confirm that Solo is installed and available on your PATH:

```bash
solo --version
```

Expected output (version may be different):

```text
******************************* Solo *********************************************
Version			: 0.84.0
**********************************************************************************
```

If you see a similar banner with a valid Solo version, your installation is successful.

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

> **⏱ First-run time:** `solo one-shot single deploy` typically takes
> **3–5 minutes** when container images are already cached locally, or
> **10–20 minutes** on the very first run while Solo pulls images over the
> network (longer on slower connections). Long pauses with no visible output
> change are normal — the deploy is still running. Later deployments reuse the
> local image cache and complete faster. See
> [Solo Image Cache](/docs/advanced-solo-setup/image-cache).

> **Note:** During deployment you may see `Stopping port-forward for port [N]`
> printed in yellow. This is expected - as it sets up the network, Solo stops
> and re-establishes port-forwards to finalize the port configuration (clearing
> stale forwards and migrating ports as needed). It does not indicate a failure.

### What gets deployed

| Component      | What it does                                                              | Use it for                                                  |
|----------------|---------------------------------------------------------------------------|-------------------------------------------------------------|
| Consensus Node | Processes transactions and maintains the shared ledger.                   | Sending transactions and queries via a Hiero SDK.           |
| Mirror Node    | Indexes all transaction history and exposes a REST API and gRPC stream.   | Querying balances, history, and subscribing to event feeds. |
| Explorer UI    | Browser-based dashboard for inspecting accounts and transactions.          | Browsing the network state without writing code.            |
| JSON-RPC Relay | Ethereum-compatible JSON-RPC interface layered on top of the consensus node. | Connecting MetaMask, Hardhat, Foundry, and ethers.js.    |

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

For multi-node teardown, run `solo one-shot multi destroy`.

{{< /details >}}

### Capture your deployment name

`solo one-shot single deploy` (and `multi deploy`) assigns a unique name to
each deployment. Subsequent Solo commands and SDK guides reference it as
`<your-deployment-name>` — substitute your actual value when you run them.

Retrieve the most recent deployment's name with:

```bash
solo one-shot show deployment
```

The output includes a `Deployment Name:` line - use that value as `<deployment-name>` in other commands.

### Verify the network

After the one-shot deployment completes, verify that the Kubernetes workloads are healthy.

You can monitor the Kubernetes workloads with standard tools:

{{< tabpane text=true >}}
{{% tab header="Bash" lang="bash" %}}
```bash
kubectl get pods -A | grep -v kube-system
```
{{% /tab %}}
{{% tab header="PowerShell" lang="powershell" %}}
```powershell
kubectl get pods -A | Select-String -Pattern 'kube-system' -NotMatch
```
{{% /tab %}}
{{< /tabpane >}}

Confirm that all Solo-related pods are in a `Running` or `Completed` state.

> **Tip:** The Solo testing team recommends [k9s](https://k9scli.io/) for managing Kubernetes clusters. It provides a terminal-based UI that makes it easy to view pods, logs, and cluster status. Install it with `brew install k9s` and run `k9s` to launch.

## Access your local network

After the one-shot deployment completes and all pods are running, Solo sets up
port-forwards so you can reach your local services. For the full endpoint
reference — default ports for Solo 0.63+ and Solo 0.62 and earlier, verification
commands, and port lookup — see [**Service Endpoints**](/docs/using-solo/endpoints).

Open `http://localhost:38080` in your browser to explore your network.

## Tear down your network

When you are finished, destroy the network to free up resources:

```bash
solo one-shot single destroy
```

For a full teardown procedure including failure recovery, see the [Cleanup](/docs/simple-solo-setup/cleanup) guide. For granular stop/start and management options, see [Managing Your Network](/docs/simple-solo-setup/managing-your-network).

## Next Steps

With your network running, connect your application or explore Solo further:

- [**Using Solo with Hiero SDKs**](/docs/using-solo/using-solo-with-hiero-sdks) — Submit transactions using the JavaScript, Java, or Go SDK.
- [**Using Solo with EVM Tools**](/docs/using-solo/using-solo-with-evm-tools) — Connect MetaMask, Hardhat, Foundry, or ethers.js to your local network.
- [**Managing Your Network**](/docs/simple-solo-setup/managing-your-network) — Stop, start, and reset nodes without redeploying.
- [**Service Endpoints**](/docs/using-solo/endpoints) — Quick reference for all default ports and connection details.
