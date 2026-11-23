---
title: "System Readiness"
weight: 1
description: >
  Verify hardware and software requirements before deploying a local Hiero
  test network with Solo. Check system prerequisites, install Docker/Podman,
  configure platform-specific settings, and ensure your machine is ready.
categories: ["Getting Started", "Prerequisites"]
tags: ["beginner", "installation", "prerequisites", "docker", "system-requirements", "kubernetes"]
type: docs
icon: "fas fa-clipboard-check"
---

## Overview

Before you deploy a local Hiero test network with `solo one-shot single deploy`, your machine must meet specific hardware, operating system, and tooling requirements.

This page covers the minimum and recommended memory, CPU, and storage; supported platforms (macOS, Linux, and Windows — natively with PowerShell, or via WSL2); and the required versions of Docker/Podman, Node.js, and Kubernetes tooling.

By the end of this page, your container runtime will be installed and your platform environment configured. Then proceed to [Quickstart](/docs/simple-solo-setup/quickstart) to install Solo and deploy.

## Hardware Requirements

Solo's resource requirements depend on your deployment size:

| Configuration | Minimum RAM | Recommended RAM | Minimum CPU | Minimum Storage |
| --- | --- | --- | --- | --- |
| Single-node | 12 GB | 16 GB | 6 cores | 20 GB free |
| Multi-node (3+ nodes) | 16 GB | 24 GB | 8 cores | 20 GB free |

> **Note:** If you are using Docker Desktop, ensure the resource limits under
> **Settings → Resources** are set to at least these values - Docker caps usage
> independently of your machine's total available memory.

## Software Requirements

Solo sets up most of the tools it needs for you. The table below shows what each
install method provides, what Solo provisions automatically, and what you must
install yourself.

| Tool | Required version | How it is installed |
| --- | --- | --- |
| [Solo](https://github.com/hiero-ledger/solo) | latest | `npm install -g @hiero-ledger/solo@latest` (recommended); on Linux, the [install script](/docs/simple-solo-setup/linux-install-script) (no Node.js needed) |
| [Node.js](https://nodejs.org/en/download) | >= 22.0.0 (lts/jod) | **You install it** (required for npm; not needed for the Linux install script) |
| Container runtime ([Docker](https://www.docker.com/products/docker-desktop) / [Podman](https://podman.io)) | See [Docker](#docker) below | **You install it** — Docker Desktop (macOS/Windows) or Docker Engine (Linux). Solo installs Podman instead on Linux/macOS/WSL2 when the `docker` command is not found (see [Podman fallback](#podman-fallback)). Not supported on native Windows. |
| [kubectl](https://kubernetes.io/docs/reference/kubectl/) | >= v1.32.2 | **Solo provisions it** at deploy time - reuses a compatible copy already on your system, or downloads one into `~/.solo/bin` |
| [Helm](https://helm.sh) | v4.3.1 | **Solo provisions it** at deploy time |
| [Kind](https://kind.sigs.k8s.io) | >= v0.29.0 | **Solo provisions it** at deploy time |
| [Kubernetes](https://kubernetes.io) | v1.31.9 (Kind node image) | Installed automatically by Kind when Solo creates the cluster; override the node image with `SOLO_KIND_NODE_IMAGE` |
| [k9s](https://k9scli.io/topics/install/) (optional) | >= v0.27.4 | You install it |

> **Note:** Solo's provisioned copies of kubectl, Kind, and Helm live in `~/.solo/bin`,
> which is not necessarily on your `PATH`. If you want to run `kubectl`, `kind`, or `helm`
> commands yourself (some guides do), install [kubectl](https://kubernetes.io/docs/tasks/tools/),
> [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation), and
> [Helm](https://helm.sh/docs/intro/install/) on your `PATH` separately.

### Windows (WSL2) prerequisite

Solo runs Kubernetes inside Docker, and Docker Desktop on Windows runs its
Linux engine in a virtual machine: the WSL2 backend (the default, and the only
option on Windows Home) or Hyper-V. Both Windows paths on this page — native
PowerShell and the Ubuntu (WSL2) terminal — therefore need WSL2 (or Hyper-V)
and hardware virtualization. The native PowerShell path only removes the need
for a WSL2 Linux distro and terminal.

To enable WSL2 without installing a distro:

```powershell
wsl --install --no-distribution
```

WSL2 requires hardware virtualization and the Virtual Machine Platform Windows
feature. If `wsl --install` reports `HCS_E_HYPERV_NOT_INSTALLED`, enable
virtualization in your firmware (BIOS/UEFI) settings and turn on the Virtual
Machine Platform feature, then retry. Docker Desktop cannot run Solo without
them.

## Docker

Solo requires Docker Desktop (macOS, Windows) or Docker Engine / Podman (Linux) with sufficient resources:

- **Memory**: at least 12 GB available for containers.
- **CPU**: at least 6 cores available for containers.

### Configure Resources by Platform

#### macOS and Windows (Docker Desktop)

To allocate the required resources in Docker Desktop:

1. Open **Docker Desktop**.
2. Go to **Settings > Resources > Memory** and set it to at least **12 GB**.
3. Go to **Settings > Resources > CPU** and set it to at least **6 cores**.
4. Click **Apply & Restart**.

   ![Docker Desktop resource allocation settings](../docker_resource_image.png)

> **Windows with the WSL2 backend:** Docker Desktop does not show memory and
> CPU settings when it uses WSL2; Windows sets the WSL2 VM's limits instead (by
> default, half of your machine's memory). To give it 12 GB and 6 CPUs, create
> or edit `%UserProfile%\.wslconfig`:
>
> ```ini
> [wsl2]
> memory=12GB
> processors=6
> ```
>
> Then run `wsl --shutdown` in PowerShell and restart Docker Desktop.

To check what your container engine actually has available:

```bash
docker info --format '{{.NCPU}} CPUs / {{.MemTotal}} bytes'
```

You need at least 6 CPUs and 12 GB of memory. The memory is shown in bytes, so
12 GB appears as a number of about `12000000000` or more.

> **Note:** If Docker Desktop does not have enough memory or CPU allocated, the one-shot deployment will fail or produce unhealthy pods.

#### Linux

Docker Engine on Linux uses system memory directly and does not have a resource allocation interface like Docker Desktop.

**Resource Check:**
- Ensure your machine has **at least 12 GB of free RAM** available before running `solo one-shot single deploy`.
- Check available memory with: `free -h`
- If you have insufficient RAM, the deployment may fail or pods may become unhealthy.

**Podman on Linux:**
If using Podman instead of Docker Engine, ensure your system has at least 12 GB of free RAM available.

#### Podman fallback

When the `docker` command is not on your `PATH` (or `FORCE_PODMAN=true` is set),
Solo sets up Podman itself the first time it creates a cluster:

- **Linux:** Solo installs `git` and `iptables` with your system package manager,
  then installs Homebrew if it is missing and uses it to install Podman, and runs
  Podman in rootful mode. These steps run `sudo`, so expect a password prompt;
  an unattended run without `sudo` access stops here.
- **macOS:** Solo installs Podman and runs it in a Podman virtual machine.

To keep Solo from changing your system, install Docker (or Podman) yourself
before your first deploy.

## Platform Setup

Solo supports **macOS**, **Linux**, and **Windows** (natively with PowerShell, or via WSL2). Select your platform below to install the required container runtime and configure your environment, before proceeding to Quickstart:

{{< tabpane text=true >}}

{{% tab header="macOS" lang="macos" %}}

1. Install Node.js (>= 22.0.0):

    Download from [nodejs.org](https://nodejs.org/en/download), or install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating):

    ```sh
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    source ~/.nvm/nvm.sh
    nvm install --lts
    ```

2. Install Docker Desktop:
    - Download from: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
    - Start Docker Desktop and configure resources:
      - **Settings → Resources → Memory**: set to at least **12 GB**
      - **Settings → Resources → CPU**: set to at least **6 cores**
      - Click **Apply & Restart**

    > **macOS prerequisite:** Docker Desktop must be open before running `solo one-shot single deploy`. The Docker daemon is not started automatically on macOS, so confirm Docker Desktop is running from your menu bar before you begin.

3. Install Solo:

    ```sh
    npm install -g @hiero-ledger/solo@latest
    ```

4. Verify the installation:

    ```sh
    solo --version
    ```

{{% /tab %}}

{{% tab header="Linux" lang="linux" %}}

1. Install Node.js (>= 22.0.0):

    Using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) (recommended):

    ```sh
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    source ~/.nvm/nvm.sh
    nvm install --lts
    ```

    Or download from [nodejs.org](https://nodejs.org/en/download).

2. Install Docker Engine (Ubuntu/Debian):

    ```sh
    sudo apt-get update
    sudo apt-get install -y docker.io
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker ${USER}
    ```

    Log out and back in for the group changes to take effect.

    > **Fedora/RHEL:** Replace the `apt-get` commands above with your distro's
    > package manager. For example, on Fedora: `sudo dnf install -y docker-ce
    > docker-ce-cli containerd.io` (after adding Docker's dnf repo — see
    > [Docker's Fedora guide](https://docs.docker.com/engine/install/fedora/)).
    > Then run `sudo systemctl enable --now docker` and
    > `sudo usermod -aG docker ${USER}`.

3. Install Solo:

    ```sh
    npm install -g @hiero-ledger/solo@latest
    ```

4. Verify the installation:

    ```sh
    solo --version
    ```

{{% /tab %}}

{{% tab header="Windows" lang="windows" %}}

Run Solo natively from **Windows PowerShell**. Run every command below in a PowerShell terminal.

1. Install Docker Desktop for Windows:
    - Download from: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).
    - Start Docker Desktop and configure resources:
      - **Settings → Resources → Memory**: set to at least **12 GB**
      - **Settings → Resources → CPU**: set to at least **6 cores**
      - Click **Apply & Restart**

      With the default WSL2 backend these settings are not shown; set the
      limits in `.wslconfig` instead, as described in
      [Configure Resources by Platform](#macos-and-windows-docker-desktop).

    > **Windows prerequisite:** Docker Desktop must be running before you run `solo one-shot single deploy`. It needs WSL2 (or Hyper-V) and hardware virtualization; see [Windows (WSL2) prerequisite](#windows-wsl2-prerequisite).

2. Install Node.js (>= 22.0.0):

    ```powershell
    winget install OpenJS.NodeJS.LTS
    ```

    Or download the installer from [nodejs.org](https://nodejs.org/en/download).

> **Note:** Open a new PowerShell window after installing tools so updated PATH entries take effect.

Your environment is ready. Proceed to [Quickstart](/docs/simple-solo-setup/quickstart) to install Solo and deploy.

{{% /tab %}}

{{% tab header="Windows (WSL2)" lang="wsl2" %}}

> **Note:** Make sure your machine meets the
> [Windows (WSL2) prerequisite](#windows-wsl2-prerequisite) first. If WSL
> and a Linux distribution are already installed, skip step 1 (and you may use a
> distribution other than Ubuntu).

1. Run the following command in Windows PowerShell (as Administrator), then reboot and open the Ubuntu terminal. All subsequent commands must be run inside the Ubuntu (WSL2) terminal.

   ```sh
   wsl --install Ubuntu
   ```

2. Install Node.js (>= 22.0.0) inside the Ubuntu terminal:

    Using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating):

    ```sh
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    source ~/.nvm/nvm.sh
    nvm install --lts
    ```

3. Install Docker Desktop for Windows:
    - Download from: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
    - Enable WSL2 integration: **Settings → Resources → WSL Integration**
    - Configure resources:
      - **Settings → Resources → Memory**: set to at least **12 GB**
      - **Settings → Resources → CPU**: set to at least **6 cores**
      - Click **Apply & Restart**

4. Install Solo:

    ```sh
    npm install -g @hiero-ledger/solo@latest
    ```

5. Verify the installation:

    ```sh
    solo --version
    ```

{{% /tab %}}

{{< /tabpane >}}

## Optional Tools

The following tools are not required but are recommended for monitoring and managing your local network:

- **k9s** (`>= v0.27.4`): A terminal-based UI for managing Kubernetes clusters.
  See the [k9s installation guide](https://k9scli.io/topics/install/) for your
  platform, then run `k9s` to launch the cluster viewer.

## Version Compatibility Reference

{{< solo-releases-table >}}

## Troubleshooting Installation

If you experience issues installing or upgrading Solo - for example, conflicts
with a previous installation - clean up your environment and reinstall:

- To **remove a legacy npm install** or perform a **full environment reset**
  (delete Solo-managed Kind clusters and your `~/.solo` directory), see the
  [Cleanup guide](/docs/simple-solo-setup/cleanup).
- To **upgrade an existing install** or install a **specific version**, see
  [Upgrading an existing Solo installation](/docs/simple-solo-setup/upgrading-solo).
- **macOS "mounts denied" error on Apple Silicon**: If `solo one-shot single deploy`
  fails immediately with a **"mounts denied"** or **"path is not shared from the host"**
  error, Docker cannot read the directory Solo is installed in. Solo's Kind
  cluster mounts files from its own install directory, which is under
  `/opt/homebrew` when Node.js was installed with Homebrew on an Apple Silicon
  Mac, and Docker Desktop does not share that path by default. Run
  `npm root -g` to see where global npm packages live, then add that path (or
  `/opt/homebrew`) under **Settings → Resources → File Sharing → +** →
  **Apply & Restart**.
- **WSL2 fails to install** (for example, `wsl --install` reports
  `HCS_E_HYPERV_NOT_INSTALLED`): WSL2 requires hardware virtualization and the
  Virtual Machine Platform feature. Enable virtualization in your firmware
  settings and see Microsoft's
  [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install) guide.
  Both Windows paths need it, because Docker Desktop runs on WSL2 or Hyper-V.
- **First deploy fails with a PostgreSQL startup timeout**: If
  `solo one-shot single deploy` fails during mirror node setup with a
  PostgreSQL startup timeout, this is a known intermittent issue on first
  deploy. Destroy the deployment and retry:

  ```sh
  solo one-shot single destroy
  solo one-shot single deploy
  ```
