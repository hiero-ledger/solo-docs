---
title: "Solo CI Workflow"
weight: 130
description: >
    Learn how to integrate Solo into a GitHub Actions CI pipeline - covering runner requirements, tool installation, and automated network deployment.
type: docs
---

## Overview
This guide walks you through integrating Solo into a GitHub Actions CI pipeline -
covering runner requirements, tool installation, and automated network deployment.
Each step installs dependencies directly in the workflow, since CI runners are
fresh environments with no pre-installed tools.

## Prerequisites

Before proceeding, ensure you have completed the following:

- [**System Readiness**](/onboarding/system-readiness) — your local environment
  meets all hardware and software requirements.
- [**Quickstart**](/onboarding/quickstart) — you are familiar with the basic Solo
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
        node_image: kindest/node:v1.31.4@sha256:2cb39f7295fe7eafee0842b1052a599a4fb0f8bcf3f83d96c7f4864c357c6c30
        version: v0.26.0
        kubectl_version: v1.31.4
        verbosity: 3
        wait: 120s
  ```

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
        npm install -g @hashgraph/solo@0.48.0
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

## Complete Example Workflow

The following is the full workflow combining all steps above. Copy this into your
.github/workflows/ directory as a starting point.

```yaml

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
      node_image: kindest/node:v1.31.4@sha256:2cb39f7295fe7eafee0842b1052a599a4fb0f8bcf3f83d96c7f4864c357c6c30
      version: v0.26.0
      kubectl_version: v1.31.4
      verbosity: 3
      wait: 120s
         
  - name: Set up Node.js
    uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020
    with:
      node-version: 22.12.0
      
  - name: Install Solo CLI
    run: |
      set -euo pipefail
      npm install -g @hashgraph/solo@0.48.0
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
```


