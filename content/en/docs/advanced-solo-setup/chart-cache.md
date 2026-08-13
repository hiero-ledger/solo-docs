---
title: 'Solo Helm Chart Cache'
weight: 8
description: >
  Speed up deployments by pre-pulling and reusing the Helm charts Solo installs.
  Manage the local chart cache with the solo cache chart commands, and let
  deploys install charts from disk instead of the network.
categories: ['Advanced', 'Operations']
tags: ['advanced', 'operator', 'chart-cache', 'performance', 'helm']
type: docs
---

## Overview

A Solo network deployment installs a number of Helm charts (the Solo deployment
charts, mirror node, JSON-RPC relay, Explorer, block node, MinIO, Prometheus,
and the ingress controller). The **chart cache** pre-pulls those chart tarballs
and stores them on disk, so deployments install them from the local cache
instead of fetching them from their chart repositories or OCI registries.

The cache is used automatically: whenever Solo installs or upgrades a chart, it
first checks the cache for a tarball matching the exact chart name and version
being installed. On a match, the chart is installed from the local archive (no
network fetch); otherwise Solo falls back to the normal network install.

You populate and manage the cache with the `solo cache chart` commands.

## Prerequisites

- **Solo CLI v0.82.0 or later installed** - the chart cache was introduced in
  Solo v0.82.0; earlier versions have no `solo cache chart` command. See
  [Quickstart](/docs/simple-solo-setup/quickstart#install-solo-cli).

## Where the cache lives

Cached chart tarballs are stored under your Solo home directory, in
`~/.solo/cache/charts/` - one archive per chart and version, named
`<chart-name>__<version>.tar`. This sits alongside the
[image cache](/docs/advanced-solo-setup/image-cache/) (`~/.solo/cache/images/`);
the two caches are managed independently.

## What gets cached

`solo cache chart pull` caches the charts below. Each chart is pulled at the
version pinned in your Solo release, and each version can be overridden with an
environment variable (see
[Using environment variables](/docs/advanced-solo-setup/using-environment-variables/)
for the current defaults):

| Chart                                  | Version environment variable       | Source                                |
| -------------------------------------- | ---------------------------------- | ------------------------------------- |
| `solo-deployment`                      | `SOLO_CHART_VERSION`               | `oci://ghcr.io/hashgraph/solo-charts` |
| `solo-cert-manager`                    | `SOLO_CHART_VERSION`               | `oci://ghcr.io/hashgraph/solo-charts` |
| `solo-shared-resources`                | `SOLO_CHART_VERSION`               | `oci://ghcr.io/hashgraph/solo-charts` |
| `hedera-mirror` (mirror node)          | `MIRROR_NODE_VERSION`              | `MIRROR_NODE_CHART_URL`               |
| `hedera-json-rpc` (JSON-RPC relay)     | `RELAY_VERSION`                    | `JSON_RPC_RELAY_CHART_URL`            |
| `block-node-server` (block node)       | `BLOCK_NODE_VERSION`               | `BLOCK_NODE_CHART_URL`                |
| `hiero-explorer-chart` (Explorer)      | `EXPLORER_VERSION`                 | `EXPLORER_CHART_URL`                  |
| `kube-prometheus-stack`                | `PROMETHEUS_STACK_VERSION`         | `PROMETHEUS_STACK_CHART_URL`          |
| `prometheus-operator-crds`             | `PROMETHEUS_OPERATOR_CRDS_VERSION` | `PROMETHEUS_OPERATOR_CRDS_CHART_URL`  |
| `operator` (MinIO operator)            | `MINIO_OPERATOR_VERSION`           | `MINIO_OPERATOR_CHART_URL`            |
| `haproxy-ingress` (ingress controller) | `INGRESS_CONTROLLER_VERSION`       | `INGRESS_CONTROLLER_CHART_URL`        |

The `Source` column names the environment variable holding the chart repository
or OCI registry URL; those can be overridden too, for example to pull through an
internal mirror.

**Not cached:** the network load generator and metrics-server charts are
intentionally excluded (metrics-server has no pinned version) and always install
from the network.

## Managing the cache

All commands live under `solo cache chart`. They accept the shared `--quiet`,
`--cache-dir`, and `--dev-mode` flags; no other flags are needed.

### Pull charts

Download every chart in the table above and write it to the cache:

```bash
solo cache chart pull
```

The pull is incremental and safe to re-run: charts already in the cache are
skipped. A chart that fails to download is reported and skipped, and the
remaining charts still pull - re-run the command to retry the failed ones.

To cache a non-default version of a component, set its version environment
variable on the pull:

```bash
MIRROR_NODE_VERSION=v0.150.0 solo cache chart pull
```

### List cached charts

Show the cached charts (name and version):

```bash
solo cache chart list
```

### Show cache status

Report how many charts are cached, their total size on disk, and which expected
charts are missing:

```bash
solo cache chart status
```

### Clear or prune the cache

Both remove the cached chart archives; neither touches the image cache. `clear`
deletes the archives Solo expects for the current versions, while `prune`
deletes the whole `~/.solo/cache/charts/` directory (including archives left
behind by other versions):

```bash
solo cache chart clear
solo cache chart prune
```

## How deployments use the cache

When Solo installs or upgrades a chart (for example during
`solo one-shot single deploy` or `solo cluster-ref config setup`), it looks for
a cached tarball matching the **exact chart name and version** being installed:

- **Cache hit** - the chart installs from the local archive. No network fetch is
  made, and Helm receives the local tarball path instead of the repository
  reference. The debug log records the install with the message
  `from cached chart archive`.
- **Cache miss** - the chart installs from its repository or OCI registry over
  the network, exactly as it would without a cache. An empty or partial cache
  never breaks a deployment.

Because the lookup is an exact version match, keep the versions you pull and the
versions you deploy aligned. If you deploy a non-default component version (via
an environment variable or a CLI flag such as `--mirror-node-version`), pull the
cache with the matching environment variable first:

```bash
MIRROR_NODE_VERSION=v0.150.0 solo cache chart pull
MIRROR_NODE_VERSION=v0.150.0 solo one-shot single deploy
```

Otherwise the deployment simply misses the cache for that component and falls
back to a network install.

**Local chart directories win over the cache.** If you point Solo at a local
chart directory (dev mode, e.g. `--chart-dir`), that directory is used and the
cache is bypassed for that chart.

## Troubleshooting

- **A chart failed to pull.** Failures are per-chart: the failed chart is
  reported and the rest of the pull continues. Re-run `solo cache chart pull` -
  already-cached charts are skipped and only the missing ones are retried.
- **How do I confirm a deploy used the cache?** Run `solo cache chart status`
  before deploying to confirm the charts are cached, and look for
  `from cached chart archive` in the debug log (`~/.solo/logs/solo.log`) after
  deploying.
- **A component still downloads its chart.** Check that the cached version
  matches the deployed version (`solo cache chart list`); an exact-match lookup
  means any version drift falls back to the network. Also note the network load
  generator and metrics-server are never cached.
