---
title: "CLI Migration Reference"
weight: 2
aliases:
- /docs/cli-migrations/
description: >
  Legacy-to-current Solo CLI command mappings for users migrating from
  pre-v0.44 command paths.
categories: ["Advanced", "Reference"]
tags: ["cli", "migration", "reference"]
type: docs
---

## Overview

Use this page when migrating scripts or runbooks from legacy Solo CLI command paths (`< v0.44.0`) to the current command structure.

For full current syntax and flags, see [Solo CLI Reference](/docs/advanced-solo-setup/cli/solo-cli).

## Legacy to Current Mapping

| Legacy command | Current command |
| --- | --- |
| `init` | `init` |
| `block node add` | `block node add` |
| `block node destroy` | `block node destroy` |
| `block node upgrade` | `block node upgrade` |
| `account init` | `ledger system init` |
| `account update` | `ledger account update` |
| `account create` | `ledger account create` |
| `account get` | `ledger account info` |
| `quick-start single deploy` | `one-shot single deploy` |
| `quick-start single destroy` | `one-shot single destroy` |
| `cluster-ref connect` | `cluster-ref config connect` |
| `cluster-ref disconnect` | `cluster-ref config disconnect` |
| `cluster-ref list` | `cluster-ref config list` |
| `cluster-ref info` | `cluster-ref config info` |
| `cluster-ref setup` | `cluster-ref config setup` |
| `cluster-ref reset` | `cluster-ref config reset` |
| `deployment add-cluster` | `deployment cluster attach` |
| `deployment list` | `deployment config list` |
| `deployment create` | `deployment config create` |
| `deployment delete` | `deployment config delete` |
| `explorer deploy` | `explorer node add` |
| `explorer destroy` | `explorer node destroy` |
| `mirror-node deploy` | `mirror node add` |
| `mirror-node destroy` | `mirror node destroy` |
| `relay deploy` | `relay node add` |
| `relay destroy` | `relay node destroy` |
| `network deploy` | `consensus network deploy` |
| `network destroy` | `consensus network destroy` |
| `node keys` | `keys consensus generate` |
| `node freeze` | `consensus network freeze` |
| `node upgrade` | `consensus network upgrade` |
| `node setup` | `consensus node setup` |
| `node start` | `consensus node start` |
| `node stop` | `consensus node stop` |
| `node restart` | `consensus node restart` |
| `node refresh` | `consensus node refresh` |
| `node add` | `consensus node add` |
| `node update` | `consensus node update` |
| `node delete` | `consensus node destroy` |
| `node add-prepare` | `consensus dev-node-add prepare` |
| `node add-submit-transaction` | `consensus dev-node-add submit-transactions` |
| `node add-execute` | `consensus dev-node-add execute` |
| `node update-prepare` | `consensus dev-node-update prepare` |
| `node update-submit-transaction` | `consensus dev-node-update submit-transactions` |
| `node update-execute` | `consensus dev-node-update execute` |
| `node upgrade-prepare` | `consensus dev-node-upgrade prepare` |
| `node upgrade-submit-transaction` | `consensus dev-node-upgrade submit-transactions` |
| `node upgrade-execute` | `consensus dev-node-upgrade execute` |
| `node delete-prepare` | `consensus dev-node-delete prepare` |
| `node delete-submit-transaction` | `consensus dev-node-delete submit-transactions` |
| `node delete-execute` | `consensus dev-node-delete execute` |
| `node prepare-upgrade` | `consensus dev-freeze prepare-upgrade` |
| `node freeze-upgrade` | `consensus dev-freeze freeze-upgrade` |
| `node logs` | `deployment diagnostics logs` |
| `node download-generated-files` | No direct equivalent. Use `deployment diagnostics all` or `deployment diagnostics debug` based on intent. |
| `node states` | `consensus state download` |

## Notes

- Current command tree includes additional commands not present in legacy CLI (for example `ledger account predefined`, `deployment refresh port-forwards`, and `consensus node collect-jfr`).
- Legacy mappings are intended for migration support only. Prefer documenting and scripting the current command paths.
