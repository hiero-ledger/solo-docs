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

The variables on this page configure **Solo itself**. They are not the same as the
variables Solo passes on to the external tools it runs (`helm`, `kubectl`, `kind`).
Those are filtered by an allowlist — see
[Subprocess Environment Filtering]({{< relref "subprocess-environment-filtering.md" >}})
if a variable you set is not reaching one of those tools.

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
| `SOLO_DEV_OUTPUT` | Treat all commands as if the `--debug` flag were specified (`--debug` was formerly `--dev`) | `false`
| `SOLO_CHAIN_ID` | Chain ID of the Solo network | `298`
| `FORCE_PODMAN` | Force the use of Podman as the container engine when creating a new local cluster. Accepted values: `true`, `false` | `false`

---

## Feature Flags

A feature flag is a boolean that turns a piece of Solo behaviour on or off without a
command-line flag. **Requires Solo v0.92.0 or later**; on earlier releases each of these
was an ad-hoc variable with its own parsing rules.

| Flag | What it does | Default
| --- | --- | ---
| `SOLO_FF_SKIP_NODE_PING` | Skip the SDK health ping against consensus nodes | `false`
| `SOLO_FF_ENABLE_IMAGE_CACHE` | Cache container images locally during `solo one-shot` deploys | `true`
| `SOLO_FF_DISABLE_BLOCK_NODE_INTEGRATION` | Stop Solo configuring Mirror Node importer Spring profiles for block-node integration | `false`
| `EXPERIMENTAL_COPY_WRAPS_LIB_IN_PARALLEL` | Copy the WRAPS library to consensus nodes in parallel instead of one at a time. See [Node Client Behaviour](#node-client-behaviour) for the trade-off | `false`

### Accepted values

A flag accepts `true`, `false`, `1` or `0`, in any case and ignoring surrounding
whitespace. Any other value — `yes`, `off`, `2` — is rejected at startup with an error
naming the variable, rather than being silently treated as "on". An empty or
whitespace-only value counts as unset and falls back to the default.

### Alternative names

Each flag answers to several names. When more than one is set, the highest in this table
wins:

| Form | Precedence | Example
| --- | --- | ---
| `SOLO_FEATURE_FLAGS_<NAME>` | Highest. Generated from the config path, always available | `SOLO_FEATURE_FLAGS_SKIP_NODE_PING`
| `SOLO_FF_<NAME>` | The short form, and the name to use for a standard flag | `SOLO_FF_SKIP_NODE_PING`
| `EXPERIMENTAL_<NAME>` | Same level as `SOLO_FF_*`; the name a flag carries while experimental | `EXPERIMENTAL_COPY_WRAPS_LIB_IN_PARALLEL`
| the older ad-hoc name | Lowest. Kept working so existing scripts need no change; prefer `SOLO_FF_*` in new work | `SKIP_NODE_PING`

Setting two spellings of the same flag at once is allowed; Solo logs which one won.

### Changes in v0.92.0

The older names below keep working, but the values they accept have changed. Check any
script or CI job that sets them:

| Variable | Before v0.92.0 | From v0.92.0
| --- | --- | ---
| `SKIP_NODE_PING` | **Any** non-empty value skipped the ping, `false` and `0` included | `false` and `0` mean "do not skip"
| `ENABLE_IMAGE_CACHE` | Only the exact lowercase text `false` disabled the cache | `false`, `FALSE` and `0` all disable it; `no` and `off` are now errors
| `DISABLE_IMPORTER_SPRING_PROFILES` | Only the exact lowercase text `true` had any effect | `TRUE`, `True` and `1` also disable block-node integration
| `EXPERIMENTAL_COPY_WRAPS_LIB_IN_PARALLEL` | Only the exact lowercase text `true` had any effect | `TRUE` and `1` also enable it; a number such as `4` is now an error

---

## Configuration Overrides

Solo's configuration schema covers Helm chart coordinates and TSS timings. Any field in
it can be overridden with an environment variable named `SOLO_` followed by the property
path in `UPPER_SNAKE_CASE`, with both nesting levels and word boundaries written as `_`:

| Config property | Environment variable | Default
| --- | --- | ---
| `tss.readyMaxAttempts` | `SOLO_TSS_READY_MAX_ATTEMPTS` | `60`
| `tss.readyBackoffSeconds` | `SOLO_TSS_READY_BACKOFF_SECONDS` | `3`
| `tss.timeoutAfterReadySeconds` | `SOLO_TSS_TIMEOUT_AFTER_READY_SECONDS` | `10`
| `tss.messageSizeSoftLimitBytes` | `SOLO_TSS_MESSAGE_SIZE_SOFT_LIMIT_BYTES` | `4194304`
| `tss.messageSizeHardLimitBytes` | `SOLO_TSS_MESSAGE_SIZE_HARD_LIMIT_BYTES` | `37748736`
| `tss.wraps.libraryDownloadUrl` | `SOLO_TSS_WRAPS_LIBRARY_DOWNLOAD_URL` | `https://builds.hedera.com/tss/hiero/wraps/v1.0/wraps-v1.0.0.tar.gz`
| `tss.wraps.directoryName` | `SOLO_TSS_WRAPS_DIRECTORY_NAME` | `wraps-v1.0.0`
| `helmChart.directory` | `SOLO_HELM_CHART_DIRECTORY` | unset
| `helmChart.version` | `SOLO_HELM_CHART_VERSION` | from the release
| `ingressControllerHelmChart.version` | `SOLO_INGRESS_CONTROLLER_HELM_CHART_VERSION` | from the release

> **Important:** These overrides are read and applied from **Solo v0.92.0 onwards**. On
> earlier releases the configuration layer was never loaded, so setting any of them had
> no effect. If you have one of these set from an earlier experiment, it will start
> taking effect when you upgrade.

Numeric fields accept an integer or decimal literal and boolean fields the values listed
under [Accepted values](#accepted-values); anything else fails at startup with an error
naming the variable. A `SOLO_*` variable that does not match a configuration property —
`SOLO_HOME`, `SOLO_CHART_VERSION` and the rest of this page — is left alone.

---

## Network and Node Identity

| Environment Variable | Description | Default Value
| --- | --- | ---
| `DEFAULT_START_ID_NUMBER` | Raw node ID number for the first consensus node. The first node account ID is resolved as `0.0.<DEFAULT_START_ID_NUMBER>` | `3`
| `SOLO_NODE_INTERNAL_GOSSIP_PORT` | Internal gossip port used by the Hiero network | `50111`
| `SOLO_NODE_EXTERNAL_GOSSIP_PORT` | External gossip port used by the Hiero network | `50111`
| `SOLO_NODE_DEFAULT_STAKE_AMOUNT` | Default stake amount for a node | `500`
| `GRPC_PORT` | Local port-forward for consensus node gRPC. Default is `35211` for Solo 0.63+ (changed from `50211` to avoid Windows ephemeral-port conflicts). See [Port availability](/docs/using-solo/endpoints#port-availability). | `35211`
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
| `EXPERIMENTAL_COPY_WRAPS_LIB_IN_PARALLEL` | Copy the WRAPS proving-key library to every consensus node concurrently during `solo network deploy`, instead of one node at a time. Concurrent copies finish faster on a network deploy with many nodes and ample bandwidth, but can saturate a constrained connection when several multi-hundred-megabyte copies run at once. This is a feature flag — see [Accepted values](#accepted-values) | `false`
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
| `STATE_DOWNLOAD_STABLE_MAX_ATTEMPTS` | Maximum number of attempts to check whether a consensus node's saved state has stopped changing on disk, before `solo consensus state download` archives it and before `solo consensus network freeze` stops the nodes | `180`
| `STATE_DOWNLOAD_STABLE_DELAY` | Interval between saved state stability checks, in milliseconds | `2000`
| `STATE_DOWNLOAD_STABLE_POLLS_REQUIRED` | Number of consecutive checks that must report an unchanged saved state before it is treated as stable | `3`

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
| `SOLO_FF_DISABLE_BLOCK_NODE_INTEGRATION` | Disable automatic configuration of Mirror Node importer Spring profiles for block-node integration. See [Feature Flags](#feature-flags). **Requires Solo v0.92.0 or later**; before that, use `DISABLE_IMPORTER_SPRING_PROFILES`. | `false`
| `DISABLE_IMPORTER_SPRING_PROFILES` | The older name for the flag above. Still honoured, but `SOLO_FF_DISABLE_BLOCK_NODE_INTEGRATION` takes precedence when both are set. From v0.92.0 it also accepts `TRUE`, `True` and `1`. | `false`
| `SPRING_PROFILES_ACTIVE` | Spring profiles to use for the Mirror Node importer when automatic importer profile configuration is enabled. | `blocknode`
| `MIRROR_NODE_SCHEMA_READY_MAX_ATTEMPTS` | Maximum number of attempts to check if the Mirror Node database schema has been built (signalled by importer pod readiness) | `900`
| `MIRROR_NODE_SCHEMA_READY_DELAY` | Interval between Mirror Node database schema checks, in milliseconds | `2000`
| `MIRROR_NODE_IMPORTER_DETECT_MAX_ATTEMPTS` | Maximum number of attempts to detect a running Mirror Node importer pod. If no importer pod is found, the database schema wait is skipped | `15`
| `MIRROR_NODE_IMPORTER_DETECT_DELAY` | Interval between Mirror Node importer pod detection attempts, in milliseconds | `2000`
| `MIRROR_NODE_CHART_UPGRADE_MAX_ATTEMPTS` | Maximum number of attempts to install or upgrade the Mirror Node Helm chart before failing. Retries ride out transient Kubernetes API server outages | `3`
| `MIRROR_NODE_CHART_UPGRADE_RETRY_DELAY_SECS` | Delay between Mirror Node Helm chart install/upgrade attempts, in seconds | `15`

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
| `SOLO_CHEETAH_VERSION` | Image version for the solo-deployment chart's Cheetah component
| `SOLO_CONTAINERS_VERSION` | Image version for the solo-deployment chart's Solo containers component
| `MINIO_OPERATOR_VERSION` | Release version of the MinIO Operator to use
| `PROMETHEUS_STACK_VERSION` | Release version of the Prometheus Stack to use
| `GRAFANA_ALLOY_VERSION` | [Helm chart version](https://github.com/grafana/helm-charts/releases?q=alloy) of Grafana Alloy installed by `solo cluster-ref config setup --grafana-alloy`
| `LOKI_VERSION` | [Helm chart version](https://github.com/grafana/loki/releases?q=helm-loki) of the Loki log store installed by `solo cluster-ref config setup --grafana-alloy`
| `GRAFANA_PODLOGS_CRD_VERSION` | [Grafana Alloy release tag](https://github.com/grafana/alloy/releases) the PodLogs custom resource definition is fetched from during `solo network deploy --enable-monitoring-support`

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
| `GRAFANA_ALLOY_CHART_URL` | Helm chart repository URL for Grafana Alloy | `https://grafana.github.io/helm-charts`
| `LOKI_CHART_URL` | Helm chart repository URL for Loki | `https://grafana.github.io/helm-charts`
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

## Image Cache

Solo caches the container images it deploys as local archives to speed up
repeat deployments. The cache is enabled by default; these variables disable it
per context. See [Solo Image Cache](/docs/advanced-solo-setup/image-cache) for
the full feature and the `solo cache image` commands.

| Environment Variable | Description | Default
| --- | --- | ---
| `SOLO_FF_ENABLE_IMAGE_CACHE` | Set to `false` or `0` to disable the image cache during `solo one-shot` deploys. See [Feature Flags](#feature-flags). **Requires Solo v0.92.0 or later**; before that, use `ENABLE_IMAGE_CACHE`. | enabled
| `ENABLE_IMAGE_CACHE` | The older name for the flag above. Still honoured, but `SOLO_FF_ENABLE_IMAGE_CACHE` takes precedence when both are set. **Requires Solo v0.78.0 or later** (earlier releases have an inverted-logic bug in this flag). From v0.92.0 it also accepts `FALSE` and `0`, and rejects `no` and `off` instead of ignoring them. | enabled
| `SOLO_NO_CACHE` | Set to `true` to skip the image pull during an npm global install. | enabled
| `HOMEBREW_NO_SOLO_CACHE` | Set to any value to skip the image pull during a Homebrew install. | enabled
| `CACHE_IMAGE_MAX_CONCURRENCY` | Max concurrent image cache pull/load operations | 12

> **Note:** The cached component versions follow the same environment-variable
> mechanism as [Pinning Component Versions](#pinning-component-versions) above -
> the `*_VERSION` environment variables affect the images the cache pulls, but
> the `--*-version` CLI flags do not.
