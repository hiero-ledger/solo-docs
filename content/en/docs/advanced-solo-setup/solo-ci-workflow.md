---
title: "GitHub Actions CI Integration"
weight: 5
description: >
  Integrate Solo into a GitHub Actions CI pipeline. Covers GitHub-hosted
  runners (ubuntu-latest) and self-hosted runners, including runner
  requirements, tool installation, and automated network deployment.
categories: ["Advanced"]
tags: ["advanced", "developer", "ci-cd", "testing"]
type: docs
nav_next: /docs/advanced-solo-setup/performance-tests-local/
---

## Overview

`solo one-shot single deploy` is self-contained and runs the same way in CI as
it does locally. It creates a Kind cluster if one does not already exist,
installs all required tools internally, and exits once every component is healthy.

> **Which runner type do you need?**
>
> - **GitHub-hosted (`ubuntu-latest`)** - GitHub provides and manages the
>   machine. Most common for open-source and public repos. Choose this if your
>   workflow uses `runs-on: ubuntu-latest`.
> - **Self-hosted runners** - you manage the machine (your own server, cloud VM,
>   or on-prem hardware). Choose this if your workflow uses `runs-on: self-hosted`
>   or a custom runner label, or if you need explicit control over Kind version
>   and resource allocation.
>
> Not sure which type you have? If you're using a standard GitHub account without
> dedicated runner infrastructure, you're on GitHub-hosted runners.

---

## GitHub-Hosted Runners

> If your workflow has `runs-on: ubuntu-latest`, this is your section.

Solo handles Kind cluster creation internally - you do not need to pre-create a cluster.

The workflow steps are:

1. **Checkout** your repository code.
2. **Install Node.js** (v22) and **Solo CLI** (pinned version).
3. **Deploy** the network with `solo one-shot single deploy`.
4. **Verify** the Mirror REST API is reachable - Solo exits when components are
   healthy, but the Mirror Node REST API may need a few extra seconds to become
   reachable from the host. This step polls until it is ready before your tests run.
5. **Run your tests** against the live network.
6. **Destroy** the network (`if: always()` ensures cleanup runs even on failure).
7. **Upload logs** for post-run debugging.

> **Important:** Pin `@hiero-ledger/solo@<version>` to a specific release.
> Unpinned (`@latest`) installs may pick up breaking changes and cause unexpected
> workflow failures.

### Example Workflow

```yaml
name: "Integration Tests"

on:
  pull_request:
    types: [opened, reopened, synchronize, ready_for_review]

defaults:
  run:
    shell: bash

permissions:
  contents: read

jobs:
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install Solo CLI
        run: |
          npm install -g @hiero-ledger/solo@<version>
          solo --version

      - name: One-Shot Single Deploy
        run: solo one-shot single deploy

      - name: Verify Mirror REST API
        timeout-minutes: 5
        run: |
          echo "Waiting for mirror node REST API..."
          for i in $(seq 1 30); do
            response=$(curl -sf http://localhost:38081/api/v1/accounts 2>/dev/null || true)
            if echo "${response}" | grep -q '"accounts"'; then
              echo "Mirror REST API is up."
              exit 0
            fi
            echo "Attempt ${i}/30: not ready, retrying in 10s..."
            sleep 10
          done
          echo "ERROR: Mirror REST API did not become available."
          exit 1

      # Add your integration test steps here

      - name: One-Shot Single Destroy
        if: always()
        run: solo one-shot single destroy --quiet-mode || true

      - name: Upload Logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: solo-logs
          path: ~/.solo/logs/*
          overwrite: true
          if-no-files-found: warn
```

---

## Self-Hosted Runners

> If your workflow has `runs-on: self-hosted` or a custom runner label, this is your section.

Use this setup when you manage the runner machine yourself and need explicit
control over Kind version, cluster name, or resource allocation.

### Runner Requirements

Solo requires a minimum of **6 CPU cores** and **12 GB of memory** on the runner.
If these requirements are not met, Solo components may hang or fail during deployment.

> **Note:** The Kubernetes cluster does not have full access to all host memory.
> Setting Docker to 12 GB means Kind will have access to less than 12 GB.
> Memory and CPU utilisation also increase over time as transaction load grows.

To verify that your runner meets the requirements, add this step to your workflow:

```yaml
    - name: Check Docker Resources
      run: |
        read cpus mem <<<"$(docker info --format '{{.NCPU}} {{.MemTotal}}')"
        mem_gb=$(awk -v m="$mem" 'BEGIN{printf "%.1f", m/1000000000}')
        echo "CPU cores: $cpus"
        echo "Memory: ${mem_gb} GB"
```

### Step 1: Set Up Kind

Install Kind with pinned versions to ensure reproducible builds.

```yaml
    - name: Setup Kind
      uses: helm/kind-action@a1b0e391336a6ee6713a0583f8c6240d70863de3
      with:
        install_only: true
        node_image: kindest/node:v1.32.2@sha256:3966f21e12b760f6585bde7140cae5e8cdc0e52b37a6f90ce39834b6e72e3f49
        version: v0.29.0
        kubectl_version: v1.32.2
        verbosity: 3
        wait: 120s
```

> **Important:** Kind **v0.29.0 or later** and Kubernetes **v1.32.2 or later**
> are required. Solo enforces these minimum versions at runtime.

### Step 2: Install Node.js

```yaml
    - name: Set up Node.js
      uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020
      with:
        node-version: 22.12.0
```

### Step 3: Install Solo CLI

> **Important:** Always pin the CLI version. Unpinned installs may pick up
> breaking changes from newer releases and cause unexpected workflow failures.

```yaml
    - name: Install Solo CLI
      run: |
        set -euo pipefail
        npm install -g @hiero-ledger/solo@<version>
        solo --version
        kind --version
```

### Step 4: Deploy Solo

```yaml
    - name: Deploy Solo
      env:
        SOLO_CLUSTER_NAME: solo
        SOLO_DEPLOYMENT: solo-deployment
      run: |
        set -euo pipefail
        kind create cluster -n "${SOLO_CLUSTER_NAME}"
        solo one-shot single deploy --deployment "${SOLO_DEPLOYMENT}" | tee solo-deploy.log
```

### Cleanup

After the workflow completes, destroy the Solo deployment and delete the Kind
cluster. Use `if: always()` on the destroy step so cleanup runs even when an
earlier step fails.

```yaml
    - name: Destroy Solo deployment
      if: always()
      env:
        SOLO_DEPLOYMENT: solo-deployment
      run: |
        set -euo pipefail
        solo one-shot single destroy --deployment "${SOLO_DEPLOYMENT}"

    - name: Delete Kind cluster
      if: always()
      env:
        SOLO_CLUSTER_NAME: solo
      run: |
        set -euo pipefail
        kind delete cluster -n "${SOLO_CLUSTER_NAME}"
```

### Complete Example Workflow

```yaml
name: Solo CI Example

on:
  pull_request:
    types: [opened, reopened, synchronize, ready_for_review]

jobs:
  test:
    runs-on: self-hosted
    timeout-minutes: 30
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Check Docker Resources
        run: |
          read cpus mem <<<"$(docker info --format '{{.NCPU}} {{.MemTotal}}')"
          mem_gb=$(awk -v m="$mem" 'BEGIN{printf "%.1f", m/1000000000}')
          echo "CPU cores: $cpus"
          echo "Memory: ${mem_gb} GB"

      - name: Setup Kind
        uses: helm/kind-action@a1b0e391336a6ee6713a0583f8c6240d70863de3
        with:
          install_only: true
          node_image: kindest/node:v1.32.2@sha256:3966f21e12b760f6585bde7140cae5e8cdc0e52b37a6f90ce39834b6e72e3f49
          version: v0.29.0
          kubectl_version: v1.32.2
          verbosity: 3
          wait: 120s

      - name: Set up Node.js
        uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020
        with:
          node-version: 22.12.0

      - name: Install Solo CLI
        run: |
          set -euo pipefail
          npm install -g @hiero-ledger/solo@<version>
          solo --version
          kind --version

      - name: Deploy Solo
        env:
          SOLO_CLUSTER_NAME: solo
          SOLO_DEPLOYMENT: solo-deployment
        run: |
          set -euo pipefail
          kind create cluster -n "${SOLO_CLUSTER_NAME}"
          solo one-shot single deploy --deployment "${SOLO_DEPLOYMENT}" | tee solo-deploy.log

      # Add your integration test steps here

      - name: Destroy Solo deployment
        if: always()
        env:
          SOLO_DEPLOYMENT: solo-deployment
        run: |
          set -euo pipefail
          solo one-shot single destroy --deployment "${SOLO_DEPLOYMENT}"

      - name: Delete Kind cluster
        if: always()
        env:
          SOLO_CLUSTER_NAME: solo
        run: |
          set -euo pipefail
          kind delete cluster -n "${SOLO_CLUSTER_NAME}"

      - name: Upload Logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: solo-logs
          path: ~/.solo/logs/*
          overwrite: true
          if-no-files-found: warn
```

---

## Resetting Between Tests

If your job runs multiple test suites that each need a clean genesis ledger,
you do not need to destroy and redeploy between them. Reset the ledger to
genesis after each suite to return to a known starting state without
recreating the cluster:

```yaml
    - name: Reset ledger to genesis
      env:
        SOLO_DEPLOYMENT: solo-deployment
      run: |
        set -euo pipefail
        solo ledger system reset --deployment "${SOLO_DEPLOYMENT}"
```

This applies to both runner types and is significantly faster than a
destroy-and-redeploy cycle. See
[Reset the ledger to genesis](/docs/simple-solo-setup/managing-your-network#reset-the-ledger-to-genesis)
for details and available flags.
