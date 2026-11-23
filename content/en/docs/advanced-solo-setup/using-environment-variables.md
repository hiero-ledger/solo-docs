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
icon: "fas fa-cog"
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

### How Solo reads values

- An empty or whitespace-only value is treated as unset, so the default applies.
- For most numeric variables, `0` or a value that is not a number also falls
  back to the default. To turn a feature off, use the flag or variable that
  controls it instead of setting a number to `0`.
- Solo prints `>> environment variable '<NAME>' exists, using its value` each
  time it reads a variable that is set. Set `SOLO_SILENT_MODE=true` to suppress
  this and other terminal output.

## General

| Environment Variable | Description | Default Value
| --- | --- | ---
| `SOLO_HOME` | Path to the Solo cache and log files | `~/.solo`
| `SOLO_CACHE_DIR` | Path to the Solo cache directory | `~/.solo/cache`
| `SOLO_LOG_LEVEL` | Logging level for Solo operations. Accepted values: `trace`, `debug`, `info`, `warn`, `error` | `info`
| `SOLO_DEV_OUTPUT` | Treat all commands as if the `--debug` flag were specified (`--debug` was formerly `--dev`). Any non-empty value turns it on, including `false`; unset the variable to turn it off | unset (off)
| `SOLO_SILENT_MODE` | Machine-friendly silent mode: suppresses Solo's terminal output and task progress, and prints errors as JSON on stderr. Only the exact value `true` turns it on | `false`
| `SOLO_CHAIN_ID` | Default for the `--chain-id` flag. **Solo v0.99.0 and later:** a command that runs against an existing deployment uses the chain ID stored for that deployment unless `--chain-id` is passed, so this variable only applies to new deployments and to deployments without a stored chain ID | `298`
| `SOLO_DEPLOYMENT` | Default for the `--deployment` flag, used when the flag is not passed. When neither is set and the local configuration has exactly one deployment, Solo selects it automatically | unset
| `FORCE_PODMAN` | Force the use of Podman as the container engine when creating a new local cluster. Accepted values: `true`, `false` | `false`
| `KUBECONFIG` | Kubeconfig file, or `:`-separated list of files, that Solo uses to reach your clusters. When Solo creates the local cluster with rootful Podman on Linux, kind writes the `kind-kind` cluster, context and user into the first listed file that exists, else into the last listed file | `~/.kube/config`
| `GITHUB_TOKEN` | GitHub token Solo sends as a bearer token on its requests to `github.com` and `api.github.com` (release lookups for `--edge`, the image cache manifest, CLI tool downloads). Raises the GitHub API rate limit from 60 to 5,000 requests per hour, which avoids rate-limit failures on shared CI runners | unset
| `GH_TOKEN` | Used in place of `GITHUB_TOKEN` when `GITHUB_TOKEN` is not set. The PodLogs CRD download in `solo consensus network deploy --enable-monitoring-support` reads only `GITHUB_TOKEN` | unset

---

## Local Kind Cluster

These variables apply when Solo creates a local Kind cluster.

| Environment Variable | Description | Default Value
| --- | --- | ---
| `SOLO_KIND_CLUSTER_CONFIG_FILE` | Path to a Kind cluster configuration file to use instead of Solo's bundled one. Setting it also turns off the small-memory cluster configuration and the one-shot host port mappings that the bundled configuration provides, so Solo falls back to `kubectl` port-forwards | `resources/kind-config.yaml` (bundled with Solo)
| `SOLO_KIND_NODE_IMAGE` | Kind node image for the cluster. Pin it with a tag and digest | `kindest/node:v1.31.9@sha256:b94a3a6c06198d17f59cca8c6f486236fa05e2fb359cbd75dabbfc348a10b211`
| `KIND_IMAGE` | Alternative name for `SOLO_KIND_NODE_IMAGE`, read only when `SOLO_KIND_NODE_IMAGE` is not set. Prefer `SOLO_KIND_NODE_IMAGE` | unset
| `KIND_EXPERIMENTAL_PROVIDER` | Kind's own provider variable. Solo also reads it to decide which container engine runs the Kind node containers: `podman` makes Solo check Podman first, any other value or unset checks Docker first. Solo sets it to `podman` for the `kind` commands it runs when it creates the cluster with Podman | unset

---

## Network and Node Identity

| Environment Variable | Description | Default Value
| --- | --- | ---
| `DEFAULT_START_ID_NUMBER` | Raw node ID number for the first consensus node. The first node account ID is resolved as `0.0.<DEFAULT_START_ID_NUMBER>` | `3`
| `SOLO_NODE_INTERNAL_GOSSIP_PORT` | Internal gossip port used by the Hiero network | `50111`
| `SOLO_NODE_EXTERNAL_GOSSIP_PORT` | External gossip port used by the Hiero network | `50111`
| `SOLO_NODE_DEFAULT_STAKE_AMOUNT` | Default stake amount for a node | `500`
| `GRPC_PORT` | Consensus node gRPC port inside the cluster. Solo writes it into the node service endpoints and port-forwards to it. Not the local port: see `GRPC_LOCAL_PORT` | `50211`
| `GRPC_LOCAL_PORT` | Base local port for the consensus node gRPC port-forward. Each node uses this port plus its node ID (node1 uses the base port, node2 the next one, and so on). Default is `35211` for Solo 0.63+ (changed from `50211` to avoid Windows ephemeral-port conflicts). See [Port availability](/docs/using-solo/endpoints#port-availability). | `35211`
| `GRPC_WEB_PORT` | Port Solo uses for a gRPC Web endpoint given without a port in `--grpc-web-endpoint` or `--grpc-web-endpoints` | `8080`
| `LOCAL_NODE_START_PORT` | Local node start port for the Solo network | `30212`
| `JAVA_FLIGHT_RECORDER_CONFIGURATION` | Path to a Java Flight Recorder configuration file for the consensus nodes. Used by `solo consensus network deploy` when `--jfr-config` is not passed | unset
| `SOLO_LOCAL_BUILD_PATH` | Default for the `--local-build-path` flag: path to a local consensus node build to copy to the nodes instead of a released version | unset
| `NETWORK_NODE_LIFECYCLE_MODE` | Selects the root container image Solo uses to run each consensus node and how it starts and stops the node process. Accepted values: `solo-container` (the solo-containers image, controlled by its `/command/network-node-lifecycle` helper) and `consensus-node-image` (the hiero-consensus-node deterministic image `gcr.io/hedera-registry/consensus-node:<version>`, whose platform jars are baked in and which Solo controls with `s6-svc`). In `consensus-node-image` mode Solo sets `AUTO_START_CONSENSUS_SERVICE=false`, skips the *Fetch platform software* step, and installs `zip`, `unzip` and `curl` in the root container. Version upgrade (`solo consensus network upgrade`) is not supported in `consensus-node-image` mode yet | `solo-container`

---

## Operator and Key Configuration

| Environment Variable | Description | Default Value
| --- | --- | ---
| `SOLO_OPERATOR_ID` | Account number of the operator account. Solo builds the account ID as `<shard>.<realm>.<SOLO_OPERATOR_ID>`, so set the number only (`2`, not `0.0.2`); a full account ID is not a number and falls back to the default | `2`
| `SOLO_OPERATOR_KEY` | Operator private key for the Solo network | `302e020100...`
| `SOLO_OPERATOR_PUBLIC_KEY` | Operator public key for the Solo network | `302a300506...`
| `FREEZE_ADMIN_ACCOUNT` | Account number of the freeze admin account. Like `SOLO_OPERATOR_ID`, set the number only (`58`, not `0.0.58`) | `58`
| `GENESIS_KEY` | ED25519 genesis private key for a new Solo network. At `solo consensus network deploy` Solo stores it in the `genesis-key` Kubernetes secret and sets the genesis public key of the consensus nodes to match. Later commands read the secret first, then this variable | `302e020100...`

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
| `NODE_CLIENT_MAX_QUERY_PAYMENT` | Maximum query payment the node client allows, in hbar | `20`
| `NODE_CLIENT_SDK_PING_MAX_RETRIES` | Maximum number of retries for node health pings | `5`
| `NODE_CLIENT_SDK_PING_RETRY_INTERVAL` | Interval between node health ping retries, in milliseconds | `10000`
| `NODE_COPY_CONCURRENT` | Number of concurrent threads used when copying files to a node | `4`
| `LOCAL_BUILD_COPY_RETRY` | Number of retries for local build copy operations | `3`
| `CONTAINER_COPY_MAX_ATTEMPTS` | Maximum number of attempts for each `kubectl cp` copy between your machine and a pod container, and for copying and verifying local build jars on a consensus node | `3`
| `CONTAINER_COPY_BACKOFF_MS` | Base delay between `kubectl cp` retries, in milliseconds. The delay grows linearly: attempt × this value | `300`
| `CHECK_WRAPS_DIRECTORY_MAX_ATTEMPTS` | **Deprecated since Solo v0.94.0** (consensus node v0.79.0 and later embed the WRAPS proving parameters). Maximum number of checks that the WRAPS proving key directory exists on each consensus node after Solo copies it | `10`
| `CHECK_WRAPS_DIRECTORY_BACKOFF_MS` | **Deprecated since Solo v0.94.0.** Interval between WRAPS directory checks, in milliseconds | `2000`
| `ACCOUNT_UPDATE_BATCH_SIZE` | Number of accounts to update in a single batch operation | `10`
| `TRIGGER_STAKE_WEIGHT_CALCULATE_WAIT_SECONDS` | Wait before Solo triggers the stake weight recalculation after `solo consensus node add`, `update` or `destroy`, in seconds | `60`

> **Note:** The WRAPS library copy toggle formerly documented here as
> `EXPERIMENTAL_COPY_WRAPS_LIB_IN_PARALLEL` is now a feature flag. See
> [Feature Flags](#feature-flags).

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
| `NETWORK_NODE_GRPC_READINESS_MAX_ATTEMPTS` | Maximum number of gRPC readiness checks Solo runs against a consensus node after it reports `ACTIVE`. If the node never passes, Solo prints a warning and continues | `20`
| `NETWORK_NODE_GRPC_READINESS_DELAY` | Interval between gRPC readiness checks, in milliseconds | `1000`
| `NETWORK_NODE_GRPC_READINESS_REQUIRED_SUCCESSES` | Number of consecutive successful gRPC checks required before a node is treated as ready | `3`
| `NETWORK_PROXY_MAX_ATTEMPTS` | Maximum number of attempts to check if the network proxy is running | `300`
| `NETWORK_PROXY_DELAY` | Interval between network proxy checks, in milliseconds | `2000`
| `NETWORK_CHART_INSTALL_MAX_ATTEMPTS` | Maximum number of attempts to install or upgrade the `solo-deployment` Helm chart during `solo consensus network deploy` before failing. Retries ride out transient Kubernetes API server outages | `3`
| `NETWORK_CHART_INSTALL_RETRY_DELAY_SECS` | Delay between `solo-deployment` chart install attempts, in seconds | `15`
| `NODE_POD_ROLLOUT_DETECTION_MAX_ATTEMPTS` | During `solo consensus network upgrade`, maximum number of checks for evidence that the Helm upgrade restarted a node pod. If no restart is detected, Solo does not wait for one | `20`
| `NODE_POD_ROLLOUT_DETECTION_DELAY` | Interval between node pod rollout checks, in milliseconds | `1500`
| `NETWORK_DESTROY_WAIT_TIMEOUT` | Maximum wait time for network teardown to complete, in seconds | `120`
| `STATE_DOWNLOAD_STABLE_MAX_ATTEMPTS` | Maximum number of attempts to check whether a consensus node's saved state has stopped changing on disk, before `solo consensus state download` archives it and before `solo consensus network freeze` stops the nodes | `180`
| `STATE_DOWNLOAD_STABLE_DELAY` | Interval between saved state stability checks, in milliseconds | `2000`
| `STATE_DOWNLOAD_STABLE_POLLS_REQUIRED` | Number of consecutive checks that must report an unchanged saved state before it is treated as stable | `3`
| `PVC_BOUND_MAX_ATTEMPTS` | Maximum number of attempts to check if consensus node persistent volume claims are bound. **Solo v0.99.0 and later** | `900`
| `PVC_BOUND_DELAY` | Interval between persistent volume claim bind checks, in milliseconds. **Solo v0.99.0 and later** | `1000`

---

## Block Node

| Environment Variable | Description | Default Value
| --- | --- | ---
| `BLOCK_NODE_PODS_RUNNING_MAX_ATTEMPTS` | Maximum number of attempts to check if block node pods are running | `900`
| `BLOCK_NODE_PODS_RUNNING_DELAY` | Interval between block node pod running checks, in milliseconds | `1000`
| `BLOCK_NODE_ACTIVE_MAX_ATTEMPTS` | Maximum number of attempts to check if block nodes are active | `100`
| `BLOCK_NODE_ACTIVE_DELAY` | Interval between block node active checks, in seconds | `60`
| `BLOCK_NODE_ACTIVE_TIMEOUT` | Maximum wait time for each block node health check, in seconds | `60`
| `BLOCK_NODE_PORT` | Block node gRPC port. Used for the block node entries Solo writes for the consensus nodes, for backfill sources, and as the default port of an external block node address given without one | `40840`
| `BLOCK_NODE_HEALTH_PORT` | Port Solo calls for the block node health check (`/healthz/readyz`) on block node v0.39.0 and later. Older block nodes serve health checks on `BLOCK_NODE_PORT` | `40983`
| `BLOCK_STREAM_STREAM_MODE` | The `blockStream.streamMode` value in consensus node application properties. Only applies when a Block Node is deployed. On consensus node v0.74.0 and later with block node integration and TSS enabled, the default is `BLOCKS`; with block node integration or TSS turned off, Solo uses `RECORDS` and ignores this variable | `BOTH` (`BLOCKS` on consensus node v0.74.0+)
| `BLOCK_STREAM_WRITER_MODE` | The `blockStream.writerMode` value in consensus node application properties. Only applies when a Block Node is deployed | `FILE_AND_GRPC`

---

## Relay Node

| Environment Variable | Description | Default Value
| --- | --- | ---
| `RELAY_PODS_RUNNING_MAX_ATTEMPTS` | Maximum number of attempts to check if relay pods are running | `900`
| `RELAY_PODS_RUNNING_DELAY` | Interval between relay pod running checks, in milliseconds | `1000`
| `RELAY_PODS_RUNNING_RUNNING_DELAY` | Misspelled legacy name for `RELAY_PODS_RUNNING_DELAY`, read only when `RELAY_PODS_RUNNING_DELAY` is not set. Kept only for backwards compatibility; use `RELAY_PODS_RUNNING_DELAY` | unset
| `RELAY_PODS_READY_MAX_ATTEMPTS` | Maximum number of attempts to check if relay pods are ready | `900`
| `RELAY_PODS_READY_DELAY` | Interval between relay pod ready checks, in milliseconds | `1000`
| `JSON_RPC_RELAY_PORT` | Relay pod port that Solo port-forwards to and that the one-shot NodePort service targets | `7546`
| `JSON_RPC_RELAY_LOCAL_PORT` | Local port of the relay port-forward | `37546`

---

## Explorer

| Environment Variable | Description | Default Value
| --- | --- | ---
| `EXPLORER_PORT` | Explorer pod port that Solo port-forwards to and that the one-shot NodePort service targets | `8080`
| `EXPLORER_LOCAL_PORT` | Local port of the Explorer port-forward | `38080`

---

## Mirror Node

| Environment Variable | Description | Default Value
| --- | --- | ---
| `SOLO_FF_DISABLE_BLOCK_NODE_INTEGRATION` | Feature flag: keep the Mirror Node importer pulling from the consensus nodes instead of configuring its Spring profiles for block node integration. See [Feature Flags](#feature-flags) | `false`
| `SPRING_PROFILES_ACTIVE` | Spring profiles to use for the Mirror Node importer when automatic importer profile configuration is enabled | `blocknode`
| `MIRROR_NODE_PORT` | Local port of the Mirror Node ingress port-forward | `38081`
| `MIRROR_NODE_PINGER_PODS_READY_MAX_ATTEMPTS` | Maximum number of attempts to check if the Mirror Node pinger pod is ready | `900`
| `MIRROR_NODE_PINGER_PODS_READY_DELAY` | Interval between Mirror Node pinger pod ready checks, in milliseconds | `2000`
| `MIRROR_NODE_SCHEMA_READY_MAX_ATTEMPTS` | Maximum number of attempts to check if the Mirror Node database schema has been built (signalled by importer pod readiness) | `900`
| `MIRROR_NODE_SCHEMA_READY_DELAY` | Interval between Mirror Node database schema checks, in milliseconds | `2000`
| `MIRROR_NODE_IMPORTER_DETECT_MAX_ATTEMPTS` | Maximum number of attempts to detect a running Mirror Node importer pod. If no importer pod is found, the database schema wait is skipped | `15`
| `MIRROR_NODE_IMPORTER_DETECT_DELAY` | Interval between Mirror Node importer pod detection attempts, in milliseconds | `2000`
| `MIRROR_NODE_CHART_UPGRADE_MAX_ATTEMPTS` | Maximum number of attempts to install or upgrade the Mirror Node Helm chart before failing. Retries ride out transient Kubernetes API server outages | `3`
| `MIRROR_NODE_CHART_UPGRADE_RETRY_DELAY_SECS` | Delay between Mirror Node Helm chart install/upgrade attempts, in seconds | `15`
| `MIRROR_EXTERNAL_DATABASE_CLIENT_IMAGE` | Image of the short-lived `psql` pod that `mirror node add` / `mirror node upgrade` with `--use-external-database` starts to grant the `readonly` role to `mirror_rest` on the external database. The image must provide `psql` and `sleep`. Override it for private or air-gapped registries | `docker.io/bitnamilegacy/postgresql-repmgr:17.6.0-debian-12-r2`
| `MIRROR_NODE_OLD_IMAGE_REGISTRY` | Image registry `mirror node add` / `mirror node upgrade` set for the `grpc`, `importer`, `rest`, `rest-java` and `web3` components of a Mirror Node earlier than v0.152.0 (and for `web3` on arm64 earlier than v0.155.0). Not applied when a custom component image is set | `gcr.io`
| `MIRROR_NODE_OLD_IMAGE_REPO_ROOT` | Image repository prefix for those components; Solo appends the component name | `mirrornode/hedera-mirror-`
| `MIRROR_NODE_OLD_MEMORY_GRPC` | Memory limit of the `grpc` component on a Mirror Node earlier than v0.152.0 | `1000Mi`
| `MIRROR_NODE_OLD_MEMORY_IMPORTER` | Memory limit of the `importer` component on a Mirror Node earlier than v0.152.0 | `2000Mi`
| `MIRROR_NODE_OLD_MEMORY_REST` | Memory limit of the `rest` component on a Mirror Node earlier than v0.152.0 | `200Mi`
| `MIRROR_NODE_OLD_MEMORY_RESTJAVA` | Memory limit of the `rest-java` component on a Mirror Node earlier than v0.152.0 | `500Mi`
| `MIRROR_NODE_OLD_MEMORY_WEB3` | Memory limit of the `web3` component on a Mirror Node earlier than v0.152.0 (and on arm64 earlier than v0.155.0) | `1000Mi`

### Mirror Node Shared Resources

`solo mirror node add` deploys the `solo-shared-resources` chart, which runs the
Redis and PostgreSQL instances the Mirror Node uses. These variables set its
values. The Redis and PostgreSQL image versions are under
[Component Versions](#component-versions).

| Environment Variable | Description | Default Value
| --- | --- | ---
| `REDIS_SENTINEL_ENABLED` | Enable Redis Sentinel. Only the exact value `true` turns it on | `false`
| `REDIS_HOST` | Sets the chart's `redis.host`. Because of how Solo evaluates this variable, any non-empty value currently selects `solo-shared-resources-redis` and the value itself is not used | `solo-shared-resources-redis-master` (`solo-shared-resources-redis` with Sentinel)
| `REDIS_REPLICA_REPLICACOUNT` | Sets the chart's `redis.replica.replicaCount`. Because of how Solo evaluates this variable, any non-zero number sets `1`; unset or `0` sets `1` with Sentinel and `0` without | `0` (`1` with Sentinel)
| `REDIS_SENTINEL_GETMASTERTIMEOUT` | Sets the chart's `redis.sentinel.getMasterTimeout` | `10`

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
| `PROMETHEUS_OPERATOR_CRDS_VERSION` | Helm chart version of the Prometheus Operator CRDs (`prometheus-operator-crds`) Solo installs for monitoring support
| `METRICS_SERVER_VERSION` | Helm chart version of the Kubernetes metrics-server `solo cluster-ref config setup --metrics-server` installs. Unset installs the latest chart version
| `METALLB_CHART_VERSION` | Helm chart version of MetalLB, which `solo config ops restore-clusters` installs on each cluster of a multi-cluster restore
| `MINIO_IMAGE_REPOSITORY` | Repository of the MinIO tenant (object storage) server image set by `solo consensus network deploy`. Used together with `MINIO_IMAGE_DIGEST`. Default: `docker.io/pgsty/silo@sha256`
| `MINIO_IMAGE_DIGEST` | SHA-256 digest, without the `sha256:` prefix, of the MinIO tenant server image. Also used to pick the image for the image cache
| `POSTGRES_IMAGE_DIGEST` | SHA-256 digest, without the `sha256:` prefix, of the `docker.io/bitnami/postgresql` image in the Mirror Node shared resources chart. Also used to pick the image for the image cache
| `REDIS_IMAGE_VERSION` | Tag of the `gcr.io/mirrornode/redis` image in the Mirror Node shared resources chart
| `REDIS_SENTINEL_IMAGE_VERSION` | Tag of the `gcr.io/mirrornode/redis-sentinel` image in the Mirror Node shared resources chart

The defaults for every variable in this table are pinned in
[`version.ts`](https://github.com/hiero-ledger/solo/blob/main/version.ts) for
each Solo release.

> **Tip:** To pin component versions for a `solo one-shot single deploy`, use
> its version flags or prefix the command with these variables. See
> [Pinning Component Versions](#pinning-component-versions) below.

---

## Edge Component Versions

These variables only take effect when `solo one-shot single deploy`,
`solo one-shot multi deploy` or `solo one-shot falcon deploy` is invoked with
the `--edge` flag. Without `--edge`, every `*_EDGE_VERSION` variable is ignored.

With `--edge`, Solo looks up the latest stable GitHub release (not a draft or
pre-release) of each component and deploys that. The `*_EDGE_VERSION` variables
only set the version Solo uses when that lookup fails, for example when GitHub
is unreachable or rate-limited (set `GITHUB_TOKEN` to avoid rate limits). They
do not override a successful lookup. `SOLO_CHART_EDGE_VERSION` is the exception:
Solo does not look up the Solo chart, so it uses this variable directly.

| Component       | Environment Variable           | Used when                    | Default                       |
| --------------- | ------------------------------ | ---------------------------- | ----------------------------- |
| Consensus Node  | `CONSENSUS_NODE_EDGE_VERSION`  | the GitHub lookup fails      | compiled-in edge version      |
| Mirror Node     | `MIRROR_NODE_EDGE_VERSION`     | the GitHub lookup fails      | compiled-in edge version      |
| JSON-RPC Relay  | `RELAY_EDGE_VERSION`           | the GitHub lookup fails      | compiled-in edge version      |
| Explorer        | `EXPLORER_EDGE_VERSION`        | the GitHub lookup fails      | `EXPLORER_VERSION`            |
| Block Node      | `BLOCK_NODE_EDGE_VERSION`      | the GitHub lookup fails      | compiled-in edge version      |
| Solo Chart      | `SOLO_CHART_EDGE_VERSION`      | always, with `--edge`        | `SOLO_CHART_VERSION`          |

The compiled-in edge versions are pinned in
[`version.ts`](https://github.com/hiero-ledger/solo/blob/main/version.ts) for
each Solo release.

An explicit version flag such as `--consensus-node-version` still takes
precedence over `--edge`, and so does a version set in a `solo.config.yaml` or
`solo.config.json` file in the current directory or a parent directory. The
order, highest first, is: version flag, `solo.config` file, then the edge
version (with `--edge`) or the [Component Versions](#component-versions) value
(without it).

For full usage, examples, version-format rules, and troubleshooting, see
[One-Shot Deploy with Custom Component Versions](/docs/advanced-solo-setup/one-shot-deploy-with-custom-versions).

---

## Helm Chart URLs

| Environment Variable | Description | Default Value
| --- | --- | ---
| `JSON_RPC_RELAY_CHART_URL` | Helm chart repository URL for the JSON-RPC Relay | `https://hiero-ledger.github.io/hiero-json-rpc-relay/charts`
| `MIRROR_NODE_CHART_URL` | Helm chart repository URL for the Mirror Node | `https://hiero-ledger.github.io/hiero-mirror-node/charts`
| `EXPLORER_CHART_URL` | Helm chart repository URL for the Explorer | `oci://ghcr.io/hiero-ledger/hiero-mirror-node-explorer/hiero-explorer-chart`
| `INGRESS_CONTROLLER_CHART_URL` | Helm chart repository URL for the ingress controller | `https://haproxy-ingress.github.io/charts`
| `PROMETHEUS_OPERATOR_CRDS_CHART_URL` | Helm chart repository URL for the Prometheus Operator CRDs | `https://prometheus-community.github.io/helm-charts`
| `GRAFANA_CHART_URL` | Helm chart repository URL for Grafana Alloy and Loki | `https://grafana.github.io/helm-charts`
| `NETWORK_LOAD_GENERATOR_CHART_URL` | Helm chart repository URL for the Network Load Generator | `oci://artifacts.hashgraph.io/load-generator-helm-release-local`
| `BLOCK_NODE_CHART_URL` | Helm chart repository URL for the Block Node. `SOLO_BLOCK_NODE_CHART_DIR` or `--block-node-chart-dir` takes precedence | `oci://ghcr.io/hiero-ledger/hiero-block-node`
| `BLOCK_NODE_CHART` | Name of the Block Node Helm chart, also used as the block node container name | `block-node-server`
| `PROMETHEUS_STACK_CHART_URL` | Helm chart repository URL for the kube-prometheus-stack chart | `https://prometheus-community.github.io/helm-charts`
| `MINIO_OPERATOR_CHART_URL` | Helm chart repository URL for the MinIO Operator | `https://operator.min.io/`
| `METRICS_SERVER_CHART_URL` | Helm chart repository URL for the Kubernetes metrics-server | `https://kubernetes-sigs.github.io/metrics-server/`

---

## Local Helm Chart Directories

Chart owners can test an unpublished chart by pointing Solo at a local chart
directory. Only the chart templates are local: every container image the chart
references must already be pullable by the cluster (published to a registry or
loaded with `kind load docker-image`). These variables are the equivalent of the
`--block-node-chart-dir`, `--explorer-chart-dir`, `--mirror-node-chart-dir` and
`--relay-chart-dir` flags, and the flag takes precedence when both are set.

| Environment Variable | Description | Default Value
| --- | --- | ---
| `SOLO_BLOCK_NODE_CHART_DIR` | Directory that contains the block node chart (`block-node-server`), e.g. `/path/to/hiero-block-node/charts` | unset (published chart)
| `SOLO_EXPLORER_CHART_DIR` | The explorer chart directory itself (the one holding `Chart.yaml`), e.g. `/path/to/hiero-mirror-node-explorer/_frontend/chart` | unset (published chart)
| `SOLO_MIRROR_NODE_CHART_DIR` | Directory that contains the mirror node chart (`hedera-mirror`), e.g. `/path/to/hiero-mirror-node/charts` | unset (published chart)
| `SOLO_RELAY_CHART_DIR` | Directory that contains the JSON-RPC relay chart (`hedera-json-rpc`), e.g. `/path/to/hiero-json-rpc-relay/charts` | unset (published chart)

> **Note:** The explorer variable takes the chart directory itself, while the
> other three take the directory that contains the chart. Use absolute paths:
> Solo does not expand `~` inside the value.

For example, to deploy a network with a local mirror node chart:

```bash
SOLO_MIRROR_NODE_CHART_DIR=/path/to/hiero-mirror-node/charts solo one-shot single deploy
```

---

## Network Load Generator

| Environment Variable | Description | Default Value
| --- | --- | ---
| `NETWORK_LOAD_GENERATOR_CHART_VERSION` | Release version of the Network Load Generator Helm chart to use with consensus node v0.72.0 and later. Older consensus nodes always use chart `0.8.0` | `0.15.1`
| `NETWORK_LOAD_GENERATOR_PODS_RUNNING_MAX_ATTEMPTS` | Maximum number of attempts to check if Network Load Generator pods are running | `900`
| `NETWORK_LOAD_GENERATOR_PODS_RUNNING_DELAY` | Interval between Network Load Generator pod running checks, in milliseconds | `1000`

---

## One-Shot Deployment

| Environment Variable | Description | Default Value
| --- | --- | ---
| `ONE_SHOT_WITH_BLOCK_NODE` | Deploy Block Node as part of a one-shot deployment | `false`
| `MIRROR_NODE_PINGER_TPS` | Transactions per second for the Mirror Node monitor's pinger scenario when the pinger is enabled (`--pinger`). Only applies to Mirror Node versions earlier than v0.152.0. `0` falls back to the default rather than turning the pinger off; use the `--pinger` flag for that | `5`
| `MIRROR_NODE_DEPLOYED_EVENT_TIMEOUT_MINUTES` | In a parallel one-shot deploy (`--parallel-deploy`), how long the mirror pinger and JSON-RPC Relay steps wait for the Mirror Node deployment to finish, in minutes | `10`

The `*_EDGE_VERSION` variables used by `--edge` are described under
[Edge Component Versions](#edge-component-versions).

### Pinning Component Versions

`solo one-shot single deploy`, `solo one-shot multi deploy` and
`solo one-shot falcon deploy` accept a version flag per component:
`--consensus-node-version`, `--mirror-node-version`, `--relay-version`,
`--explorer-version` and `--block-node-version`.

```bash
solo one-shot single deploy --consensus-node-version v0.73.0 --mirror-node-version v0.153.1
```

You can also prefix the command with the
[Component Versions](#component-versions) environment variables, which is
convenient for one-off overrides and for components without a flag:

```bash
CONSENSUS_NODE_VERSION=v0.73.0 MIRROR_NODE_VERSION=v0.153.1 solo one-shot single deploy
```

A version flag takes precedence over a version set in a `solo.config.yaml` or
`solo.config.json` file, which takes precedence over these variables. With
`--edge`, the edge versions replace these variables; see
[Edge Component Versions](#edge-component-versions).

## Image Cache

Solo downloads verified archives of the container images it deploys from the
Solo CDN, using the image cache manifest published with each Solo release. See
[Solo Image Cache](/docs/advanced-solo-setup/image-cache) for the full feature
and the `solo cache image` commands.

| Environment Variable | Description | Default
| --- | --- | ---
| `SOLO_FF_ENABLE_IMAGE_CACHE` | Feature flag. Set to `false` to skip the image cache during `solo one-shot` deploys. See [Feature Flags](#feature-flags). | enabled
| `SOLO_WITH_IMAGE_CACHE` | Set to `true` to download the images during an npm global install. **Solo v0.95.0 and later**; earlier releases downloaded them by default. | disabled
| `SOLO_NO_CACHE` | Ignored since Solo v0.95.0, where installs no longer download images by default. On v0.74.0 to v0.94.0, set to `true` to skip the image download during an npm global install. | -
| `SOLO_CACHE_MANIFEST_URL` | Full URL of the image cache manifest to use instead of the one published with the running Solo release. For staging and testing. **Solo v0.92.0 and later.** | `https://github.com/hiero-ledger/solo/releases/download/v<solo-version>/cache-manifest.json`
| `SOLO_CACHE_CDN_BASE_URL` | Base URL to download image archives and their hash files from. For staging and testing. **Solo v0.92.0 and later.** | `https://cdn.solo.hiero.org` (`https://cdn.solo.hashgraph.io` on v0.92.0 to v0.95.x)
| `CACHE_IMAGE_MAX_CONCURRENCY` | Max concurrent image cache pull/load operations | 12

> **Note:** Only the image versions listed in the manifest are cached: the
> default component versions of your Solo release. A version pinned with a
> `*_VERSION` environment variable or a `--*-version` CLI flag is pulled by the
> cluster from its registry instead.

---

## Downloads

These variables tune the HTTP downloads Solo makes for consensus node release
builds and for the command-line tools it installs (such as `kubectl` and
Podman). Timeouts must be positive numbers; an invalid value logs a warning and
the default applies.

| Environment Variable | Description | Default Value
| --- | --- | ---
| `PACKAGE_DOWNLOADER_URL_EXISTS_TIMEOUT_MS` | Timeout of the `HEAD` request Solo sends to check that a download URL exists, in milliseconds | `5000`
| `PACKAGE_DOWNLOADER_DOWNLOAD_CONNECT_TIMEOUT_MS` | Timeout for connecting to the download server, in milliseconds | `10000`
| `PACKAGE_DOWNLOADER_DOWNLOAD_RESPONSE_TIMEOUT_MS` | Timeout for receiving the download server's response, in milliseconds | `120000`
| `PACKAGE_DOWNLOADER_RETRY_LIMIT` | Maximum number of download attempts. Retries back off exponentially from 2 seconds, up to 32 seconds | `6`

---

## Feature Flags

Feature flags are boolean switches that turn a piece of Solo behaviour on or
off. Each flag can be set with any of these names, highest precedence first:

1. The generated name, `SOLO_FEATURE_FLAGS_<FLAG>` (for example
   `SOLO_FEATURE_FLAGS_SKIP_NODE_PING`).
2. The shorter `SOLO_FF_<FLAG>` alias listed below.
3. An older name kept only for backwards compatibility. Do not use these in new
   scripts.

If you set more than one name for the same flag, Solo logs a notice naming the
one that won. Values are `true`, `false`, `1` or `0`, case-insensitive; any
other value stops Solo at startup with an error naming the variable. (An invalid
value on an older name is ignored with a warning instead.) Flags can also be set
under `featureFlags:` in `~/.solo/solo-config.yaml`; an environment variable
takes precedence over that file. The `SOLO_FF_*` and `SOLO_FEATURE_FLAGS_*`
names require Solo v0.97.0 or later.

| Environment Variable | Description | Default Value
| --- | --- | ---
| `SOLO_FF_ENABLE_IMAGE_CACHE` | Use the [image cache](#image-cache) during `solo one-shot` deploys. Set to `false` to skip it. Older name kept for compatibility: `ENABLE_IMAGE_CACHE` | `true`
| `SOLO_FF_SKIP_NODE_PING` | Skip the health ping Solo sends to the consensus nodes before it uses its node client. Speeds up commands against a network you know is healthy. Older name kept for compatibility: `SKIP_NODE_PING` | `false`
| `SOLO_FF_DISABLE_BLOCK_NODE_INTEGRATION` | Keep the Mirror Node importer pulling from the consensus nodes instead of configuring it (through `SPRING_PROFILES_ACTIVE`) to stream from the block nodes. `solo mirror node add --force` overrides it. Older name kept for compatibility: `DISABLE_IMPORTER_SPRING_PROFILES` | `false`
| `SOLO_FEATURE_FLAGS_COPY_WRAPS_LIBRARY_IN_PARALLEL` | **Deprecated since Solo v0.94.0** (consensus node v0.79.0 and later embed the WRAPS proving parameters). Copy the WRAPS proving-key library to every consensus node concurrently during `solo consensus network deploy`, instead of one node at a time. Faster with many nodes and ample bandwidth, but several multi-hundred-megabyte copies at once can saturate a constrained connection. Older name kept for compatibility: `EXPERIMENTAL_COPY_WRAPS_LIB_IN_PARALLEL` | `false`

---

## TSS Configuration

These settings come from Solo's layered configuration. Like feature flags, they
can also be set in `~/.solo/solo-config.yaml` (under `tss:`); an environment
variable takes precedence. A value that is not a number stops Solo at startup
with an error naming the variable.

| Environment Variable | Description | Default Value
| --- | --- | ---
| `SOLO_TSS_READY_MAX_ATTEMPTS` | Maximum number of checks of each consensus node's log for `TSS protocol ready to sign blocks` when nodes start or are added with TSS enabled | `60`
| `SOLO_TSS_READY_BACKOFF_SECONDS` | Interval between TSS readiness checks, in seconds | `3`
| `SOLO_TSS_TIMEOUT_AFTER_READY_SECONDS` | Wait after a node reports TSS ready, in seconds | `10`
| `SOLO_TSS_MESSAGE_SIZE_SOFT_LIMIT_BYTES` | Soft message-size limit Solo writes into each consensus node's block node connection entries when TSS is enabled, in bytes. A value set with the block node `--block-node-message-size-soft-limit-bytes` flag takes precedence | `4194304` (4 MiB)
| `SOLO_TSS_MESSAGE_SIZE_HARD_LIMIT_BYTES` | Hard message-size limit for the same entries, in bytes. A value set with `--block-node-message-size-hard-limit-bytes` takes precedence | `37748736` (36 MiB)
| `SOLO_TSS_WRAPS_LIBRARY_DOWNLOAD_URL` | **Deprecated since Solo v0.94.0.** URL of the WRAPS proving-key library archive Solo copies to the consensus nodes. Consensus node v0.79.0 and later embed the WRAPS proving parameters, so it has no effect on them | `https://builds.hedera.com/tss/hiero/wraps/v1.0/wraps-v1.0.0.tar.gz`
| `SOLO_TSS_WRAPS_DIRECTORY_NAME` | Directory name of the extracted WRAPS library. Must match the version in `SOLO_TSS_WRAPS_LIBRARY_DOWNLOAD_URL` | `wraps-v1.0.0`
| `SOLO_TSS_WRAPS_ARTIFACTS_FOLDER_NAME` | Path of the WRAPS artifacts on the consensus node, relative to the node's application directory | `data/keys/wraps-v1.0.0`
| `SOLO_TSS_WRAPS_ALLOWED_KEY_FILES` | Comma-separated list of the WRAPS key files Solo accepts | `decider_pp.bin,decider_vp.bin,nova_pp.bin,nova_vp.bin`

---

## Variables Without Effect

Solo reads these variables, but they do not change its behaviour in normal use.
They are listed so you are not left wondering why setting them does nothing.

| Environment Variable | Notes
| --- | ---
| `BLOCK_ITEM_BATCH_SIZE` | Read but not used
| `NODES_STARTED_EVENT_TIMEOUT_MINUTES` | Read but not used. The one-shot steps that wait for the consensus nodes to start use a fixed 10-minute timeout
| `IGNORE_POD_METRICS` | Comma-separated pod name fragments to leave out of pod metrics collection. Only Solo's own end-to-end tests collect pod metrics. Default: `network-load-generator,metrics-server`
| `SOLO_HELM_CHART_*`, `SOLO_INGRESS_CONTROLLER_HELM_CHART_*`, `SOLO_CLUSTER_SETUP_HELM_CHART_*`, `SOLO_CERT_MANAGER_HELM_CHART_*` | Generated from Solo's configuration schema (for example `SOLO_HELM_CHART_DIRECTORY`), but no command reads these settings yet. Use the chart directory variables and flags under [Local Helm Chart Directories](#local-helm-chart-directories) instead
