---
title: "Solo CI Workflow"
weight: 5
description: >
  Learn how to integrate Solo into a GitHub Actions CI pipeline covering runner
  requirements, tool installation, and automated network deployment within CI
  environments. Set up fresh isolated Solo networks for each CI run.
categories: ["Advanced"]
tags: ["advanced", "developer", "ci-cd", "testing"]
type: docs
---

## Overview
This guide walks you through integrating Solo into a GitHub Actions CI pipeline -
covering runner requirements, tool installation, and automated network deployment.
Each step installs dependencies directly in the workflow, since CI runners are
fresh environments with no pre-installed tools.

## Prerequisites

Before proceeding, ensure you have completed the following:

- [**System Readiness**](/docs/simple-solo-setup/system-readiness) — your local environment
  meets all hardware and software requirements.
- [**Quickstart**](/docs/simple-solo-setup/quickstart) — you are familiar with the basic Solo
  workflow and the `solo one-shot single deploy` command.

This guide assumes you are integrating Solo into a GitHub Actions workflow
where each runner is a fresh environment. The steps below install all required
tools directly inside the workflow rather than relying on pre-installed
dependencies.

## Runner Requirements

Solo requires a minimum of **6 CPU cores** and **12 GB of memory** on the runner.
If these requirements are not met, Solo components may hang or fail to install
during deployment.

> **Note:** The Kubernetes cluster does not have full access to all memory
> available on the host. Setting Docker to 12 GB of memory means the Kind
> cluster running inside Docker will have access to less than 12 GB. Memory
> and CPU utilisation also increase over time as transaction load grows.
> The requirements above are validated for `solo one-shot single deploy` as
> documented in this guide.

To verify that your runner meets these requirements, add the following step to
your workflow:

  ```yaml
    - name: Check Docker Resources
      run: |
        read cpus mem <<<"$(docker info --format '{{.NCPU}} {{.MemTotal}}')"
        mem_gb=$(awk -v m="$mem" 'BEGIN{printf "%.1f", m/1000000000}')
        echo "CPU cores: $cpus"
        echo "Memory: ${mem_gb} GB"
  ```

**Expected Output:**

  ```yaml
    CPU cores: 6
    Memory: 12 GB
  ```

## Step 1: Set Up Kind

Install Kind to create and manage a local Kubernetes cluster in your workflow.

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
  > **Important:** Kind version must be **v0.29.0 or later** and  Kubernetes version must be **v1.32.2 or late**r. Solo enforces this 
  > minimum version at runtime. Installing an older version will cause deployment failures.

## Step 2: Install Node.js

  ```yaml
    - name: Set up Node.js
      uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020
      with:
        node-version: 22.12.0
  ```

## Step 3: Install Solo CLI
  Install the Solo CLI globally using npm.

  > Important: Always pin the CLI version. Unpinned installs may pick up
breaking changes from newer releases and cause unexpected workflow failures.

  ```yaml
    - name: Install Solo CLI
      run: |
        set -euo pipefail
        npm install -g @hiero-ledger/solo@<version>
        solo --version
        kind --version
  ```

## Step 4: Deploy Solo
Deploy a Solo network to your Kind cluster. This command creates and configures
a fully functional local Hiero network, including:

- Consensus Node
- Mirror Node
- Mirror Node Explorer
- JSON-RPC Relay
  
  ```yaml
    - name: Deploy Solo
      env:
        SOLO_CLUSTER_NAME: solo
        SOLO_NAMESPACE: solo
        SOLO_CLUSTER_SETUP_NAMESPACE: solo-cluster
        SOLO_DEPLOYMENT: solo-deployment
      run: |
        set -euo pipefail
        kind create cluster -n "${SOLO_CLUSTER_NAME}"
        solo one-shot single deploy | tee solo-deploy.log
  ```

## Cleanup

After the workflow completes, destroy the Solo deployment and delete the Kind
cluster to avoid leaving resources behind.

  ```yaml
    - name: Destroy Solo deployment
      env:
        SOLO_DEPLOYMENT: solo-deployment
      run: |
        set -euo pipefail
        solo one-shot single destroy --deployment "${SOLO_DEPLOYMENT}"
  ```

  ```yaml
    - name: Delete Kind cluster
      env:
        SOLO_CLUSTER_NAME: solo
      run: |
        set -euo pipefail
        kind delete cluster -n "${SOLO_CLUSTER_NAME}"
  ```

## Complete Example Workflow

The following is the full workflow combining all steps above. Copy this into your
.github/workflows/ directory as a starting point.

```yaml
name: Solo CI Example

on:
  workflow_dispatch:
    inputs:
      solo_version:
        description: 'Solo CLI version to install'
        required: false
        default: '0.69.0'
      kind_version:
        description: 'Kind version to install (minimum v0.29.0)'
        required: false
        default: 'v0.29.0'
      kubectl_version:
        description: 'kubectl version to install (minimum v1.32.2)'
        required: false
        default: 'v1.32.2'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
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
          SOLO_NAMESPACE: solo
          SOLO_CLUSTER_SETUP_NAMESPACE: solo-cluster
          SOLO_DEPLOYMENT: solo-deployment
        run: |
          set -euo pipefail
          kind create cluster -n "${SOLO_CLUSTER_NAME}"
          solo one-shot single deploy | tee solo-deploy.log

      - name: Destroy Solo deployment
        env:
          SOLO_DEPLOYMENT: solo-deployment
        run: |
          set -euo pipefail
          solo one-shot single destroy --deployment "${SOLO_DEPLOYMENT}"

      - name: Delete Kind cluster
        env:
          SOLO_CLUSTER_NAME: solo
        run: |
          set -euo pipefail
          kind delete cluster -n "${SOLO_CLUSTER_NAME}"
```
