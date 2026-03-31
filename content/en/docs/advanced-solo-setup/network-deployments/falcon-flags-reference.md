---
title: "Falcon Values File Reference"
description: >
  Comprehensive reference for all supported CLI flags per section of a Falcon
  values file, including defaults, types, and descriptions. Use this as your
  source of truth when customizing Falcon deployments.
categories: ["Reference", "Advanced"]
tags: ["advanced", "operator", "falcon", "cli", "configuration"]
weight: 2
type: docs
---

## Overview

This page catalogs the Solo CLI flags accepted under each top-level section of a
Falcon values file. Each entry corresponds to the command-line flag that the
underlying Solo subcommand accepts.

Sections map to subcommands as follows:

| Section | Solo subcommand |
| --- | --- |
| `network` | `solo consensus network deploy` |
| `setup` | `solo consensus node setup` |
| `consensusNode` | `solo consensus node start` |
| `mirrorNode` | `solo mirror node add` |
| `explorerNode` | `solo explorer node add` |
| `relayNode` | `solo relay node add` |
| `blockNode` | `solo block node add` |

All flag names must be written in long form with double dashes (for example,
`--release-tag`). Flags left empty (`""`) or matching their default value are
ignored by Solo at argument expansion time.

> **Note:** Not every flag listed here is relevant to every deployment. Use this
> page as a lookup when writing or debugging a values file. For a working
> example file, see the upstream reference at
> <https://github.com/hiero-ledger/solo/tree/main/examples/one-shot-falcon>.

---

## Consensus Network Deploy — `network`

Flags passed to `solo consensus network deploy`.

| Flag | Type | Default | Description |
| --- | --- | --- | --- |
| `--release-tag` | string | current Hedera platform version | Consensus node release tag (e.g. `v0.71.0`). |
| `--pvcs` | boolean | `false` | Enable Persistent Volume Claims for consensus node storage. Required for node add operations. |
| `--load-balancer` | boolean | `false` | Enable load balancer for network node proxies. |
| `--chart-dir` | string | — | Path to a local Helm chart directory for the Solo network chart. |
| `--solo-chart-version` | string | current chart version | Specific Solo testing chart version to deploy. |
| `--haproxy-ips` | string | — | Static IP mapping for HAProxy pods (e.g. `node1=127.0.0.1,node2=127.0.0.2`). |
| `--envoy-ips` | string | — | Static IP mapping for Envoy proxy pods. |
| `--debug-node-alias` | string | — | Enable the default JVM debug port (5005) for the specified node alias. |
| `--domain-names` | string | — | Custom domain name mapping per node alias (e.g. `node1=node1.example.com`). |
| `--grpc-tls-cert` | string | — | TLS certificate path for gRPC, per node alias (e.g. `node1=/path/to/cert`). |
| `--grpc-web-tls-cert` | string | — | TLS certificate path for gRPC Web, per node alias. |
| `--grpc-tls-key` | string | — | TLS certificate key path for gRPC, per node alias. |
| `--grpc-web-tls-key` | string | — | TLS certificate key path for gRPC Web, per node alias. |
| `--storage-type` | string | `minio_only` | Stream file storage backend. Options: `minio_only`, `aws_only`, `gcs_only`, `aws_and_gcs`. |
| `--gcs-write-access-key` | string | — | GCS write access key. |
| `--gcs-write-secrets` | string | — | GCS write secret key. |
| `--gcs-endpoint` | string | — | GCS storage endpoint URL. |
| `--gcs-bucket` | string | — | GCS bucket name. |
| `--gcs-bucket-prefix` | string | — | GCS bucket path prefix. |
| `--aws-write-access-key` | string | — | AWS write access key. |
| `--aws-write-secrets` | string | — | AWS write secret key. |
| `--aws-endpoint` | string | — | AWS storage endpoint URL. |
| `--aws-bucket` | string | — | AWS bucket name. |
| `--aws-bucket-region` | string | — | AWS bucket region. |
| `--aws-bucket-prefix` | string | — | AWS bucket path prefix. |
| `--settings-txt` | string | template | Path to a custom `settings.txt` file for consensus nodes. |
| `--application-properties` | string | template | Path to a custom `application.properties` file. |
| `--application-env` | string | template | Path to a custom `application.env` file. |
| `--api-permission-properties` | string | template | Path to a custom `api-permission.properties` file. |
| `--bootstrap-properties` | string | template | Path to a custom `bootstrap.properties` file. |
| `--log4j2-xml` | string | template | Path to a custom `log4j2.xml` file. |
| `--genesis-throttles-file` | string | — | Path to a custom `throttles.json` file for network genesis. |
| `--service-monitor` | boolean | `false` | Install a `ServiceMonitor` custom resource for Prometheus metrics. |
| `--pod-log` | boolean | `false` | Install a `PodLog` custom resource for node pod log monitoring. |
| `--quiet-mode` | boolean | `false` | Suppress confirmation prompts. |
| `--values-file` | string | — | Comma-separated Helm chart values file paths (not the Falcon values file). |

---

## Consensus Node Setup — `setup`

Flags passed to `solo consensus node setup`.

| Flag | Type | Default | Description |
| --- | --- | --- | --- |
| `--release-tag` | string | current Hedera platform version | Consensus node release tag. Must match `network.--release-tag`. |
| `--local-build-path` | string | — | Path to a local Hiero consensus node build (e.g. `~/hiero-consensus-node/hedera-node/data`). Used for local development workflows. |
| `--app` | string | `HederaNode.jar` | Name of the consensus node application binary. |
| `--app-config` | string | — | Path to a JSON configuration file for the testing app. |
| `--admin-public-keys` | string | — | Comma-separated DER-encoded ED25519 public keys in node alias order. |
| `--domain-names` | string | — | Custom domain name mapping per node alias. |
| `--dev` | boolean | `false` | Enable developer mode. |
| `--quiet-mode` | boolean | `false` | Suppress confirmation prompts. |
| `--cache-dir` | string | `~/.solo/cache` | Local cache directory for downloaded artifacts. |

---

## Consensus Node Start — `consensusNode`

Flags passed to `solo consensus node start`.

| Flag | Type | Default | Description |
| --- | --- | --- | --- |
| `--force-port-forward` | boolean | `true` | Force port forwarding to access network services locally. |
| `--stake-amounts` | string | — | Comma-separated stake amounts in node alias order (e.g. `100,100,100`). Required for multi-node deployments that need non-default stakes. |
| `--state-file` | string | — | Path to a zipped state file to restore the network from. |
| `--debug-node-alias` | string | — | Enable JVM debug port (5005) for the specified node alias. |
| `--app` | string | `HederaNode.jar` | Name of the consensus node application binary. |
| `--quiet-mode` | boolean | `false` | Suppress confirmation prompts. |

---

## Mirror Node Add — `mirrorNode`

Flags passed to `solo mirror node add`.

| Flag | Type | Default | Description |
| --- | --- | --- | --- |
| `--mirror-node-version` | string | current version | Mirror node Helm chart version to deploy. |
| `--enable-ingress` | boolean | `false` | Deploy an ingress controller for the mirror node. |
| `--force-port-forward` | boolean | `true` | Enable port forwarding for mirror node services. |
| `--pinger` | boolean | `false` | Enable the mirror node Pinger service. |
| `--mirror-static-ip` | string | — | Static IP address for the mirror node load balancer. |
| `--domain-name` | string | — | Custom domain name for the mirror node. |
| `--ingress-controller-value-file` | string | — | Path to a Helm values file for the ingress controller. |
| `--mirror-node-chart-dir` | string | — | Path to a local mirror node Helm chart directory. |
| `--use-external-database` | boolean | `false` | Connect to an external PostgreSQL database instead of the chart-bundled one. |
| `--external-database-host` | string | — | Hostname of the external database. Requires `--use-external-database`. |
| `--external-database-owner-username` | string | — | Owner username for the external database. |
| `--external-database-owner-password` | string | — | Owner password for the external database. |
| `--external-database-read-username` | string | — | Read-only username for the external database. |
| `--external-database-read-password` | string | — | Read-only password for the external database. |
| `--storage-type` | string | `minio_only` | Stream file storage backend for the mirror node importer. |
| `--storage-read-access-key` | string | — | Storage read access key for the mirror node importer. |
| `--storage-read-secrets` | string | — | Storage read secret key for the mirror node importer. |
| `--storage-endpoint` | string | — | Storage endpoint URL for the mirror node importer. |
| `--storage-bucket` | string | — | Storage bucket name for the mirror node importer. |
| `--storage-bucket-prefix` | string | — | Storage bucket path prefix. |
| `--storage-bucket-region` | string | — | Storage bucket region. |
| `--operator-id` | string | — | Operator account ID for the mirror node. |
| `--operator-key` | string | — | Operator private key for the mirror node. |
| `--quiet-mode` | boolean | `false` | Suppress confirmation prompts. |
| `--values-file` | string | — | Comma-separated Helm chart values file paths for the mirror node chart. |

---

## Explorer Add — `explorerNode`

Flags passed to `solo explorer node add`.

| Flag | Type | Default | Description |
| --- | --- | --- | --- |
| `--explorer-version` | string | current version | Hiero Explorer Helm chart version to deploy. |
| `--enable-ingress` | boolean | `false` | Deploy an ingress controller for the explorer. |
| `--force-port-forward` | boolean | `true` | Enable port forwarding for the explorer service. |
| `--domain-name` | string | — | Custom domain name for the explorer. |
| `--ingress-controller-value-file` | string | — | Path to a Helm values file for the ingress controller. |
| `--explorer-chart-dir` | string | — | Path to a local Hiero Explorer Helm chart directory. |
| `--explorer-static-ip` | string | — | Static IP address for the explorer load balancer. |
| `--enable-explorer-tls` | boolean | `false` | Enable TLS for the explorer. Requires cert-manager. |
| `--explorer-tls-host-name` | string | `explorer.solo.local` | Hostname used for the explorer TLS certificate. |
| `--tls-cluster-issuer-type` | string | `self-signed` | TLS cluster issuer type. Options: `self-signed`, `acme-staging`, `acme-prod`. |
| `--mirror-node-id` | number | — | ID of the mirror node instance to connect the explorer to. |
| `--mirror-namespace` | string | — | Kubernetes namespace of the mirror node. |
| `--solo-chart-version` | string | current version | Solo chart version used for explorer cluster setup. |
| `--quiet-mode` | boolean | `false` | Suppress confirmation prompts. |
| `--values-file` | string | — | Comma-separated Helm chart values file paths for the explorer chart. |

---

## JSON-RPC Relay Add — `relayNode`

Flags passed to `solo relay node add`.

| Flag | Type | Default | Description |
| --- | --- | --- | --- |
| `--relay-release` | string | current version | Hiero JSON-RPC Relay Helm chart release to deploy. |
| `--node-aliases` | string | — | Comma-separated node aliases the relay will observe (e.g. `node1` or `node1,node2`). |
| `--replica-count` | number | `1` | Number of relay replicas to deploy. |
| `--chain-id` | string | `298` | EVM chain ID exposed by the relay (Hedera testnet default). |
| `--force-port-forward` | boolean | `true` | Enable port forwarding for the relay service. |
| `--domain-name` | string | — | Custom domain name for the relay. |
| `--relay-chart-dir` | string | — | Path to a local Hiero JSON-RPC Relay Helm chart directory. |
| `--operator-id` | string | — | Operator account ID for relay transaction signing. |
| `--operator-key` | string | — | Operator private key for relay transaction signing. |
| `--mirror-node-id` | number | — | ID of the mirror node instance the relay will query. |
| `--mirror-namespace` | string | — | Kubernetes namespace of the mirror node. |
| `--quiet-mode` | boolean | `false` | Suppress confirmation prompts. |
| `--values-file` | string | — | Comma-separated Helm chart values file paths for the relay chart. |

---

## Block Node Add — `blockNode`

Flags passed to `solo block node add`.

> **Important:** The `blockNode` section is only read when `ONE_SHOT_WITH_BLOCK_NODE=true`
> is set in the environment. Otherwise Solo skips the block node add step
> regardless of whether a `blockNode` section is present.
> **Version requirements:** Consensus node ≥ v0.72.0 and block node ≥ 0.29.0.
> Use `--force` to bypass version gating during testing.

| Flag | Type | Default | Description |
| --- | --- | --- | --- |
| `--release-tag` | string | current version | Hiero block node release tag. |
| `--image-tag` | string | — | Docker image tag to override the Helm chart default. |
| `--enable-ingress` | boolean | `false` | Deploy an ingress controller for the block node. |
| `--domain-name` | string | — | Custom domain name for the block node. |
| `--dev` | boolean | `false` | Enable developer mode for the block node. |
| `--block-node-chart-dir` | string | — | Path to a local Hiero block node Helm chart directory. |
| `--quiet-mode` | boolean | `false` | Suppress confirmation prompts. |
| `--values-file` | string | — | Comma-separated Helm chart values file paths for the block node chart. |

---

## Top-Level Falcon Command Flags

The following flags are passed directly on the `solo one-shot falcon deploy` command
line. They are **not** read from the values file sections.

| Flag | Type | Default | Description |
| --- | --- | --- | --- |
| `--values-file` | string | — | Path to the Falcon values YAML file. |
| `--deployment` | string | `one-shot` | Deployment name for Solo's internal state. |
| `--namespace` | string | `one-shot` | Kubernetes namespace to deploy into. |
| `--cluster-ref` | string | `one-shot` | Cluster reference name. |
| `--num-consensus-nodes` | number | `1` | Number of consensus nodes to deploy. |
| `--deploy-mirror-node` | boolean | `true` | Deploy or skip the mirror node. |
| `--deploy-explorer` | boolean | `true` | Deploy or skip the explorer. |
| `--deploy-relay` | boolean | `true` | Deploy or skip the JSON-RPC relay. |
| `--no-rollback` | boolean | `false` | Disable automatic cleanup on deployment failure. Preserves partial resources for inspection. |
| `--quiet-mode` | boolean | `false` | Suppress all interactive prompts. |
| `--force` | boolean | `false` | Force actions that would otherwise be skipped. |
