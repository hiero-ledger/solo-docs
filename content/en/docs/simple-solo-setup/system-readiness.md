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
Before you deploy a local Hiero test network with `solo one-shot single deploy`, your machine must meet specific hardware, operating system, and tooling requirements. This page walks you through the minimum and recommended memory, CPU, and storage, supported platforms (macOS, Linux, and Windows via WSL2), and the required versions of Docker/Podman, Node.js, and Kubernetes tooling. By the end of this page, you will have your container runtime installed, platform-specific settings configured, and all Solo prerequisites in place so you can move on to the Quickstart and create a local network with a single command.

## Hardware Requirements

Solo's resource requirements depend on your deployment size:

| Configuration | Minimum RAM | Recommended RAM | Minimum CPU | Minimum Storage |
| --- | --- | --- | --- | --- |
| Single-node | 12 GB | 16 GB | 6 cores (8 recommended) | 20 GB free |
| Multi-node (3+ nodes) | 16 GB | 24 GB | 8 cores | 20 GB free |

> **Note:** If you are using Docker Desktop, ensure the resource limits under
> **Settings → Resources** are set to at least these values - Docker caps usage
> independently of your machine's total available memory.

## Software Requirements

Solo manages most of its own dependencies depending on how you install it:

- **Homebrew install** (`brew install hiero-ledger/tools/solo`) - automatically installs Node.js and Solo, plus kubectl and Helm as dependencies.
- **`one-shot` commands** — automatically install **Kind** and **Podman** (if Docker is not found). **kubectl and Helm are not auto-installed** and must be pre-installed.

### Pre-installation Requirements

Before running `solo one-shot single deploy`, you **must** have:
- A **container runtime**: either [Docker Desktop](https://www.docker.com/products/docker-desktop) (macOS/Windows) or Docker Engine/Podman (Linux). Solo cannot install a container runtime.
- **kubectl** and **Helm**: Solo requires these pre-installed. The `one-shot` command checks for their presence but does not install them.
  - **Homebrew users**: These are installed automatically as dependencies of the `solo` formula.
  - **npm install users** (Linux/WSL2): Install kubectl and Helm manually before running Solo.

> **Important:** The `one-shot` deployment will fail immediately if kubectl or Helm are missing, even on macOS/Windows where Homebrew typically installs them as dependencies.

| Tool           | Required Version         | Where to get it                                                                   |
|----------------|--------------------------|-----------------------------------------------------------------------------------|
| Node.js        | >= 22.0.0 (lts/jod)      | [nodejs.org](https://nodejs.org/en/download)                                      |
| Kind           | >= v0.29.0               | [kind.sigs.k8s.io](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)  |
| Kubernetes     | >= v1.32.2               | Installed automatically by Kind                                                   |
| Kubectl        | >= v1.32.2               | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/)                          |
| Helm           | v3.14.2                  | [helm.sh](https://helm.sh/docs/intro/install/)                                    |
| Docker         | See Docker section below | [docker.com](https://www.docker.com/products/docker-desktop)                      |
| k9s (optional) | >= v0.27.4               | [k9scli.io](https://k9scli.io/topics/install/)                                    |

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

   <!-- Add the Docker Desktop screenshot here -->

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

Solo supports **macOS**, **Linux**, and **Windows via WSL2**. Select your platform below to install the required container runtime and configure your environment, before proceeding to Quickstart:

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

3. Install Solo (this installs all other dependencies automatically):

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

3. Install kubectl:

    ```sh
    sudo apt update && sudo apt install -y ca-certificates curl
    ARCH="$(dpkg --print-architecture)"
    curl -fsSLo kubectl "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/${ARCH}/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/kubectl
    ```

4. Install Solo (this installs all other dependencies automatically):

    ```sh
    brew install hiero-ledger/tools/solo
    ```

5. Verify the installation:

    ```sh
    solo --version
    ```

{{% /tab %}}

{{% tab header="Windows (WSL2)" lang="wsl2" %}}

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
    - Enable WSL2 integration: Docker Desktop > Settings > Resources > WSL Integration
    - Allocate at least 12 GB of memory: Docker Desktop > Settings > Resources > Memory

4. Install kubectl:

    ```sh
    sudo apt update && sudo apt install -y ca-certificates curl
    ARCH="$(dpkg --print-architecture)"
    curl -fsSLo kubectl "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/${ARCH}/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/kubectl
    ```

4. Install Solo (this installs all other dependencies automatically):

    ```sh
    brew install hiero-ledger/tools/solo
    ```

5. Verify the installation:

    ```sh
    solo --version
    ```

> **Important:** Always run Solo commands from the WSL2 terminal, not from Windows PowerShell or Command Prompt.

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

The table below shows the full compatibility matrix for the current and recent Solo releases:

| Solo Version | Node.js | Kind | Solo Chart | Hedera | Kubernetes | Kubectl | Helm | Docker Resources | Release Date | End of Support |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.69.0 | >= 22.0.0 (lts/jod) | >= v0.29.0 | v0.63.3 | v0.71.0 | >= v1.32.2 | >= v1.32.2 | v3.14.2 | Memory >= 12GB, CPU cores >= 6 | 2026-04-14 | 2026-05-14 |
| 0.68.0 (LTS) | >= 22.0.0 (lts/jod) | >= v0.29.0 | v0.63.2 | v0.71.0 | >= v1.32.2 | >= v1.32.2 | v3.14.2 | Memory >= 12GB, CPU cores >= 6 | 2026-04-07 | 2026-10-07 |
| 0.67.0 | >= 22.0.0 (lts/jod) | >= v0.29.0 | v0.63.2 | v0.71.0 | >= v1.32.2 | >= v1.32.2 | v3.14.2 | Memory >= 12GB, CPU cores >= 6 | 2026-04-02 | 2026-05-02 |
| 0.66.0 (LTS) | >= 22.0.0 (lts/jod) | >= v0.29.0 | v0.63.2 | v0.71.0 | >= v1.32.2 | >= v1.32.2 | v3.14.2 | Memory >= 12GB, CPU cores >= 6 | 2026-04-02 | 2026-07-02 |
| 0.65.0 | >= 22.0.0 (lts/jod) | >= v0.29.0 | v0.63.2 | v0.71.0 | >= v1.32.2 | >= v1.32.2 | v3.14.2 | Memory >= 12GB, CPU cores >= 6 | 2026-03-31 | 2026-04-30 |
| 0.64.0 (LTS) | >= 22.0.0 (lts/jod) | >= v0.29.0 | v0.63.2 | v0.71.0 | >= v1.32.2 | >= v1.32.2 | v3.14.2 | Memory >= 12GB, CPU cores >= 6 | 2026-03-27 | 2026-06-27 |
| 0.63.0 | >= 22.0.0 (lts/jod) | >= v0.29.0 | v0.62.0 | v0.71.0 | >= v1.32.2 | >= v1.32.2 | v3.14.2 | Memory >= 12GB, CPU cores >= 6 | 2026-03-17 | 2026-04-17 |
| 0.62.0 (LTS) | >= 22.0.0 (lts/jod) | >= v0.29.0 | v0.62.0 | v0.71.0 | >= v1.32.2 | >= v1.32.2 | v3.14.2 | Memory >= 12GB, CPU cores >= 6 | 2026-03-17 | 2026-06-17 |
| 0.60.0 (LTS) | >= 22.0.0 (lts/jod) | >= v0.29.0 | v0.62.0 | v0.71.0 | >= v1.32.2 | >= v1.32.2 | v3.14.2 | Memory >= 12GB, CPU cores >= 6 | 2026-03-10 | 2026-06-10 |
| 0.58.0 (LTS) | >= 22.0.0 (lts/jod) | >= v0.29.0 | v0.62.0 | v0.71.0 | >= v1.32.2 | >= v1.32.2 | v3.14.2 | Memory >= 12GB, CPU cores >= 6 | 2026-02-25 | 2026-05-25 |
| 0.56.0 (LTS) | >= 22.0.0 (lts/jod) | >= v0.29.0 | v0.60.2 | v0.68.7-rc.1 | >= v1.32.2 | >= v1.32.2 | v3.14.2 | Memory >= 12GB, CPU cores >= 6 | 2026-02-12 | 2026-05-12 |
| 0.54.0 (LTS) | >= 22.0.0 (lts/jod) | >= v0.29.0 | v0.59.0 | v0.68.6+ | >= v1.32.2 | >= v1.32.2 | v3.14.2 | Memory >= 12GB, CPU cores >= 6 | 2026-01-27 | 2026-04-27 |

For a list of legacy releases, see the [legacy versions documentation](https://github.com/hiero-ledger/solo-docs/blob/main/legacy-versions.md).

## Troubleshooting Installation

If you experience issues installing or upgrading Solo (for example, conflicts with a previous installation), you may need to clean up your environment first.

### Clean up legacy npm installations

If you previously installed Solo via npm (for example, from older workshops or documentation), remove the legacy installation to avoid conflicts:

```bash
# Remove legacy npm-based Solo installation (if present)
[[ "$(command -v npm >/dev/null 2>&1 && echo 0 || echo 1)" -eq 0 ]] && { npm uninstall -g @hiero-ledger/solo >/dev/null 2>&1 || /bin/true }
```

### Full environment reset

> **Warning:** The commands below will delete Solo-managed Kind clusters and remove your Solo home directory (`~/.solo`).

```bash
# Delete only Solo-managed Kind clusters (names starting with "solo")
kind get clusters | grep '^solo' | while read cluster; do
  kind delete cluster -n "$cluster"
done

# Remove Solo configuration and cache
rm -rf ~/.solo
```

After cleaning up, retry the installation with:

```bash
brew install hiero-ledger/tools/solo
```
