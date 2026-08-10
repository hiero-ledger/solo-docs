---
title: 'Run Performance Tests Locally'
weight: 6
description: >
  Run Solo E2E performance tests locally, including setup, execution, optional
  local build path configuration, and branch workflow triggering.
categories: ['Advanced', 'Testing']
tags: ['advanced', 'performance', 'testing', 'ci-cd']
type: docs
nav_prev: /docs/advanced-solo-setup/solo-ci-workflow/
nav_next: /docs/advanced-solo-setup/cli/
---

## Overview

This guide shows how to run the Solo E2E performance test on a local machine.

## Prerequisites

- `task`, `node`, `npm`, `kubectl`, and `kind` installed
- Docker running
- Solo dependencies installed (`npm ci`)

## Run the Performance Test

From the repository root:

```bash
task test-setup
task test-e2e-performance
```

The test uses one-shot single deploy/destroy flow and then runs rapid-fire load
tests.

## What Gets Tested

The test suite runs four sequential load tests using the Network Load Generator
(NLG), each for 5 minutes by default (controlled by
`ONE_SHOT_METRICS_TEST_DURATION_IN_MINUTES`):

| Load Test              | What it submits                          |
|------------------------|------------------------------------------|
| `TokenTransferLoadTest`  | Fungible token transfers                 |
| `NftTransferLoadTest`    | NFT transfers                            |
| `CryptoTransferLoadTest` | HBAR crypto transfers                    |
| `HCSLoadTest`            | Hedera Consensus Service (HCS) messages  |

All four tests target a max of **100 TPS** with 5 concurrent threads and 1,000
accounts. After all load tests complete, the suite sleeps for one additional
metrics-collection window to capture steady-state resource usage.

## Metrics Measured

The test collects two categories of metrics:

### Workload metrics (per load test)

| Metric | Unit | Description |
|---|---|---|
| TPS | transactions/second | Throughput achieved by the NLG during the load window |
| Transaction count | count | Total transactions submitted in the load window |
| End-to-end mirror RTT | milliseconds | Time from transaction submission to visibility in the Mirror Node REST API |
| RTT percentiles (p50, p95, max) | milliseconds | Distribution of 5 RTT probe samples taken concurrently during each load test |

### Kubernetes resource metrics (polled every 5 seconds)

| Metric | Unit | Description |
|---|---|---|
| CPU | millicores | Aggregate CPU across all pods in the test namespace |
| Memory | MiB | Aggregate memory across all pods in the test namespace |
| Peak CPU | millicores | Highest CPU snapshot recorded across the full test run |
| Peak memory | MiB | Highest memory snapshot recorded across the full test run |

Per-pod breakdowns are included in the JSON output for post-run analysis.

## Expected Output

### Console output (per load test)

A healthy run prints a green result line after each load test:

```text
TokenTransferLoadTest: TPS 100 (30000 transactions in 300 sec), RTT 450 ms
TokenTransferLoadTest: end-to-end mirror RTT max 499 ms (p50 320 ms, p95 480 ms, 5 samples)
```

During the post-test metrics collection window you will see:

```text
performance-tests: sleeping for metrics collection, 1 of 5 minutes
performance-tests: sleeping for metrics collection, 2 of 5 minutes
...
performance-tests: sleeping for metrics collection, 5 of 5 minutes
```

### Summary JSON

After the test completes, a summary is written to
`~/.solo/logs/<namespace>.json`. The example below shows the structure and
fields — actual values will differ based on your hardware and Solo version:

```json
{
  "snapshotName": "performance-tests-3712495",
  "date": "2026-07-28T10:15:42.123Z",
  "gitHubSha": "",
  "soloVersion": "0.85.0",
  "soloChartVersion": "0.65.0",
  "consensusNodeVersion": "v0.74.0",
  "mirrorNodeVersion": "0.159.0",
  "blockNodeVersion": "0.38.0",
  "relayVersion": "0.77.0",
  "explorerVersion": "26.1.0",
  "cpuInMillicores": 1842,
  "memoryInMebibytes": 2331,
  "runtimeInMinutes": 62,
  "transactionCount": 120000,
  "events": [
    "Starting TokenTransferLoadTest",
    "Starting NftTransferLoadTest",
    "Starting CryptoTransferLoadTest",
    "Starting HCSLoadTest",
    "Completed all performance tests"
  ],
  "peakCpuInMillicores": 2100,
  "peakCpuSnapshot": "performance-tests-3712495",
  "peakMemoryInMebibytes": 2331,
  "peakMemorySnapshot": "performance-tests-3712495",
  "clusterMetrics": ["..."]
}
```

A full timeline of all 5-second snapshots is written to
`~/.solo/logs/<namespace>/timeline-metrics.json` for trend analysis.

## Interpreting Results

### Healthy indicators

| Signal | What to look for |
|---|---|
| All four load tests print a green result line | TPS reported as non-zero |
| `events` array ends with `"Completed all performance tests"` | All tests ran to completion |
| `memoryInMebibytes` under **3,000 MiB** | CI threshold — above this indicates a regression |
| End-to-end mirror RTT under **600 ms** | RTT probe target; values near or above this indicate mirror node lag |

### Problem indicators

| Signal | Likely cause |
|---|---|
| A load test prints no result line or exits with `NO_RESULT` | NLG pod failed to start or crashed mid-run |
| TPS is 0 with 0 transactions | Consensus node was unreachable or rejected all transactions |
| `memoryInMebibytes` above 3,000 MiB | Memory regression — compare per-pod breakdown in `clusterMetrics` to identify the culprit |
| RTT consistently above 600 ms | Mirror node importer lag; check importer pod logs |
| `events` array is missing later entries | Test timed out or threw before completing all load tests |

> **Note:** The `SmartContractLoadTest` is currently disabled (`it.skip`) pending
> an upstream fix and will not appear in results.

## Optional: Use a Local Consensus Node Build

If you already have a local consensus node build, set `SOLO_LOCAL_BUILD_PATH` so
commands that consume `--local-build-path` can use it by default:

```bash
export SOLO_LOCAL_BUILD_PATH="/absolute/path/to/hiero-consensus-node/hedera-node/data"
task test-setup
task test-e2e-performance
```

## Optional: Shorten Test Duration

You can shorten load-test duration while iterating:

```bash
export ONE_SHOT_METRICS_TEST_DURATION_IN_MINUTES=2
task test-e2e-performance
```

## Run the GitHub Performance Workflow for a Branch

You can run the repository performance workflow against any pushed Solo branch.

### Option 1: Using `gh` CLI

```bash
export SOLO_BRANCH="<your-branch-name>"
gh workflow run "Performance Test Solo Deployment" --ref "${SOLO_BRANCH}" --repo hiero-ledger/solo
```

Watch the latest run for that branch:

```bash
RUN_ID=$(gh run list --workflow "Performance Test Solo Deployment" --branch "${SOLO_BRANCH}" --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch "${RUN_ID}" --repo hiero-ledger/solo
```

### Option 2: Using GitHub Web UI

1. Open
   `https://github.com/hiero-ledger/solo/actions/workflows/flow-performance-test.yaml`.
2. Click `Run workflow`.
3. Select your branch in the branch dropdown.
4. Click `Run workflow` to start the run.
