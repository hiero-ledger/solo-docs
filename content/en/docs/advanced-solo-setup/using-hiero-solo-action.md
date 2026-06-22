---
title: "Using hiero-solo-action in CI"
weight: 7
description: >
  Use the hiero-solo-action composite action to spin up a temporary Solo network
  in GitHub Actions without managing Kind, Helm, or Solo CLI installation yourself.
categories: ["Advanced"]
tags: ["advanced", "developer", "ci-cd", "testing"]
type: docs
---

## Overview

The [hiero-solo-action](https://github.com/hiero-ledger/hiero-solo-action) composite action
deploys a Solo network inside a GitHub Actions job. It installs all required dependencies —
Kind, Helm, Node.js, Java, and Python — and creates a funded account whose keys are
available as step outputs.

## Runner Requirements

The action requires a **Linux runner** (`ubuntu-latest` or equivalent). All dependencies are
installed by the action itself; no pre-installed tools are required on the runner. For hardware
sizing guidance, see [Runner Requirements](/docs/advanced-solo-setup/solo-ci-workflow#runner-requirements).

## Minimal Example

```yaml
- name: Setup Solo Network
  uses: hiero-ledger/hiero-solo-action@<VERSION>
  id: solo
  with:
    soloVersion: "0.78.0"

- name: Run Tests
  env:
    ACCOUNT_ID: ${{ steps.solo.outputs.accountId }}
    PUBLIC_KEY: ${{ steps.solo.outputs.publicKey }}
    PRIVATE_KEY: ${{ steps.solo.outputs.privateKey }}
  run: |
    echo "Account ID: $ACCOUNT_ID"
    echo "Public Key: $PUBLIC_KEY"
    echo "Private Key: $PRIVATE_KEY"
    # Connect your SDK to localhost:35211 using ACCOUNT_ID and PRIVATE_KEY
```

**Expected Output:**

```yaml
Account ID: 0.0.1002
Public Key: 302a300506032b6570032100104651be92e4d234acdfbe05e5b2d74982868fc9698f4be49a71c9787a419cbd
Private Key: 302e020100300506032b6570042204209111894988a58ed7ab38bde01c4ea37a59ffd59dedb6726fe230021ad4199fdc
```

> **Note:** Replace `<VERSION>` with the latest tag from
> [hiero-solo-action releases](https://github.com/hiero-ledger/hiero-solo-action/releases).
> The action's default `soloVersion` lags behind the latest Solo release — set it explicitly to
> the version you are testing against. The exact `Account ID` varies per deployment. Keys are
> DER-encoded hex strings (ED25519 private key begins with `302e`, public key with `302a`).

## Common Configurations

### With Mirror Node

```yaml
- name: Setup Solo Network
  uses: hiero-ledger/hiero-solo-action@<VERSION>
  id: solo
  with:
    soloVersion: "0.78.0"
    installMirrorNode: true
```

The mirror node REST API is available at `localhost:38081`.

### With JSON-RPC Relay

Setting `installRelay: true` automatically deploys a mirror node alongside the relay (the relay requires one).

```yaml
- name: Setup Solo Network
  uses: hiero-ledger/hiero-solo-action@<VERSION>
  id: solo
  with:
    soloVersion: "0.78.0"
    installRelay: true
```

The JSON-RPC Relay is available at `localhost:37546`. The mirror node REST API is also available at `localhost:38081`.

### With Dual Mode (Two Consensus Nodes)

```yaml
- name: Setup Solo Network
  uses: hiero-ledger/hiero-solo-action@<VERSION>
  id: solo
  with:
    soloVersion: "0.78.0"
    dualMode: true
```

Node 1 is accessible at `localhost:35211`; node 2 at `localhost:36211`.

## Outputs

The action creates one ED25519 account and one ECDSA account, and exposes their keys as step outputs.

| Output | Key type | Description |
|---|---|---|
| `accountId`, `publicKey`, `privateKey` | ED25519 | Default account (shorthand aliases) |
| `ed25519AccountId`, `ed25519PublicKey`, `ed25519PrivateKey` | ED25519 | Same account, explicit names |
| `ecdsaAccountId`, `ecdsaPublicKey`, `ecdsaPrivateKey` | ECDSA | ECDSA account |
| `deployment` | — | Always `"solo-deployment"` |

## Full Input Reference

For the complete list of inputs, port overrides, and version alignment notes, see the
[hiero-solo-action README](https://github.com/hiero-ledger/hiero-solo-action#inputs).
