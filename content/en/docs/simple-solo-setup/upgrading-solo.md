---
title: "Upgrading Solo"
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
latest Solo and refreshes its `kubectl` and `Helm` dependencies. Verify the new
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

> **Note:** Unlike the Homebrew formula, npm does not install `kubectl` and
> `Helm`. After a major-version upgrade, re-check the required tool versions in
> [System Readiness](/docs/simple-solo-setup/system-readiness).

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

> **Warning:** This deletes your Solo home directory (`~/.solo`), including
> cached configuration and logs. Destroy any running deployments first with
> `solo one-shot single destroy` - see the
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

For additional cleanup options (removing Solo-managed Kind clusters and other
artifacts), see
[Troubleshooting Installation](/docs/simple-solo-setup/system-readiness#troubleshooting-installation).
