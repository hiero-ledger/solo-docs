---
title: "Using Environment Variables"
weight: 1
description: >
  A comprehensive reference of all environment variables supported by Solo,
  including their purposes, default values, and expected formats. Configure
  Solo deployments through environment variable tuning.
categories: ["Reference", "Advanced"]
tags: ["advanced", "operator", "configuration", "cli"]
type: docs
nav_next: /docs/advanced-solo-setup/network-deployments/
---

## Overview

Solo supports a set of environment variables that let you customize its
behaviour without modifying command-line flags on every run. Variables set
in your shell environment take effect automatically for all subsequent Solo
commands.

### Setting environment variables

How you set a variable depends on your shell. Use the tab for your platform:

{{< tabpane text=true >}}
{{% tab header="Bash / Zsh" lang="bash" %}}
```bash
# For a single command only
CONSENSUS_NODE_VERSION=v0.73.0 solo one-shot single deploy

# For the current session
export CONSENSUS_NODE_VERSION=v0.73.0

# Persist across sessions (add to ~/.bashrc or ~/.zshrc)
echo 'export CONSENSUS_NODE_VERSION=v0.73.0' >> ~/.zshrc
```
{{% /tab %}}
{{% tab header="PowerShell" lang="powershell" %}}
```powershell
# For the current session
$env:CONSENSUS_NODE_VERSION = 'v0.73.0'

# Persist for your user (all future sessions)
[System.Environment]::SetEnvironmentVariable('CONSENSUS_NODE_VERSION', 'v0.73.0', 'User')

# Or add it to your PowerShell profile
Add-Content $PROFILE '$env:CONSENSUS_NODE_VERSION = "v0.73.0"'
```
{{% /tab %}}
{{< /tabpane >}}

> **Tip:** Variables set in your shell environment (or persisted as shown above) take effect automatically for all subsequent Solo commands.

## General

| Environment Variable | Description | Default Value
| --- | --- | ---
| `SOLO_HOME` | Path to the Solo cache and log files | `~/.solo`
| `SOLO_CACHE_DIR` | Path to the Solo cache directory | `~/.solo/cache`
| `SOLO_LOG_LEVEL` | Logging level for Solo operations. Accepted values: `trace`, `debug`, `info`, `warn`, `error` | `info`
| `SOLO_DEV_OUTPUT` | Treat all commands as if the `--dev` flag were specified | `false`
| `SOLO_CHAIN_ID` | Chain ID of the Solo network | `298`
| `FORCE_PODMAN` | Force the use of Podman as the container engine when creating a new local cluster. Accepted values: `true`, `false` | `false`

---

## Network and Node Identity

| Environment Variable | Description | Default Value
| --- | --- | ---
| `DEFAULT_START_ID_NUMBER` | Raw node ID number for the first consensus node. The first node account ID is resolved as `0.0.<DEFAULT_START_ID_NUMBER>` | `3`
| `SOLO_NODE_INTERNAL_GOSSIP_PORT` | Internal gossip port used by the Hiero network | `50111`
| `SOLO_NODE_EXTERNAL_GOSSIP_PORT` | External gossip port used by the Hiero network | `50111`
| `SOLO_NODE_DEFAULT_STAKE_AMOUNT` | Default stake amount for a node | `500`
| `GRPC_PORT` | Local port-forward for consensus node gRPC. Default is `35211` for Solo 0.63+ (changed from `50211` to avoid Windows ephemeral-port conflicts). See [Port availability](/docs/simple-solo-setup/quickstart#port-availability). | `35211`
| `LOCAL_NODE_START_PORT` | Local node start port for the Solo network | `30212`

---

## Operator and Key Configuration

| Environment Variable | Description | Default Value
| --- | --- | ---
| `SOLO_OPERATOR_ID` | Operator account ID for the Solo network | `0.0.2`
| `SOLO_OPERATOR_KEY` | Operator private key for the Solo network | `302e020100...`
| `SOLO_OPERATOR_PUBLIC_KEY` | Operator public key for the Solo network | `302a300506...`
| `FREEZE_ADMIN_ACCOUNT` | Freeze admin account ID for the Solo network | `0.0.58`
| `GENESIS_KEY` | Genesis private key for the Solo network | `302e020100...`

> **Note:** Full key values are omitted above for readability. Refer to the
> [source defaults](https://github.com/hiero-ledger/solo) for complete key strings.

---

## Node Client Behaviour

| Environment Variable | Description | Default Value
| --- | --- | ---
| `NODE_CLIENT_MIN_BACKOFF` | Minimum wait time between retries, in milliseconds | `1000`
| `NODE_CLIENT_MAX_BACKOFF` | Maximum wait time between retries, in milliseconds | `1000`
| `NODE_CLIENT_REQUEST_TIMEOUT` | Time a transaction or query retries on a "busy" network response, in milliseconds | `600000`
| `NODE_CLIENT_MAX_ATTEMPTS` | Maximum number of attempts for node client operations | `600`
| `NODE_CLIENT_SDK_PING_MAX_RETRIES` | Maximum number of retries for node health pings | `5`
| `NODE_CLIENT_SDK_PING_RETRY_INTERVAL` | Interval between node health ping retries, in milliseconds | `10000`
| `NODE_COPY_CONCURRENT` | Number of concurrent threads used when copying files to a node | `4`
| `LOCAL_BUILD_COPY_RETRY` | Number of retries for local build copy operations | `3`
| `ACCOUNT_UPDATE_BATCH_SIZE` | Number of accounts to update in a single batch operation | `10`

---

## Pod and Network Readiness

| Environment Variable | Description | Default Value
| --- | --- | ---
| `PODS_RUNNING_MAX_ATTEMPTS` | Maximum number of attempts to check if pods are running | `900`
| `PODS_RUNNING_DELAY` | Interval between pod running checks, in milliseconds | `1000`
| `PODS_READY_MAX_ATTEMPTS` | Maximum number of attempts to check if pods are ready | `300`
| `PODS_READY_DELAY` | Interval between pod ready checks, in milliseconds | `2000`
| `NETWORK_NODE_ACTIVE_MAX_ATTEMPTS` | Maximum number of attempts to check if network nodes are active | `300`
| `NETWORK_NODE_ACTIVE_DELAY` | Interval between network node active checks, in milliseconds | `1000`
| `NETWORK_NODE_ACTIVE_TIMEOUT` | Maximum wait time for network nodes to become active, in milliseconds | `1000`
| `NETWORK_PROXY_MAX_ATTEMPTS` | Maximum number of attempts to check if the network proxy is running | `300`
| `NETWORK_PROXY_DELAY` | Interval between network proxy checks, in milliseconds | `2000`
| `NETWORK_DESTROY_WAIT_TIMEOUT` | Maximum wait time for network teardown to complete, in milliseconds | `120`

---

## Block Node

| Environment Variable | Description | Default Value
| --- | --- | ---
| `BLOCK_NODE_PODS_RUNNING_MAX_ATTEMPTS` | Maximum number of attempts to check if block node pods are running | `900`
| `BLOCK_NODE_PODS_RUNNING_DELAY` | Interval between block node pod running checks, in milliseconds | `1000`
| `BLOCK_NODE_ACTIVE_MAX_ATTEMPTS` | Maximum number of attempts to check if block nodes are active | `100`
| `BLOCK_NODE_ACTIVE_DELAY` | Interval between block node active checks, in milliseconds | `60`
| `BLOCK_NODE_ACTIVE_TIMEOUT` | Maximum wait time for block nodes to become active, in milliseconds | `60`
| `BLOCK_STREAM_STREAM_MODE` | The `blockStream.streamMode` value in consensus node application properties. Only applies when a Block Node is deployed | `BOTH`
| `BLOCK_STREAM_WRITER_MODE` | The `blockStream.writerMode` value in consensus node application properties. Only applies when a Block Node is deployed | `FILE_AND_GRPC`

---

## Relay Node

| Environment Variable | Description | Default Value
| --- | --- | ---
| `RELAY_PODS_RUNNING_MAX_ATTEMPTS` | Maximum number of attempts to check if relay pods are running | `900`
| `RELAY_PODS_RUNNING_DELAY` | Interval between relay pod running checks, in milliseconds | `1000`
| `RELAY_PODS_READY_MAX_ATTEMPTS` | Maximum number of attempts to check if relay pods are ready | `100`
| `RELAY_PODS_READY_DELAY` | Interval between relay pod ready checks, in milliseconds | `1000`

## Mirror Node

| Environment Variable | Description | Default Value
| --- | --- | ---
| `DISABLE_IMPORTER_SPRING_PROFILES` | Disable automatic configuration of Mirror Node importer Spring profiles for block-node integration. | `false`                                                                                            |
| `SPRING_PROFILES_ACTIVE` | Spring profiles to use for the Mirror Node importer when automatic importer profile configuration is enabled. | `blocknode`                                                                                        |

---

## Load Balancer

| Environment Variable | Description | Default Value
| --- | --- | ---
| `LOAD_BALANCER_CHECK_DELAY_SECS` | Delay between load balancer status checks, in seconds | `5`
| `LOAD_BALANCER_CHECK_MAX_ATTEMPTS` | Maximum number of attempts to check load balancer status | `60`

---

## Lease Management

| Environment Variable | Description | Default Value
| --- | --- | ---
| `SOLO_LEASE_ACQUIRE_ATTEMPTS` | Number of attempts to acquire a lock before failing | `10`
| `SOLO_LEASE_DURATION` | Duration in seconds for which a lock is held before expiration | `20`

---

## Component Versions

| Environment Variable | Description
| --- | ---
| `CONSENSUS_NODE_VERSION` | [Release version](https://github.com/hiero-ledger/hiero-consensus-node/releases) of the Consensus Node to use
| `BLOCK_NODE_VERSION` | [Release version](https://github.com/hiero-ledger/hiero-block-node/releases) of the Block Node to use
| `MIRROR_NODE_VERSION` | [Release version](https://github.com/hiero-ledger/hiero-mirror-node/releases) of the Mirror Node to use
| `EXPLORER_VERSION` | [Release version](https://github.com/hiero-ledger/hiero-mirror-node-explorer/releases) of the Explorer to use
| `RELAY_VERSION` | [Release version](https://github.com/hiero-ledger/hiero-json-rpc-relay/releases) of the JSON-RPC Relay to use
| `INGRESS_CONTROLLER_VERSION` | [Release version](https://haproxy-ingress.github.io/) of the HAProxy Ingress Controller to use
| `SOLO_CHART_VERSION` | Release version of the Solo Helm charts to use
| `MINIO_OPERATOR_VERSION` | Release version of the MinIO Operator to use
| `PROMETHEUS_STACK_VERSION` | Release version of the Prometheus Stack to use
| `GRAFANA_AGENT_VERSION` | Release version of the Grafana Agent to use

> **Tip:** To pin component versions for a `solo one-shot single deploy`, prefix
> the command with these variables. See the
> [One-Shot Deployment](#one-shot-deployment) section below for an example.

---

## Edge Component Versions

These variables only take effect when `solo one-shot single deploy` or
`solo one-shot multi deploy` is invoked with the `--edge` flag (`solo one-shot
falcon deploy` does not accept `--edge` in v0.72.0). They let you point a
one-shot deploy at arbitrary component tags — release candidates,
pre-releases, or any other tag the component's registry exposes — without
rebuilding Solo.

| Component       | Environment Variable           | Falls back to              |
| --------------- | ------------------------------ | -------------------------- |
| Consensus Node  | `CONSENSUS_NODE_EDGE_VERSION`  | `CONSENSUS_NODE_VERSION`   |
| Mirror Node     | `MIRROR_NODE_EDGE_VERSION`     | `MIRROR_NODE_VERSION`      |
| JSON-RPC Relay  | `RELAY_EDGE_VERSION`           | `RELAY_VERSION`            |
| Explorer        | `EXPLORER_EDGE_VERSION`        | `EXPLORER_VERSION`         |
| Block Node      | `BLOCK_NODE_EDGE_VERSION`      | `BLOCK_NODE_VERSION`       |
| Solo Chart      | `SOLO_CHART_EDGE_VERSION`      | `SOLO_CHART_VERSION`       |

Set only the variables for components you want to override; the rest use their
compiled-in edge defaults. Without `--edge`, every `*_EDGE_VERSION` variable is
ignored.

For full usage, examples, version-format rules, and troubleshooting, see
[One-Shot Deploy with Custom Component Versions](/docs/advanced-solo-setup/one-shot-deploy-with-custom-versions).

---

## Helm Chart URLs

| Environment Variable | Description | Default Value
| --- | --- | ---
| `JSON_RPC_RELAY_CHART_URL` | Helm chart repository URL for the JSON-RPC Relay | `https://hiero-ledger.github.io/hiero-json-rpc-relay/charts`
| `MIRROR_NODE_CHART_URL` | Helm chart repository URL for the Mirror Node | `https://hashgraph.github.io/hedera-mirror-node/charts`
| `EXPLORER_CHART_URL` | Helm chart repository URL for the Explorer | `oci://ghcr.io/hiero-ledger/hiero-mirror-node-explorer/hiero-explorer-chart`
| `INGRESS_CONTROLLER_CHART_URL` | Helm chart repository URL for the ingress controller | `https://haproxy-ingress.github.io/charts`
| `PROMETHEUS_OPERATOR_CRDS_CHART_URL` | Helm chart repository URL for the Prometheus Operator CRDs | `https://prometheus-community.github.io/helm-charts`
| `NETWORK_LOAD_GENERATOR_CHART_URL` | Helm chart repository URL for the Network Load Generator | `oci://swirldslabs.jfrog.io/load-generator-helm-release-local`

---

## Network Load Generator

| Environment Variable | Description | Default Value
| --- | --- | ---
| `NETWORK_LOAD_GENERATOR_CHART_VERSION` | Release version of the Network Load Generator Helm chart to use | `v0.7.0`
| `NETWORK_LOAD_GENERATOR_PODS_RUNNING_MAX_ATTEMPTS` | Maximum number of attempts to check if Network Load Generator pods are running | `900`
| `NETWORK_LOAD_GENERATOR_POD_RUNNING_DELAY` | Interval between Network Load Generator pod running checks, in milliseconds | `1000`

---

## One-Shot Deployment

| Environment Variable | Description | Default Value
| --- | --- | ---
| `ONE_SHOT_WITH_BLOCK_NODE` | Deploy Block Node as part of a one-shot deployment | `false`
| `MIRROR_NODE_PINGER_TPS` | Transactions per second for the Mirror Node monitor pinger. Set to `0` to disable | `5`
| `CONSENSUS_NODE_EDGE_VERSION` | Edge (newer-than-default) consensus node version used by `--edge` in one-shot deploys. Falls back to `CONSENSUS_NODE_VERSION`. | `v0.74.0-rc.1`
| `MIRROR_NODE_EDGE_VERSION` | Edge mirror node version used by `--edge` in one-shot deploys. Falls back to `MIRROR_NODE_VERSION`. | `v0.153.1`
| `EXPLORER_EDGE_VERSION` | Edge explorer version used by `--edge` in one-shot deploys. Falls back to `EXPLORER_VERSION`. | `26.0.0`
| `RELAY_EDGE_VERSION` | Edge relay version used by `--edge` in one-shot deploys. Falls back to `RELAY_VERSION`. | `0.76.2`
| `BLOCK_NODE_EDGE_VERSION` | Edge block node version used by `--edge` in one-shot deploys. Falls back to `BLOCK_NODE_VERSION`. | `0.31.0`

### Pinning Component Versions

`solo one-shot single deploy` does not yet expose CLI flags for pinning
individual component versions. To run a one-shot deployment against specific
releases, prefix the command with the
[Component Versions](#component-versions) environment variables:

```bash
CONSENSUS_NODE_VERSION=v0.73.0 MIRROR_NODE_VERSION=v0.153.1 solo one-shot single deploy
```

Any of the `*_VERSION` variables listed in
[Component Versions](#component-versions) can be combined in the same command
to pin multiple components at once.

> **Note:**
>
> - This is the current recommended approach for version pinning in one-shot
>   deployments.
> - CLI flags for version overrides on `one-shot` are planned for Q2 — tracked
>   in [hiero-ledger/solo#4242](https://github.com/hiero-ledger/solo/issues/4242).
> - Environment variables will remain valid for one-off overrides after the
>   CLI flags land, so the form above will continue to work.
