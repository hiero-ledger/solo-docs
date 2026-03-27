---
title: "Using Network Load Generator with Solo"
weight: 2
description: >
  Learn how to run load tests against a Solo network using the Network Load
  Generator (NLG). Generate realistic transaction flows and stress-test your
  deployment to verify performance under load.
categories: ["Advanced", "Operations"]
tags: ["advanced", "operator", "testing"]
type: docs
---

## Using Network Load Generator with Solo

The Network Load Generator (NLG) is a benchmarking tool that stress tests Hiero networks by generating configurable transaction loads. Use it to validate the performance and
stability of your Solo network before deploying to production or running
integration tests.

## Prerequisites

Before proceeding, ensure you have completed the following:

- [**System Readiness**](/docs/simple-solo-setup/system-readiness) — your local environment
  meets all hardware and software requirements.
- [**Quickstart**](/docs/simple-solo-setup/quickstart) — you have a running Solo network
  and are familiar with the basic Solo workflow.

## Step 1: Start a Load Test

Use the `rapid-fire load start` command to install the NLG Helm chart and
begin a load test against your deployment.

 ```bash
    npx @hashgraph/solo@latest rapid-fire load start \
  --deployment <deployment-name> \
  --args '"-c 3 -a 10 -t 60"' \
  --test CryptoTransferLoadTest
 ```

Replace `<deployment-name>` with your deployment name. You can find it by running:

```bash
cat ~/.solo/cache/last-one-shot-deployment.txt
```

The `--args` flag passes arguments directly to the NLG. In this example:

- -c 3 — 3 concurrent threads
- -a 10 — 10 accounts
- -t 60 — run for 60 seconds

## Step 2: Run Multiple Load Tests (Optional)

You can run additional load tests in parallel from a separate terminal. Each
test runs independently against the same deployment:

```bash
    npx @hashgraph/solo@latest rapid-fire load start \
  --deployment <deployment-name> \
  --args '"-c 3 -a 10 -t 60"' \
  --test NftTransferLoadTest
```

## Step 3: Stop a Specific Load Test

To stop a single running load test before it completes, use the `stop` command:

```bash
    npx @hashgraph/solo@latest rapid-fire load stop \
  --deployment <deployment-name> \
  --test CryptoTransferLoadTest
```

## Step 4: Tear Down All Load Tests

To stop all running load tests and uninstall the NLG Helm chart:

```bash
    npx @hashgraph/solo@latest rapid-fire destroy all \
  --deployment <deployment-name>
 ```

## Complete Example

For an end-to-end walkthrough with a full configuration, see the [examples/rapid-fire](https://github.com/hiero-ledger/solo/tree/main/examples/rapid-fire).

## Available Tests and Arguments
A full list of all available `rapid-fire` commands can be found in [Solo CLI User Manual](/docs/advanced-solo-setup/solo-cli#rapid-fire).
