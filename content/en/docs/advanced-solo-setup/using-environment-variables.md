---
title: "Using Environment Variables"
weight: 5
description: >
  A comprehensive reference of all environment variables supported by Solo,
  including their purposes, default values, and expected formats. Configure
  Solo deployments through environment variable tuning.
categories: ["Reference", "Advanced"]
tags: ["advanced", "operator", "configuration", "cli"]
type: docs
---

## Overview

Solo supports a set of environment variables that let you customize its
behaviour without modifying command-line flags on every run. Variables set
in your shell environment take effect automatically for all subsequent Solo
commands.

> **Tip:** Add frequently used variables to your shell profile
> (e.g. `~/.zshrc` or `~/.bashrc`) to persist them across sessions.

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
| `DEFAULT_START_ID_NUMBER` | First node account ID of the Solo test network | `0.0.3`
| `SOLO_NODE_INTERNAL_GOSSIP_PORT` | Internal gossip port used by the Hiero network | `50111`
| `SOLO_NODE_EXTERNAL_GOSSIP_PORT` | External gossip port used by the Hiero network | `50111`
| `SOLO_NODE_DEFAULT_STAKE_AMOUNT` | Default stake amount for a node | `500`
| `GRPC_PORT` | gRPC port used for local node communication | `50211`
| `LOCAL_NODE_START_PORT` | Local node start port for the Solo network | `30212`
| `SOLO_CHAIN_ID` | Chain ID of the Solo network | `298`

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
| `NODE_CLIENT_PING_INTERVAL` | Interval between node health pings, in milliseconds | `30000`
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

| Environment Variable | Description | Default Value
| --- | --- | ---
| `CONSENSUS_NODE_VERSION` | [Release version](https://github.com/hiero-ledger/hiero-consensus-node/releases) of the Consensus Node to use | `v0.65.1`
| `BLOCK_NODE_VERSION` | [Release version](https://github.com/hiero-ledger/hiero-block-node/releases) of the Block Node to use | `v0.18.0`
| `MIRROR_NODE_VERSION` | [Release version](https://github.com/hiero-ledger/hiero-mirror-node/releases) of the Mirror Node to use | `v0.138.0`
| `EXPLORER_VERSION` | [Release version](https://github.com/hiero-ledger/hiero-mirror-node-explorer/releases) of the Explorer to use | `v25.1.1`
| `RELAY_VERSION` | [Release version](https://github.com/hiero-ledger/hiero-json-rpc-relay/releases) of the JSON-RPC Relay to use | `v0.70.0`
| `INGRESS_CONTROLLER_VERSION` | [Release version](https://haproxy-ingress.github.io/) of the HAProxy Ingress Controller to use | `v0.14.5`
| `SOLO_CHART_VERSION` | Release version of the Solo Helm charts to use | `v0.56.0`
| `MINIO_OPERATOR_VERSION` | Release version of the MinIO Operator to use | `7.1.1`
| `PROMETHEUS_STACK_VERSION` | Release version of the Prometheus Stack to use | `52.0.1`
| `GRAFANA_AGENT_VERSION` | Release version of the Grafana Agent to use | `0.27.1`

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
