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

- **Homebrew** (**recommended** for macOS/Linux/WSL2):

  ```bash
  brew install hiero-ledger/tools/solo
  ```

- **npm** (required for native Windows PowerShell; alternative on macOS/Linux/WSL2):

  ```bash
  npm install -g @hiero-ledger/solo@latest
  ```

  > **Note:** On macOS, Linux, and WSL2, Homebrew is recommended — it installs Node.js for you, whereas npm requires Node.js to already be present. On native Windows (PowerShell), npm is the only available option. Regardless of installation method, Solo provisions kubectl, Helm, and Kind automatically at deploy time.

### Verify the installation

Confirm that Solo is installed and available on your PATH:

```bash
solo --version
```

Expected output (version may be different):

```text
** Solo **
Version : 0.77.0
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

> **Tip:** Solo caches the container images it pulls, so your first deployment
> may take longer while images download; later deployments reuse the local cache
> and start faster. See [Solo Image Cache](/docs/advanced-solo-setup/image-cache).

> **Note:** During deployment you may see `Stopping port-forward for port [N]`
> printed in yellow. This is expected - as it sets up the network, Solo stops
> and re-establishes port-forwards to finalize the port configuration (clearing
> stale forwards and migrating ports as needed). It does not indicate a failure.

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

After the one-shot deployment completes and all pods are running, Solo sets up port-forwards so you can reach your local services. The endpoints below are the **default** ports for Solo 0.63 and later:

| Service               | Endpoint                 | Description                            | Verification |
|-----------------------|--------------------------|----------------------------------------|--------------|
| Explorer UI           | `http://localhost:38080` | Web UI for inspecting the network.     | Open URL in your browser |
| Consensus node (gRPC) | `localhost:35211`        | gRPC endpoint for transactions.        | `nc -zv localhost 35211` |
| Mirror node REST API  | `http://localhost:38081` | REST API for queries.                  | `curl http://localhost:38081/api/v1/transactions` |
| JSON RPC relay        | `http://localhost:37546` | Ethereum-compatible JSON RPC endpoint. | `curl -X POST http://localhost:37546 -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'` |

> **macOS note:** Running `nc -zv localhost 35211` may print two lines:
> ```text
> nc: connectx to localhost port 35211 (tcp) failed: Connection refused
> Connection to localhost port 35211 [tcp/*] succeeded!
> ```
> The first line is a failed IPv6 attempt - this is expected on macOS.
> The second line confirms the IPv4 connection succeeded. The port is reachable.

Open `http://localhost:38080` in your browser to explore your network.

The `Verification` commands above use bash tools (`nc`, `curl`). On native Windows, run the PowerShell equivalents instead:

```powershell
# Consensus node (gRPC)
Test-NetConnection localhost -Port 35211

# Mirror node REST API
Invoke-RestMethod http://localhost:38081/api/v1/transactions

# JSON RPC relay
Invoke-RestMethod -Method Post -Uri 'http://localhost:37546' -ContentType 'application/json' -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

> **Note:** In PowerShell, `curl` is an alias for `Invoke-WebRequest`, so the bash `curl` flags above will not work. Use `curl.exe` explicitly if you prefer the bash-style syntax.

### Port availability

The ports above are Solo's defaults. Solo uses `kubectl port-forward` to tunnel traffic from your machine to services running inside Kubernetes. Before opening each tunnel, Solo tries the configured port:

- If the port is free, Solo logs: `Using requested port <port>`.
- If the port is already occupied (by another process, or by a previous Solo session that did not clean up its port-forwards), Solo finds the next available port and logs: `Using available port <port>`.

The actual ports used are printed at the end of `solo one-shot single deploy`. You can also look them up at any time with the Solo CLI, using your deployment name (see [Capture your deployment name](#capture-your-deployment-name)).

To view the active port assignments:

```bash
solo deployment config ports --deployment <deployment-name>
```

{{< tabpane text=true >}}
{{% tab header="Bash" lang="bash" %}}
```bash
cat ~/.solo/one-shot-$(cat ~/.solo/cache/last-one-shot-deployment.txt)/forwards
```
{{% /tab %}}
{{% tab header="PowerShell" lang="powershell" %}}
```powershell
Get-Content "$env:USERPROFILE\.solo\one-shot-$(Get-Content $env:USERPROFILE\.solo\cache\last-one-shot-deployment.txt)\forwards"
```
{{% /tab %}}
{{< /tabpane >}}

 *** Consensus node gRPC ***
-------------------------------------------------------------------------------
 - component 1: localhost:35211 -> pod:50211

{{< tabpane text=true >}}
{{% tab header="Bash" lang="bash" %}}
```bash
solo deployment config info --deployment $(cat ~/.solo/cache/last-one-shot-deployment.txt)
```
{{% /tab %}}
{{% tab header="PowerShell" lang="powershell" %}}
```powershell
solo deployment config info --deployment (Get-Content $env:USERPROFILE\.solo\cache\last-one-shot-deployment.txt)
```
{{% /tab %}}
{{< /tabpane >}}

To restore port-forwards after a system restart without redeploying:

{{< tabpane text=true >}}
{{% tab header="Bash" lang="bash" %}}
```bash
solo deployment refresh port-forwards --deployment $(cat ~/.solo/cache/last-one-shot-deployment.txt)
```
{{% /tab %}}
{{% tab header="PowerShell" lang="powershell" %}}
```powershell
solo deployment refresh port-forwards --deployment (Get-Content $env:USERPROFILE\.solo\cache\last-one-shot-deployment.txt)
```
{{% /tab %}}
{{< /tabpane >}}

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

## Tear down your network

When you are finished, destroy the network to free up resources:

```bash
solo one-shot single destroy
```

For a full teardown procedure including failure recovery, see the [Cleanup](/docs/simple-solo-setup/cleanup) guide. For granular stop/start and management options, see [Managing Your Network](/docs/simple-solo-setup/managing-your-network).
