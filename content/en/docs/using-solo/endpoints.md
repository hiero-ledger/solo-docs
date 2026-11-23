---
title: "Service Endpoints"
weight: 1
description: >
  Default service endpoints for a Solo one-shot deployment. Quick reference
  for the Hiero consensus gRPC address, Mirror Node REST URL, JSON-RPC Relay
  port, and Explorer URL — for both Solo 0.63+ and Solo 0.62 and earlier.
categories: ["Reference"]
tags: ["endpoints", "ports", "gRPC", "mirror-node", "json-rpc", "explorer"]
type: docs
icon: "fas fa-network-wired"
---

## Overview

After a successful `solo one-shot single deploy`, the following services are
reachable on `localhost`. Use these endpoints to connect your application,
SDK, or tooling to the running network.

> **Note:** How the ports are exposed depends on whether one-shot created the
> Kind cluster. If it did, the ports are fixed host port mappings; otherwise
> Solo opens `kubectl port-forward` tunnels and, if a port is already in use,
> picks the next available one. See [Port availability](#port-availability)
> for details and for how to look up the ports your deployment is actually
> using.

## Solo 0.63 and later (current defaults)

| Service               | Endpoint                 | Description                                      |
|-----------------------|--------------------------|--------------------------------------------------|
| Explorer UI           | `http://localhost:38080` | Web UI for inspecting accounts and transactions. |
| Consensus node (gRPC) | `localhost:35211`        | gRPC endpoint for submitting transactions.       |
| Mirror node REST API  | `http://localhost:38081` | REST API for querying historical data.           |
| JSON-RPC relay        | `http://localhost:37546` | Ethereum-compatible JSON-RPC endpoint.           |

### Verify the endpoints

{{< tabpane text=true >}}
{{% tab header="Bash" lang="bash" %}}
```bash
# Consensus node (gRPC)
nc -zv localhost 35211

# Mirror node REST API
curl http://localhost:38081/api/v1/transactions

# JSON-RPC relay
curl -X POST http://localhost:37546 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```
{{% /tab %}}
{{% tab header="PowerShell" lang="powershell" %}}
```powershell
# Consensus node (gRPC)
Test-NetConnection localhost -Port 35211

# Mirror node REST API
Invoke-RestMethod http://localhost:38081/api/v1/transactions

# JSON-RPC relay
Invoke-RestMethod -Method Post -Uri 'http://localhost:37546' `
  -ContentType 'application/json' `
  -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```
{{% /tab %}}
{{< /tabpane >}}

> **macOS note:** Running `nc -zv localhost 35211` may print two lines:
> ```text
> nc: connectx to localhost port 35211 (tcp) failed: Connection refused
> Connection to localhost port 35211 [tcp/*] succeeded!
> ```
> The first line is a failed IPv6 attempt — this is expected on macOS.
> The second line confirms the IPv4 connection succeeded. The port is reachable.

> **Note:** In PowerShell, `curl` is an alias for `Invoke-WebRequest`, so bash
> `curl` flags will not work. Use `curl.exe` explicitly if you prefer the
> bash-style syntax.

## Solo 0.62 and earlier

If you are using Solo 0.62 or earlier, the default port-forward targets differ:

| Service               | Endpoint                | Description                                           |
|-----------------------|-------------------------|-------------------------------------------------------|
| Explorer UI           | `http://localhost:8080` | Web UI for inspecting accounts and transactions.      |
| Consensus node (gRPC) | `localhost:50211`       | gRPC endpoint for submitting transactions.            |
| Mirror node REST API  | `http://localhost:8081` | REST API for querying historical data (via mirror-ingress). |
| JSON-RPC relay        | `http://localhost:7546` | Ethereum-compatible JSON-RPC endpoint.                |

> **Note:** `localhost:5551` is the direct Mirror Node REST service, accessible
> only via manual `kubectl port-forward`, and is being phased out. Always use
> the ingress-based port (`8081` for Solo 0.62 and earlier, `38081` for
> Solo 0.63+).

## Connecting your application

Quick reference for SDK and tooling configuration (Solo 0.63 and later):

- **Hiero SDK (gRPC)**: `localhost:35211`, node account ID `0.0.3`
- **EVM tools (JSON-RPC)**: `http://localhost:37546`
- **Mirror Node REST**: `http://localhost:38081/api/v1/`

For SDK-specific connection examples, see:

- [Using Solo with Hiero SDKs](/docs/using-solo/using-solo-with-hiero-sdks)
- [Using Solo with EVM Tools](/docs/using-solo/using-solo-with-evm-tools)
- [Accessing Solo Services](/docs/using-solo/accessing-solo-services/)

## Port availability

Solo exposes the one-shot endpoints in one of two ways:

- **NodePorts (one-shot created the Kind cluster).** When
  `solo one-shot single deploy` creates the Kind cluster itself, the cluster is
  created with Kind `extraPortMappings` that publish fixed NodePorts on
  `127.0.0.1:35211`, `38080`, `38081` and `37546`. No `kubectl port-forward`
  process is involved, so nothing needs restoring after the deploy. If an
  endpoint stops responding, check that the cluster's Docker container is
  running (`docker ps --filter name=solo-cluster-control-plane`) and start it
  with `docker start solo-cluster-control-plane` if needed. Do not open a
  `kubectl port-forward` on these ports - the host port mapping already owns
  them.
- **Port-forwards (the cluster already existed).** When you deploy into an
  existing cluster, Solo opens `kubectl port-forward` tunnels instead. Before
  opening each tunnel, Solo tries the configured port:
  - If the port is free, Solo logs: `Using requested port <port>`.
  - If the port is already occupied (by another process, or by a previous Solo
    session that did not clean up its port-forwards), Solo finds the next
    available port and logs: `Using available port <port>`.

The actual endpoints are printed at the end of `solo one-shot single deploy`.
You can also look them up at any time with the Solo CLI, using your deployment
name (see [Capture your deployment name](/docs/simple-solo-setup/quickstart#capture-your-deployment-name)).

To view the deployment's port assignments:

```bash
solo deployment config ports --deployment <deployment-name>
```

```text
 *** Consensus node gRPC ***
-------------------------------------------------------------------------------
 - component 1: localhost:35211 -> pod:30007
```

The `pod:` value is the target port: a NodePort such as `30007` for the
one-shot host port mappings, or the container port (for example `50211`) for a
`kubectl port-forward`.

The one-shot deploy also saves the endpoint summary it printed to a `forwards`
file in its output directory. The output directory is
`one-shot-<deployment-name>`, and the default deployment name is `one-shot`.
So the default output directory is `~/.solo/one-shot-one-shot/`.

{{< tabpane text=true >}}
{{% tab header="Bash" lang="bash" %}}
```bash
cat ~/.solo/one-shot-one-shot/forwards
```
{{% /tab %}}
{{% tab header="PowerShell" lang="powershell" %}}
```powershell
Get-Content "$env:USERPROFILE\.solo\one-shot-one-shot\forwards"
```
{{% /tab %}}
{{< /tabpane >}}

When one-shot created the Kind cluster, the file contains lines such as:

```text
Consensus Node gRPC available on 127.0.0.1:35211 (NodePort)
Explorer available on 127.0.0.1:38080 (NodePort)
JSON RPC Relay available on http://127.0.0.1:37546 (NodePort)
Mirror Node REST API available on 127.0.0.1:38081 (NodePort)
```

For a deployment into an existing cluster, the lines read
`<service> port forward enabled on 127.0.0.1:<port>` instead.

To see each port's status as well:

```bash
solo deployment config info --deployment one-shot
```

To restore `kubectl port-forward` tunnels after a system restart without
redeploying (this does not apply to the NodePort endpoints, which come back
with the Kind cluster's container):

```bash
solo deployment port-forwards refresh --deployment one-shot
```

> **Note:** `solo deployment refresh port-forwards` still works but is
> deprecated in favor of `solo deployment port-forwards refresh` and will be
> removed in a future release.

To stop all port-forwards for a deployment (for example, before shutting down
your machine):

```bash
solo deployment port-forwards stop --deployment one-shot
```

This closes the underlying `kubectl port-forward` processes and removes them
from the deployment's remote config, so they are not restored automatically.
Run `solo deployment port-forwards refresh --deployment one-shot` afterward to
re-establish them.
