---
title: "One-Shot Deploy on a GitHub-hosted Runner"
weight: 6
description: >
    Deploy a full Solo network on a standard GitHub-hosted Ubuntu runner using the one-shot single deploy command. No self-hosted runner or pre-provisioned cluster required.
type: docs
---

## Deploy Solo on a Standard GitHub Runner

This guide is for developers who want to deploy a Solo network in CI to run integration
tests against a live Hedera network from their own project. It uses the standard `ubuntu-latest`
GitHub-hosted runner and the Solo CLI installed via Homebrew.

For the hardware specs that runner provides, see
[GitHub's documentation on standard hosted runners](https://docs.github.com/en/actions/using-github-hosted-runners/using-github-hosted-runners/about-github-hosted-runners#standard-github-hosted-runners-for-public-repositories).

---

## How It Works

Solo's one-shot deploy is self-contained. You do **not** need to:

- Pre-create a Kind cluster
- Install Helm separately
- Run `solo init` manually

The command handles cluster provisioning, tool installation, and full network deployment
internally, then exits when every component is healthy.

```
GitHub Runner (ubuntu-latest)
  └─► solo one-shot single deploy
        ├─► Kind cluster created automatically
        ├─► Consensus Node deployed and started
        ├─► Mirror Node deployed and started
        ├─► Explorer deployed and started
        └─► JSON-RPC Relay deployed and started
```

---

## Example Workflow

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

      - name: Install Solo CLI
        run: |
          brew install hiero-ledger/tools/solo
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
