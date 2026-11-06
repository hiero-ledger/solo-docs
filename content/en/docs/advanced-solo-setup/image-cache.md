---
title: "Solo Image Cache"
weight: 7
description: >
  Speed up deployments by downloading the container images Solo deploys ahead
  of time. Solo fetches verified image archives from its CDN, and you manage the
  local cache with the solo cache image commands.
categories: ["Advanced", "Operations"]
tags: ["advanced", "operator", "image-cache", "performance", "docker"]
type: docs
icon: "fas fa-box"
---

## Overview

A Solo network runs roughly 30 container images (consensus node, mirror node,
JSON-RPC relay, Explorer, MinIO, and supporting services). The **image cache**
stores those images as local `.tar` archives and loads them straight into your
Kind cluster, so a deployment does not wait for every image to be pulled from
its registry.

Each Solo release can publish a **cache manifest** that lists the image archives
for that release. `solo cache image pull` reads the manifest for the Solo
version you are running, downloads the listed archives from the Solo CDN, and
checks every archive's SHA-256 hash before caching it. Any image that is not
cached is pulled by the cluster from its registry as usual, so the cache only
makes deployments faster. A deployment works without it.

> **Note:** This page describes Solo v0.92.0 and later. Earlier releases pulled
> images from their registries on your machine and exported them to the cache.
> The first `solo cache image pull` after you upgrade replaces those archives
> (see [Upgrading from an older cache](#upgrading-from-an-older-cache)).

## Prerequisites

- **Solo CLI v0.92.0 or later installed** - see
  [Quickstart](/docs/simple-solo-setup/quickstart#step-1-install-solo-cli). The
  image cache was introduced in Solo v0.73.0, but the CDN-based cache described
  here requires v0.92.0.
- **Network access to `github.com` and `cdn.solo.hiero.org`** - for the
  manifest and the archives.
- **A Kind cluster** to load images into. Archives are loaded with
  `kind load image-archive`.

## How the cache is filled

Only `solo cache image pull` writes to the image cache. It runs when:

- You run `solo cache image pull` yourself.
- A `solo one-shot` deploy runs it in its **Cache container images** phase,
  followed by `solo cache image load`.
- You accept the **first-run offer** (Solo v0.96.0 and later). If you have not
  pulled the images yet, Solo offers to download them after a command finishes,
  and shows how many images there are and their total size. In non-interactive
  sessions, and with `--quiet-mode`, Solo prints a one-line reminder instead of
  prompting. Solo makes the offer once per user. If no manifest is published for
  your version, Solo checks again after you upgrade.
- You install Solo with image caching turned on (see
  [Caching at install time](#caching-at-install-time)).

### Which images are cached

The manifest for a release lists the images that a default
`solo one-shot single deploy` of that release runs, built for both `linux/amd64`
and `linux/arm64`. Solo caches the archives for the platform of your container
engine, which is also the platform of your Kind nodes.

An image is **not** cached, and the cluster pulls it from its registry, when:

- **It is not in the manifest.** For example, a component version that differs
  from the release defaults, set with `--edge`, a `--*-version` flag, or a
  `*_VERSION` environment variable.
- **No manifest is published for your Solo version.** In this case,
  `solo cache image pull` caches nothing and leaves the existing cache
  untouched. To check whether a release has a manifest, look for
  `cache-manifest.json` among its
  [release assets](https://github.com/hiero-ledger/solo/releases).
- **Its download or verification failed.** Solo lists these images in an
  **Image cache failures** summary at the end of the run, then continues.

### Verification

Solo publishes each archive's SHA-256 hash in two places: in the manifest, and
in a `.sha256` file next to the archive on the CDN. Solo checks the archive
against both:

1. **Before downloading**, Solo checks that the published hash file matches the
   manifest. If they differ, Solo does not download the archive.
2. **After downloading**, Solo checks the archive's size (when the manifest
   records one) and then its SHA-256 hash.
3. **On every later pull**, Solo hashes each cached archive again. A cached
   archive that still matches is not downloaded again.
4. **Before loading into a cluster**, Solo hashes the archive again and compares
   it with the manifest and the stored `.sha256` file. If the manifest cannot be
   downloaded, Solo checks against the stored file only.

Solo deletes any archive that fails a check, together with its hash file, so
the next `solo cache image pull` downloads it again. A failed check during
`load` stops the load with `SOLO-5088` (see
[Troubleshooting](#troubleshooting)).

### Automatic cleanup

Each `solo cache image pull` that reads a manifest also tidies the cache before
it downloads anything:

- **Pruning:** Solo deletes archives and hash files that the current manifest
  does not list, for example the archives of a Solo version you upgraded from.
  The cache only ever holds the images of the version you are running.
- **Migration:** Solo deletes archives that have no `.sha256` file next to them.
  An older version of Solo cached these archives, and Solo cannot verify them.
  The same pull downloads the published archive for each image.

The **Tidy the image cache** step shows what changed, and an
**Image cache maintenance** summary at the end of the run lists every file Solo
removed. When no manifest is available, Solo skips this cleanup and removes
nothing.

## Where the cache lives

Image archives are stored in `~/.solo/cache/images/` (or
`$SOLO_HOME/cache/images/` when `SOLO_HOME` is set). Each image has a `.tar`
archive and a `.tar.sha256` hash file, named after the image reference with
every `/` and `:` replaced by `__`. For example:
`docker.io__library__busybox__1.36.1.tar`.

## Managing the cache

All commands live under `solo cache image`.

### Pull images

Download the archives listed in the manifest for your Solo version, verify
them, and write them to the cache. This is a prerequisite for `load`. `pull`
does not need a running cluster.

```bash
solo cache image pull
```

`pull` also accepts `--edge` and the per-component version flags
`--mirror-node-version`, `--block-node-version`, `--relay-version`, and
`--explorer-version`. These change which images Solo looks for, not what the
manifest contains: an image version that is not in the manifest is reported as
`not in the manifest, skipped`.

### Load images into a cluster

Load the cached archives into a Kind cluster. This step needs a prior `pull`
and a cluster with a configured cluster reference.

```bash
solo cache image load --cluster-ref <cluster-ref>
```

`<cluster-ref>` is a Solo cluster reference: an alias Solo maps to a Kubernetes
context.

- `solo one-shot` deployments create one named `one-shot`.
- List the references you already have with `solo cluster-ref config list`.
- Create a new one with
  `solo cluster-ref config connect --cluster-ref <name> --context <kube-context>`.

`load` skips images that are already loaded in the cluster and images that are
not cached. It also skips an archive that an older version of Solo cached,
because the archive has no hash file to verify it against. Run
`solo cache image pull` to replace that archive.

### List cached archives

```bash
solo cache image list
```

### Show cache status

Report how many images are cached, their total size, and which expected
archives are missing. Pass `--cluster-ref` to also compare the cache against the
images already loaded in a cluster.

```bash
solo cache image status --cluster-ref <cluster-ref>
```

### Clear or prune the cache

```bash
solo cache image clear
solo cache image prune
```

- `clear` deletes the archives and hash files of the images Solo expects.
- `prune` deletes the whole Solo cache directory (`~/.solo/cache/`), including
  the [chart cache](/docs/advanced-solo-setup/chart-cache/). Use `clear` to
  remove only the image archives.

You rarely need either command: `solo cache image pull` already removes
archives that are outdated or fail verification.

## Caching at install time

Since Solo v0.95.0, installing Solo does not download images by default. To
fill the cache during installation, opt in:

| Install method | Opt-in | Notes |
| --- | --- | --- |
| npm global install | `SOLO_WITH_IMAGE_CACHE=true` | For example, `SOLO_WITH_IMAGE_CACHE=true npm install -g @hiero-ledger/solo`. Local (non-global) installs never download images. |
| Linux install script (`install.sh`) | `--with-image-cache` | Skipped when the script runs under `sudo`. Run `solo cache image pull` as your own user instead. |

An install-time download is best-effort: if it fails, the install still
succeeds, and you can run `solo cache image pull` later.

> **Note:** Solo v0.74.0 to v0.94.0 downloaded images on every global npm
> install, and `SOLO_NO_CACHE=true` turned this off. From v0.95.0,
> `SOLO_NO_CACHE` is ignored. The deprecated Homebrew formula still downloads
> images during install; set `HOMEBREW_NO_SOLO_CACHE` to any value to skip it.

## Disabling the cache in one-shot deployments

`solo one-shot` deploys pull and load the image cache by default. Set
`ENABLE_IMAGE_CACHE=false` to skip the whole **Cache container images** phase.
The cluster then pulls every image from its registry.

```bash
ENABLE_IMAGE_CACHE=false solo one-shot single deploy
```

This requires Solo v0.78.0 or later. Earlier releases had an inverted-logic bug
in this variable.

## Overriding the manifest and CDN locations

By default, Solo downloads the manifest from the GitHub release of the Solo
version you are running:

```text
https://github.com/hiero-ledger/solo/releases/download/v<solo-version>/cache-manifest.json
```

Solo downloads archives and hash files from `https://cdn.solo.hiero.org`. To
test a staging manifest or use a mirror of the archives, override either
location:

| Environment Variable | Description |
| --- | --- |
| `SOLO_CACHE_MANIFEST_URL` | Full URL of the manifest to use instead of the release asset. |
| `SOLO_CACHE_CDN_BASE_URL` | Base URL to download archives and hash files from. |

The manifest's `soloVersion` must still match the Solo version you are running,
or Solo rejects the manifest.

## Upgrading from an older cache

After you upgrade Solo, run `solo cache image pull` (or let the next
`solo one-shot` deploy run it). That pull:

- deletes the archives of the previous Solo version that the new manifest does
  not list, and
- replaces archives that Solo releases before v0.92.0 cached, which have no
  hash file.

Until then, `solo cache image load` skips those older archives and the cluster
pulls the images from their registries.

## Troubleshooting

- **`[SOLO-4049] Cache has not been materialized yet`** - `load` and `list` need
  a cache that `solo cache image pull` has populated. Run
  `solo cache image pull` first, then retry the command.
- **`pull` reports `skipped, no image cache manifest available`.** No manifest
  is published for your Solo version, or Solo could not download it.
  Deployments still work, and the cluster pulls images from their registries. If
  you expect a manifest, check your network connection to `github.com`, and
  check whether `SOLO_CACHE_MANIFEST_URL` is set.
- **An image shows `not in the manifest, skipped`.** You requested a component
  version that the release does not publish, for example with `--edge` or a
  version flag. The cluster pulls that image from its registry.
- **`[SOLO-5088] Cached image archive ... does not match the hash published for it`**
  \- the archive changed after it was downloaded, so Solo deleted it instead of
  loading it. Run `solo cache image pull` to download it again, then retry.
- **`load` cannot find the target cluster.** Confirm the cluster reference with
  `solo cluster-ref config list`, then re-run `load` with the correct
  `--cluster-ref`.
- **The cache is empty after installing Solo.** Installs do not download images
  by default. Run `solo cache image pull`, or accept the first-run offer.
