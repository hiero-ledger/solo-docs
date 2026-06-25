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
---

## Overview
Before you deploy a local Hiero test network with `solo one-shot single deploy`, your machine must meet specific hardware, operating system, and tooling requirements. This page walks you through the minimum and recommended memory, CPU, and storage, supported platforms (macOS, Linux, and Windows — natively with PowerShell, or via WSL2), and the required versions of Docker/Podman, Node.js, and Kubernetes tooling. By the end of this page, you will have your container runtime installed, platform-specific settings configured, and all Solo prerequisites in place so you can move on to the Quickstart and create a local network with a single command.

## Hardware Requirements

Solo's resource requirements depend on your deployment size:

| Configuration | Minimum RAM | Recommended RAM | Minimum CPU | Minimum Storage |
| --- | --- | --- | --- | --- |
| Single-node | 12 GB | 16 GB | 4 cores | 20 GB free |
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
| [Solo](https://github.com/hiero-ledger/solo) | latest | `brew install hiero-ledger/tools/solo`, or `npm install -g @hiero-ledger/solo` |
| [Node.js](https://nodejs.org/en/download) | >= 22.0.0 (lts/jod) | **Homebrew installs it for you**; with **npm you install it yourself** |
| Container runtime ([Docker](https://www.docker.com/products/docker-desktop) / [Podman](https://podman.io)) | See [Docker](#docker) below | **You install it** — Docker Desktop (macOS/Windows) or Docker Engine (Linux). Solo auto-installs Podman on Linux/macOS/WSL2 if Docker Engine is not found. Not supported on native Windows. |
| [kubectl](https://kubernetes.io/docs/reference/kubectl/) | >= v1.32.2 | **Solo provisions it** at deploy time - reuses a compatible copy already on your system, or downloads one into `~/.solo/bin` |
| [Helm](https://helm.sh) | v3.14.2 | **Solo provisions it** at deploy time |
| [Kind](https://kind.sigs.k8s.io) | >= v0.29.0 | **Solo provisions it** at deploy time |
| [Kubernetes](https://kubernetes.io) | >= v1.32.2 | Installed automatically by Kind |
| [k9s](https://k9scli.io/topics/install/) (optional) | >= v0.27.4 | You install it |

> **Note:** Solo's provisioned copies of kubectl, Kind, and Helm live in `~/.solo/bin`,
> which is not necessarily on your `PATH`. If you want to run `kubectl`, `kind`, or `helm`
> commands yourself (some guides do), install [kubectl](https://kubernetes.io/docs/tasks/tools/),
> [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation), and
> [Helm](https://helm.sh/docs/intro/install/) on your `PATH` separately.

### Windows (WSL2) prerequisite

Kind (which Solo provisions automatically) requires WSL2 to be enabled on
Windows, but you do not need a WSL2 Linux distro installed — only the WSL2
feature itself. Enable it with:

```powershell
wsl --install --no-distribution
```

WSL2 requires hardware virtualization and the Virtual Machine Platform Windows
feature. If virtualization is unavailable (for example, `wsl --install` reports
`HCS_E_HYPERV_NOT_INSTALLED`), use the native **Windows (PowerShell)** path
instead, which does not require WSL2.

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

> **Note:** If Docker Desktop does not have enough memory or CPU allocated, the one-shot deployment will fail or produce unhealthy pods.

#### Linux

Docker Engine on Linux uses system memory directly and does not have a resource allocation interface like Docker Desktop.

**Resource Check:**
- Ensure your machine has **at least 12 GB of free RAM** available before running `solo one-shot single deploy`.
- Check available memory with: `free -h`
- If you have insufficient RAM, the deployment may fail or pods may become unhealthy.

**Podman on Linux:**
If using Podman instead of Docker Engine, ensure your system has at least 12 GB of free RAM available.

## Platform Setup

Solo supports **macOS**, **Linux**, and **Windows** (natively with PowerShell, or via WSL2). Select your platform below to install the required container runtime and configure your environment, before proceeding to Quickstart:

{{< tabpane text=true >}}

{{% tab header="macOS" lang="macos" %}}

1. Install Homebrew (if not already installed):

    ```sh
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

2. Install Docker Desktop:
    - Download from: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
    - Start Docker Desktop and allocate at least 12 GB of memory:
    - Docker Desktop > Settings > Resources > Memory

    > **macOS prerequisite:** Docker Desktop must be open before running `solo one-shot single deploy`. The Docker daemon is not started automatically on macOS, so confirm Docker Desktop is running from your menu bar before you begin.

3. Install Solo:

    ```sh
    brew install hiero-ledger/tools/solo
    ```

4. Verify the installation:

    ```sh
    solo --version
    ```

{{% /tab %}}

{{% tab header="Linux" lang="linux" %}}

1. Install Homebrew for Linux:

    ```sh
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

    Add Homebrew to your PATH:

    ```sh
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
    ```

2. Install Docker Engine (for Ubuntu/Debian):

    ```sh
    sudo apt-get update
    sudo apt-get install -y docker.io
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker ${USER}
    ```

    Log out and back in for the group changes to take effect.

3. Install Solo:

    ```sh
    brew install hiero-ledger/tools/solo
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
    - Start Docker Desktop and allocate at least 12 GB of memory: Docker Desktop > Settings > Resources > Memory.

    > **Windows prerequisite:** Docker Desktop must be running before you run `solo one-shot single deploy`.

2. Install Node.js (>= 22.0.0):

    ```powershell
    winget install OpenJS.NodeJS.LTS
    ```

    Or download the installer from [nodejs.org](https://nodejs.org/en/download).

3. Install Solo via npm. 
    
    npm installs the Solo CLI only; Solo provisions kubectl, Helm, and Kind automatically at deploy time:

    ```powershell
    npm install -g @hiero-ledger/solo@latest
    ```

4. Verify the installation:

    ```powershell
    solo --version
    ```

> **Note:** Open a new PowerShell window after installing tools so updated PATH entries take effect.

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

2. Install Homebrew for Linux:

    ```sh
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

    Add Homebrew to your PATH:

    ```sh
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
    ```

3. Install Docker Desktop for Windows:
    - Download from: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
    - Enable WSL2 integration: Docker Desktop > Settings > Resources > WSL Integration.
    - Allocate at least 12 GB of memory: Docker Desktop > Settings > Resources > Memory.

4. Install Solo:

    ```sh
    brew install hiero-ledger/tools/solo
    ```

5. Verify the installation:

    ```sh
    solo --version
    ```

{{% /tab %}}

{{< /tabpane >}}

## Alternative Installation: npm (for contributors and advanced users)

If you need more control over dependencies or are contributing to Solo development, you can install Solo via npm instead of Homebrew.

> **Note:** Node.js >= 22.0.0 and Kind must be installed separately before using this method.

```bash
npm install -g @hiero-ledger/solo
```

## Optional Tools

The following tools are not required but are recommended for monitoring and managing your local network:

- **k9s** (`>= v0.27.4`): A terminal-based UI for managing Kubernetes clusters. Install it with:

  ```bash
  brew install k9s
  ```

  Run `k9s` to launch the cluster viewer.

## Version Compatibility Reference

{{< solo-releases-table >}}

## Troubleshooting Installation

If you experience issues installing or upgrading Solo - for example, conflicts
with a previous installation - clean up your environment and reinstall:

- To **remove a legacy npm install** or perform a **full environment reset**
  (delete Solo-managed Kind clusters and your `~/.solo` directory), see the
  [Cleanup guide](/docs/simple-solo-setup/cleanup).
- To **upgrade an existing install**, install a **specific version**, or switch
  between Homebrew and npm, see
  [Upgrading an existing Solo installation](/docs/simple-solo-setup/upgrading-solo).
- **macOS "mounts denied" error on Apple Silicon**: If `solo one-shot single deploy`
  fails immediately with a **"mounts denied"** or **"path is not shared from the host"**
  error, add `/opt/homebrew` to Docker Desktop's File Sharing list:
  **Settings → Resources → File Sharing → +** → add `/opt/homebrew` → **Apply & Restart**.
  This can occur on Apple Silicon Macs (M1/M2/M3/M4) when Homebrew's install path
  (`/opt/homebrew`) is not included in Docker Desktop's shared directories.
  Intel Mac users (Homebrew path `/usr/local`) are not affected.
- **WSL2 fails to install** (for example, `wsl --install` reports
  `HCS_E_HYPERV_NOT_INSTALLED`): WSL2 requires hardware virtualization and the
  Virtual Machine Platform feature. See Microsoft's
  [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install) guide, or
  use the native **Windows (PowerShell)** path, which does not require WSL2.
