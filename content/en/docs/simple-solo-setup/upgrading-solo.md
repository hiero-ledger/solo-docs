---
title: "Upgrading an existing Solo installation"
weight: 5
description: >
  Upgrade an existing Solo installation to the latest release - whether you
  installed via Homebrew or npm - and perform a clean reinstall when an upgrade
  leaves a broken or conflicting state.
categories: ["Getting Started", "Installation"]
tags: ["installation", "upgrade", "homebrew", "npm", "maintenance"]
type: docs
---

## Overview

If you already have Solo installed, upgrade to the latest release using the same
package manager you originally installed with. This page covers the Homebrew and
npm upgrade paths, switching between them, and a clean-reinstall recipe for when
an upgrade leaves Solo in a broken state.

> **Tip:** Check your current version first with `solo --version`, and compare
> it against the latest release on the
> [Solo releases page](https://github.com/hiero-ledger/solo/releases).

## Upgrade a Homebrew install

If you installed Solo with `brew install hiero-ledger/tools/solo`, update
Homebrew's formula list and upgrade:

```bash
brew update
brew upgrade hiero-ledger/tools/solo
```

`brew update` refreshes Homebrew's formulae; `brew upgrade` then installs the
latest Solo (and Node.js, its only Homebrew dependency). Verify the new
version:

```bash
solo --version
```

## Upgrade an npm install

If you installed Solo with npm, re-run the global install with the `@latest`
tag to move to the newest release:

```bash
npm install -g @hiero-ledger/solo@latest
```

> **Note:** Unlike the Homebrew formula, npm does not install Node.js - make
> sure Node.js is present before upgrading. (Solo provisions kubectl, Helm, and
> Kind automatically at deploy time regardless of install method.) After a
> major-version upgrade, re-check the required tool versions in
> [System Readiness](/docs/simple-solo-setup/system-readiness).

> **nvm users:** If the upgrade fails with `EEXIST: file already exists`, the
> old binary is still in place. Remove it first, then reinstall - or follow the
> [Clean reinstall](#clean-reinstall) steps below.

## Install a specific version

To install a specific (non-latest) Solo release - for example, to reproduce a
bug, run a regression test, or pin a version across a team - use a versioned
Homebrew formula or npm tag instead of `latest`.

> **Note:** A versioned brew formula or npm tag **pins** Solo to that release - it
> will not move when you run `brew upgrade` or `npm update`. To change versions
> later (including returning to the latest release, or **downgrading**),
> switching in place is **not supported**: uninstall Solo first
> (`brew uninstall hiero-ledger/tools/solo`, or `npm uninstall -g @hiero-ledger/solo`),
> then run the versioned install command below for the version you want. This
> keeps your `~/.solo` data - only a [Clean reinstall](#clean-reinstall) removes
> it. If you are switching package managers, see also
> [Switching between Homebrew and npm](#switching-between-homebrew-and-npm).

{{< tabpane text=true >}}
{{% tab header="Homebrew" lang="homebrew" %}}
```bash
brew install hiero-ledger/tools/solo@0.76.0
```
The tap publishes a versioned formula (`solo@<version>`) for each release.
{{% /tab %}}
{{% tab header="npm" lang="npm" %}}
```bash
npm install -g @hiero-ledger/solo@0.76.0
```
{{% /tab %}}
{{< /tabpane >}}

> **Note:** On Solo v0.74.0 and later, a global install - including a pinned
> version - automatically pre-pulls that version's container images into the
> [image cache](/docs/advanced-solo-setup/image-cache) (`~/.solo/cache/images/`),
> which can take a few minutes and several GB on first run. Set
> `SOLO_NO_CACHE=true` (npm) or `HOMEBREW_NO_SOLO_CACHE` (Homebrew) to skip it.

Confirm the installed version:

```bash
solo --version
```

## Switching between Homebrew and npm

If you want to switch package managers (for example, from an older npm install
to Homebrew), remove the existing copy first so you do not end up with two
`solo` binaries on your `PATH`:

```bash
# Remove the npm copy before installing via Homebrew (or vice versa)
npm uninstall -g @hiero-ledger/solo
```

Then follow the install steps in
[System Readiness](/docs/simple-solo-setup/system-readiness#platform-setup).

## Clean reinstall

If an upgrade leaves Solo in a broken state - for example, conflicts from an
older install or a partially migrated `~/.solo` - remove Solo and its
configuration, then reinstall.

> **Warning:** This deletes your Solo home directory (`~/.solo`), including the
> [image cache](/docs/advanced-solo-setup/image-cache), cached configuration,
> and logs. The reinstall step below re-pulls the image cache (a few minutes,
> several GB) on Solo v0.74.0 and later. Destroy any running deployments first
> with `solo one-shot single destroy` - see the
> [Cleanup guide](/docs/simple-solo-setup/cleanup).

{{< tabpane text=true >}}
{{% tab header="Homebrew" lang="homebrew" %}}
```bash
brew uninstall hiero-ledger/tools/solo
rm -rf ~/.solo
brew install hiero-ledger/tools/solo
```
{{% /tab %}}
{{% tab header="npm" lang="npm" %}}
```bash
npm uninstall -g @hiero-ledger/solo
rm -rf ~/.solo
npm install -g @hiero-ledger/solo@latest
```
{{% /tab %}}
{{< /tabpane >}}

Confirm the reinstall:

```bash
solo --version
```

For additional cleanup options - removing a legacy npm install, Solo-managed
Kind clusters, and other artifacts - see the
[Cleanup guide](/docs/simple-solo-setup/cleanup).
