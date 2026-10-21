---
title: 'Linux Install Script'
weight: 3
description: >
  Install Solo on Linux as a standalone binary with one command, without
  Node.js. Covers supported platforms, install options, what the script changes
  on your system, how it verifies the download, and how to upgrade or remove it.
categories: ['Getting Started', 'Installation']
tags: ['beginner', 'installation', 'linux', 'cli']
type: docs
icon: 'fab fa-linux'
---

## Overview

The install script installs the Solo CLI on Linux as a single standalone binary,
so you don't need Node.js or npm. Every Solo release since v0.92.0 publishes it.

> **Note:** The install script supports Linux only. On macOS or Windows, or on a
> Linux system the script doesn't support yet, install Solo with npm as
> described in the
> [Quickstart](/docs/simple-solo-setup/quickstart#step-1-install-solo-cli).

## Supported Platforms

| Platform                     | Release binary     | Available since |
| ---------------------------- | ------------------ | --------------- |
| Linux x86_64 (amd64), glibc  | `solo-linux-x64`   | v0.92.0         |
| Linux arm64 (aarch64), glibc | `solo-linux-arm64` | v0.94.0         |

Alpine Linux and other musl-based distributions aren't supported yet. Install
Solo with npm on those systems.

The script needs `curl` or `wget`, and `sha256sum` or `shasum`.

## Install Solo

### One-line install

```bash
curl -fsSL https://github.com/hiero-ledger/solo/releases/latest/download/install.sh | sh
```

To pass [options](#options) to the script, add `-s --` after `sh`:

```bash
curl -fsSL https://github.com/hiero-ledger/solo/releases/latest/download/install.sh | sh -s -- --skip-image-cache
```

### Download, inspect, then run

The one-line install runs the script before you can read it. To review it first,
or if your organization blocks piping scripts into a shell, download it, inspect
it, and then run it:

```bash
curl -fsSL https://github.com/hiero-ledger/solo/releases/latest/download/install.sh -o install.sh
less install.sh
sh install.sh
```

Each release also publishes a Sigstore signature for the script. If you have
[cosign](https://github.com/sigstore/cosign) 2.4.2 or later installed, you can
verify the script before you run it:

```bash
curl -fsSL https://github.com/hiero-ledger/solo/releases/latest/download/install.sh.sigstore.json -o install.sh.sigstore.json
cosign verify-blob install.sh --bundle install.sh.sigstore.json \
  --certificate-identity-regexp '^https://github.com/hiero-ledger/solo/\.github/workflows/' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

`Verified OK` means a GitHub Actions workflow in the `hiero-ledger/solo`
repository signed the script.

### Verify the installation

Open a new terminal, or run `export PATH="$PATH:$HOME/.solo/bin"` in the current
one, and then check the version:

```bash
solo --version
```

## Options

| Option               | Description                                               | Default                                         |
| -------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| `--version <tag>`    | Release to install, for example `v0.94.0`.                | `latest`                                        |
| `--prefix <dir>`     | Directory to install the `solo` binary into.              | `~/.solo/bin`                                   |
| `--skip-image-cache` | Don't download Solo's container images after installing.  | Images are downloaded                           |
| `--base-url <url>`   | Base URL to download releases from, for example a mirror. | `https://github.com/hiero-ledger/solo/releases` |
| `-h`, `--help`       | Show the options and exit.                                |                                                 |

You can also set the install directory with the `SOLO_INSTALL_DIR` environment
variable. `--prefix` takes precedence over it.

`--version` works for v0.92.0 and later, and for v0.94.0 and later on arm64.
Earlier releases don't publish the standalone binary.

A mirror passed to `--base-url` must use the same layout as GitHub Releases:
`<url>/latest/download/<file>` and `<url>/download/<tag>/<file>`.

## What the Script Does

1. Detects your CPU architecture and C library, and picks the matching binary.
2. Downloads the release's `SHA256SUMS` file. If cosign 2.4.1 or later is
   installed, it verifies the file's signature and stops if the signature isn't
   valid. Without cosign, or with an older version, it skips the signature check
   and tells you.
3. Downloads the binary and compares its SHA-256 checksum with `SHA256SUMS`. If
   they don't match, it stops without installing anything.
4. Runs the new binary with `--version` before installing it, so a binary that
   can't run on your system leaves any existing install in place.
5. Installs the binary to `~/.solo/bin/solo`, or to the `--prefix` directory.
6. Adds `~/.solo/bin` to your `PATH` (see [PATH setup](#path-setup)).
7. Warns you if another `solo`, for example one installed with npm, comes first
   on your `PATH`. Remove it with `npm uninstall -g @hiero-ledger/solo` so the
   new binary runs.
8. Runs `solo cache image pull` to download the container images Solo deploys,
   which speeds up your first deployment. If this step fails, for example
   because Docker isn't running, the install still succeeds; run
   `solo cache image pull` later to retry. When you install with `sudo`, the
   script skips this step, so run the command as your own user afterwards.

## PATH Setup

When the script installs to the default directory and `~/.solo/bin` isn't on
your `PATH` yet, it adds the directory to your shell's startup file. It picks
the file from your `SHELL` environment variable:

| Shell | Startup file                                         | What the script adds                                                    |
| ----- | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| bash  | `~/.bashrc`                                          | Lines between `# >>> solo installer >>>` and `# <<< solo installer <<<` |
| zsh   | `~/.zshrc` (`$ZDOTDIR/.zshrc` when `ZDOTDIR` is set) | The same lines                                                          |
| fish  | `~/.config/fish/conf.d/solo.fish`                    | A new file                                                              |

With any other shell, or when you install to another directory with `--prefix`
or `SOLO_INSTALL_DIR`, the script doesn't change any startup file. It prints the
`export PATH=...` line for you to add yourself.

## Upgrade Solo

Run the install command again. It installs the latest release over the existing
binary and leaves your `PATH` setup and Solo configuration as they are. To
install a specific release, pass `--version`:

```bash
curl -fsSL https://github.com/hiero-ledger/solo/releases/latest/download/install.sh | sh -s -- --version v0.94.0
```

## Uninstall Solo

Solo doesn't have an uninstall command yet. To remove a script install by hand:

1. Delete the binary and the files it unpacks on its first run:

   ```bash
   rm ~/.solo/bin/solo
   rm -rf ~/.solo/sea-resources
   ```

   If you installed with `--prefix` or `SOLO_INSTALL_DIR`, delete `solo` from
   that directory instead of `~/.solo/bin`.

2. Remove the `PATH` entry the script added:
   - bash or zsh: delete the lines from `# >>> solo installer >>>` to
     `# <<< solo installer <<<` in `~/.bashrc` or `~/.zshrc`.
   - fish: delete the file the script created:

     ```bash
     rm ~/.config/fish/conf.d/solo.fish
     ```

This leaves your running networks and Solo's configuration in `~/.solo` in
place. To remove those as well, see [Cleanup](/docs/simple-solo-setup/cleanup).
