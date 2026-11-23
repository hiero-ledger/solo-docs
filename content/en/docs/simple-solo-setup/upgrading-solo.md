---
title: 'Upgrading an existing Solo installation'
weight: 5
description: >
  Upgrade an existing npm installation of Solo to the latest release, install a
  specific version, and perform a clean reinstall when an upgrade leaves a
  broken or conflicting state.
categories: ['Getting Started', 'Installation']
tags: ['installation', 'upgrade', 'npm', 'maintenance']
type: docs
icon: "fas fa-download"
---

## Overview

If you already have Solo installed, upgrade to the latest release with npm. This
page covers the npm upgrade path, installing a specific version, and a
clean-reinstall recipe for when an upgrade leaves Solo in a broken state.

> **Tip:** Check your current version first with `solo --version`, and compare
> it against the latest release on the
> [Solo releases page](https://github.com/hiero-ledger/solo/releases).

## Upgrade an npm install

If you installed Solo with npm, re-run the global install with the `@latest` tag
to move to the newest release:

```bash
npm install -g @hiero-ledger/solo@latest
```

> **Note:** npm does not install Node.js - make sure Node.js >= 22.0.0 is
> present before upgrading. (Solo provisions kubectl, Helm, and
> Kind automatically at deploy time regardless of install method.) After a
> major-version upgrade, re-check the required tool versions in
> [System Readiness](/docs/simple-solo-setup/system-readiness).

## Resolving an `EEXIST` package-name conflict

Solo is published to npm under two package names - `@hiero-ledger/solo` and
`@hashgraph/solo` - that are mirrors of the same tool. Both install the same
`solo` command-line binary, so only one can be globally installed at a time. If
you already installed Solo under one name and then install it under the other,
npm refuses to overwrite the existing binary and the install fails with
`EEXIST`:

```text
npm error code EEXIST
npm error path /Users/user/.nvm/versions/node/v22.14.0/bin/solo
npm error EEXIST: file already exists
npm error File exists: /Users/user/.nvm/versions/node/v22.14.0/bin/solo
npm error Remove the existing file and try again, or run npm with --force to overwrite files recklessly.
```

This is expected npm behavior - npm will not overwrite a binary owned by a
different package name. To resolve it, uninstall the other package first, then
install the one you want:

```bash
# Switching to the @hiero-ledger namespace
npm uninstall -g @hashgraph/solo
npm install -g @hiero-ledger/solo@latest
```

> **Note:** If you installed under `@hiero-ledger/solo` and want to move to
> `@hashgraph/solo`, swap the names in the commands above.

If the install still reports `EEXIST` after uninstalling - for example because
an orphaned `solo` binary was left behind - remove the leftover binary and
reinstall:

```bash
rm "$(which solo)"
npm install -g @hiero-ledger/solo@latest
```

> **Tip:** To remove every npm copy of Solo regardless of namespace, see
> [Clean up legacy npm installations](/docs/simple-solo-setup/cleanup#clean-up-legacy-npm-installations).

## Install a specific version

To install a specific (non-latest) Solo release - for example, to reproduce a
bug, run a regression test, or pin a version across a team - use a versioned
npm tag instead of `latest`.

> **Note:** A versioned npm tag **pins** Solo to that release - it will not move
> when you run `npm update`. To change versions later (including returning to
> the latest release, or **downgrading**), switching in place is **not
> supported**: uninstall Solo first (`npm uninstall -g @hiero-ledger/solo`), then
> run the versioned install command below for the version you want. This keeps
> your `~/.solo` data - only a [Clean reinstall](#clean-reinstall) removes it.

```bash
npm install -g @hiero-ledger/solo@0.76.0
```

> **Note:** Since Solo v0.95.0, installing Solo does not download container
> images. Run `solo cache image pull` after installing to fill the
> [image cache](/docs/advanced-solo-setup/image-cache) with that version's
> images (a few minutes and several GB), or install with
> `SOLO_WITH_IMAGE_CACHE=true`. The pull also removes the images of the
> version you upgraded from. Solo v0.74.0 to v0.94.0 downloaded the images
> during every global npm install, unless `SOLO_NO_CACHE=true` was set.

Confirm the installed version:

```bash
solo --version
```

> **Tip:** To return to the latest release, uninstall the pinned version and
> follow [Upgrade an npm install](#upgrade-an-npm-install) above. If
> `solo --version` still reports an old version afterwards, another `solo`
> binary is earlier on your `PATH`; find it with `which -a solo` (PowerShell:
> `Get-Command solo -All`) and remove it.

## Clean reinstall

If an upgrade leaves Solo in a broken state - for example, conflicts from an
older install or a partially migrated `~/.solo` - remove Solo and its
configuration, then reinstall.

> **Warning:** This deletes your Solo home directory (`~/.solo`), including the
> [image cache](/docs/advanced-solo-setup/image-cache), cached configuration,
> and logs. Run `solo cache image pull` after reinstalling to fill the image
> cache again (a few minutes, several GB). Destroy any running deployments first
> with `solo one-shot single destroy` - see the
> [Cleanup guide](/docs/simple-solo-setup/cleanup).

{{< tabpane text=true >}} {{% tab header="Bash" lang="bash" %}}

```bash
npm uninstall -g @hiero-ledger/solo
rm -rf ~/.solo
npm install -g @hiero-ledger/solo@latest
```

{{% /tab %}} {{% tab header="PowerShell" lang="powershell" %}}

```powershell
npm uninstall -g @hiero-ledger/solo
Remove-Item -Recurse -Force "$env:USERPROFILE\.solo"
npm install -g @hiero-ledger/solo@latest
```

{{% /tab %}} {{< /tabpane >}}

Confirm the reinstall:

```bash
solo --version
```

For additional cleanup options - removing a legacy npm install, Solo-managed
Kind clusters, and other artifacts - see the
[Cleanup guide](/docs/simple-solo-setup/cleanup).
