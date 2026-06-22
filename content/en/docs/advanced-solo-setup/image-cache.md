---
title: "Solo Image Cache"
weight: 7
description: >
  Speed up deployments by pre-pulling and reusing the container images Solo
  needs. Manage the local image cache with the solo cache image commands, and
  control automatic caching during install and one-shot deployments.
categories: ["Advanced", "Operations"]
tags: ["advanced", "operator", "image-cache", "performance", "docker"]
type: docs
---

## Overview

A Solo network runs roughly 29 container images (consensus node, mirror node,
JSON-RPC relay, Explorer, MinIO, and supporting services).
The **image cache** pre-pulls those images and stores them as local `.tar`
archives, so repeat deployments load them from disk instead of re-downloading
them from their registries.

Solo populates and uses the cache automatically in two places:

- **At install time** - Homebrew and npm installs pre-pull the default images.
- **During `solo one-shot` deploys** - Solo pulls and loads the cached images
  as pipeline phases before the network is deployed.

You can also manage the cache directly with the `solo cache image` commands.

## Prerequisites

- **Solo CLI v0.73.0 or later installed** - the image cache was introduced in
  Solo v0.73.0; earlier versions have no `solo cache image` command. See
  [Quickstart](/docs/simple-solo-setup/quickstart#install-solo-cli).

## Where the cache lives

Cached image archives are stored under your Solo home directory, in
`~/.solo/cache/images/` (one archive per image).

## Managing the cache

All commands live under `solo cache image`.

### Pull images

Download the default (stable) images and write them to the cache. This is a
prerequisite for `load`.

```bash
solo cache image pull
```

Pass `--edge` to cache the edge (pre-release) component versions instead of the
stable defaults:

```bash
solo cache image pull --edge
```

You can also pin individual components with the per-component version flags
`--mirror-node-version`, `--block-node-version`, `--relay-version`, and
`--explorer-version`.

### Load images into a cluster

Load the cached archives into a cluster. This step needs a prior `pull` and a
running cluster with a configured cluster reference (`pull` itself needs
neither a running cluster nor a Docker daemon).

```bash
solo cache image load --cluster-ref <cluster-ref>
```

`<cluster-ref>` is a Solo cluster reference: an alias Solo maps to a Kubernetes
context.

- `solo one-shot` deployments create one named `one-shot`.
- List the references you already have with `solo cluster-ref config list`.
- Create a new one with
  `solo cluster-ref config connect --cluster-ref <name> --context <kube-context>`.

### List cached archives

```bash
solo cache image list
```

### Show cache status

Report which images are cached and which are missing. Pass `--cluster-ref` to
also compare against the images already loaded in a cluster.

```bash
solo cache image status --cluster-ref <cluster-ref>
```

### Clear or prune the cache

Remove cached image archives with `clear`, or with `prune` (Solo v0.78.0 and
later):

```bash
solo cache image clear
solo cache image prune
```

## Disabling the cache

The image cache is enabled by default. Each install/deploy path has its own
opt-out:

| Context | Opt-out | Notes |
| --- | --- | --- |
| `solo one-shot` deploy | `ENABLE_IMAGE_CACHE=false` | **Requires Solo v0.78.0 or later.** |
| npm global install | `SOLO_NO_CACHE=true` | Skips the post-install image pull. |
| Homebrew install | `HOMEBREW_NO_SOLO_CACHE` | Set to any value (presence-based). Skips both the brew-level pull and the npm post-install pull. |

## Caching a specific component version

Solo resolves the component versions it caches from **environment variables**,
not from CLI flags or `solo.config.yaml`. To cache a non-default version, set
the version environment variable on the deploy command:

```bash
MIRROR_NODE_VERSION=v0.150.0 solo one-shot single deploy
```

> **Note:** Passing the version with the `--mirror-node-version` CLI flag (or in
> `solo.config.yaml`) changes the deployed component but **not** the cached
> images -  the cache still uses the default versions, which can cause a cache
> miss on first deploy. Use the environment variable to keep the cache aligned
> with the deployed versions.

## Troubleshooting

- **`[SOLO-4049] Cache has not been materialized yet`** — the `load`, `list`,
  `status`, `clear`, and `prune` commands require a populated cache. Run
  `solo cache image pull` first, then retry the command.
- **The cache is empty after installing Solo.** The install-time pull is
  best-effort and can be skipped by a network hiccup. Populate it manually with
  `solo cache image pull`.
- **`load` cannot find the target cluster.** Confirm the cluster reference with
  `solo cluster-ref config list`, then re-run `load` with the correct
  `--cluster-ref`.
