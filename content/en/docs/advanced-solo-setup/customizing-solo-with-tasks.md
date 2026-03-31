---
title: "Customizing Solo with Tasks"
weight: 4
description: >
  Use the Task runner to deploy and customize Solo networks, then explore maintained GitHub example projects for common workflows.
type: docs
---

## Overview

The **Task** tool (`task`) is a task runner that enables you to deploy and customize Solo networks using infrastructure-as-code patterns. Rather than running individual Solo CLI commands, you can use predefined Taskfile targets to orchestrate complex deployment workflows with a single command.

This guide covers installing the Task tool, understanding available Taskfile targets, and using them to deploy networks with various configurations. It also points to maintained example projects that demonstrate common Solo workflows.

> **Note:** This guide assumes you have cloned the [Solo repository](https://github.com/hiero-ledger/solo) and have basic familiarity with command-line interfaces and Docker.

## Prerequisites

Before you begin, ensure you have completed the following:

- [**System Readiness**](/docs/simple-solo-setup/system-readiness): Prepare your local environment (Docker, Kind, Kubernetes, and related tooling).
- [**Quickstart**](/docs/simple-solo-setup/quickstart): You are familiar with the basic Solo workflow and the `solo one-shot single deploy` command.

> **Tip:** Task-based workflows are ideal for developers who want to:
>
> - Run the same deployment multiple times reliably.
> - Customize network components (add mirror nodes, relays, block nodes, etc.).
> - Use version control to track deployment configurations.
> - Integrate Solo deployments into CI/CD pipelines.

## Install the Task Tool

The Task tool is a dependency for using Taskfile targets in the Solo repository. Install it using one of the following methods:

### Using Homebrew (macOS/Linux) (recommended)

```bash
brew install go-task/tap/go-task
```

### Using npm

```bash
npm install -g @go-task/cli
```

Verify the installation:

```bash
task --version
```

Expected output:

```text
Task version: v3.X.X
```

### Using package managers

Visit the [Task installation guide](https://taskfile.dev/installation/) for additional installation methods for your operating system.

## Understanding the Task Structure

The Solo repository uses a modular Task architecture located in the `scripts/` directory:

```text
scripts/
├── Taskfile.yml                    # Main entry point (includes other Taskfiles)
├── Taskfile.scripts.yml            # Core deployment and management tasks
├── Taskfile.examples.yml           # Example project tasks
├── Taskfile.release.yml            # Package publishing tasks
└── [other helper scripts]
```

### How to Run Tasks

From the **root directory** or any **example directory**, run:

```bash
# Run the default task
task

# Run a specific task
task <task-name>

# Run tasks with variables
task <task-name> -- VAR_NAME=value
```

## Deploy Network Configurations

### Basic Network Deployment

Deploy a standalone Hiero Consensus Node network with a single command:

```bash
# From the repository root, navigate to scripts directory
cd scripts

# Deploy default network (2 consensus nodes)
task default
```

This command performs the following actions:

- Initializes Solo and downloads required dependencies.
- Creates a local Kubernetes cluster using Kind.
- Deploys 2 consensus nodes.
- Sets up gRPC and JSON-RPC endpoints for client access.

### Deploy Network with Mirror Node

Deploy a network with a consensus node, mirror node, and Hiero Explorer:

```bash
cd scripts

task default-with-mirror
```

This configuration includes:

| Component          | Description                                   |
| ------------------ | --------------------------------------------- |
| **Consensus Node** | 2 consensus nodes running Hiero               |
| **Mirror Node**    | Stores and serves historical transaction data |
| **Explorer UI**    | Web interface for viewing accounts            |

Access the Explorer at: `http://localhost:8080`

### Deploy Network with Relay and Explorer

Deploy a network with consensus nodes, mirror node, explorer, and JSON-RPC relay for Ethereum-compatible access:

```bash
cd scripts

task default-with-relay
```

This configuration includes:

| Component          | Description                                   |
| ------------------ | --------------------------------------------- |
| **Consensus Node** | 2 consensus nodes running Hiero               |
| **Mirror Node**    | Stores and serves historical transaction data |
| **Explorer UI**    | Web interface for viewing accounts            |
| **JSON-RPC Relay** | Ethereum-compatible JSON-RPC interface        |

Access the services at:

- Explorer: `http://localhost:8080`
- JSON-RPC Relay: `http://localhost:7546`

## Available Taskfile Targets

The Taskfile includes a comprehensive set of targets for deploying and managing Solo networks. Below are the most commonly used targets, organized by category.

### Core Deployment Targets

These targets handle the primary deployment lifecycle:

| Task      | Description                                                    |
| --------- | -------------------------------------------------------------- |
| `default` | Complete deployment workflow for Solo                          |
| `install` | Initialize cluster, create deployment, and setup consensus net |
| `destroy` | Tear down the consensus network                                |
| `clean`   | Full cleanup: destroy network, remove cache, logs, and files   |
| `start`   | Start all consensus nodes                                      |
| `stop`    | Stop all consensus nodes                                       |

### Example: Deploy, then clean up

```bash
cd scripts

# Deploy the network
task default

# ... (use the network)

# Stop the network
task stop

# Remove all traces of the deployment
task clean
```

### Cache and Log Cleanup

When cleaning up, you can selectively remove specific components:

| Task           | Description                                            |
| -------------- | ------------------------------------------------------ |
| `clean:cache`  | Remove the Solo cache directory (`~/.solo/cache`)      |
| `clean:logs`   | Remove the Solo logs directory (`~/.solo/logs`)        |
| `clean:tmp`    | Remove temporary deployment files                      |

### Mirror Node Management

Add, configure, or remove mirror nodes from an existing deployment:

| Task                          | Description                                       |
| ----------------------------- | ------------------------------------------------- |
| `solo:mirror-node`            | Add a mirror node to the current deployment       |
| `solo:destroyer-mirror-node`  | Remove the mirror node from the deployment        |

### Example: Add mirror node to running network

```bash
cd scripts

# Start with a basic network
task default

# Add mirror node later
task solo:mirror-node

# Remove mirror node
task solo:destroyer-mirror-node
```

### Explorer UI Management

Deploy or remove the Hiero Explorer for transaction/account viewing:

| Task                      | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `solo:explorer`           | Add explorer UI to the current deployment      |
| `solo:destroy-explorer`   | Remove explorer UI from the deployment         |

### Example: Deploy network with explorer

```bash
cd scripts

task default
task solo:explorer

# Access at http://localhost:8080
```

### JSON-RPC Relay Management

Deploy or remove the Relay for Ethereum-compatible access:

| Task                  | Description                                      |
| --------------------- | ------------------------------------------------ |
| `solo:relay`          | Add JSON-RPC relay to the current deployment     |
| `solo:destroy-relay`  | Remove JSON-RPC relay from the deployment        |

### Example: Add relay to running network

```bash
cd scripts

task default-with-mirror
task solo:relay

# Access JSON-RPC at http://localhost:7546
```

### Block Node Management

Deploy or remove block nodes for streaming block data:

| Task                | Description                                        |
| ------------------- | -------------------------------------------------- |
| `solo:block:add`    | Add a block node to the current deployment         |
| `solo:block:destroy`| Remove the block node from the deployment          |

### Example: Deploy network with block node

```bash
cd scripts

task default
task solo:block:add

# Block node will stream block data
```

### Infrastructure Tasks

Low-level tasks for managing clusters and network infrastructure:

| Task                        | Description                                                |\n| --------------------------- | ---------------------------------------------------------- |
| `cluster:create`            | Create a Kind (Kubernetes in Docker) cluster               |
| `cluster:destroy`           | Delete the Kind cluster                                    |
| `solo:cluster:setup`        | Setup cluster infrastructure and prerequisites             |
| `solo:init`                 | Initialize Solo (download tools and templates)             |
| `solo:deployment:create`    | Create a new deployment configuration                      |
| `solo:deployment:attach`    | Attach an existing cluster to a deployment                 |
| `solo:network:deploy`       | Deploy the consensus network to the cluster                |
| `solo:network:destroy`      | Destroy the consensus network                              |

> **Tip:** Unless you need custom cluster management, use the higher-level tasks like `default`, `install`, or `destroy` which orchestrate these infrastructure tasks automatically.

### Utility Tasks

Helpful tasks for inspecting and managing running networks:

| Task                    | Description                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| `show:ips`              | Display the external IPs of all network nodes                                   |
| `solo:node:logs`        | Retrieve logs from consensus nodes                                              |
| `solo:freeze:restart`   | Execute a freeze/restart upgrade workflow for testing version upgrades          |

### Example: View network IPs and logs

```bash
cd scripts

# See which nodes are running and their IPs
task show:ips

# Retrieve node logs for debugging
task solo:node:logs
```

### Database Tasks

Deploy external databases for specialized configurations:

| Task                     | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `solo:external-database` | Setup external PostgreSQL database with Helm           |

## Advanced Configuration with Environment Variables

You can customize Task behavior by setting environment variables before running tasks. Common variables include:

| Variable | Description | Default |
| --- | --- | --- |
| `SOLO_NETWORK_SIZE` | Number of consensus nodes | `1` |
| `SOLO_NAMESPACE` | Kubernetes namespace | `solo-e2e` |
| `CONSENSUS_NODE_VERSION` | Consensus node version | `v0.65.1` |
| `MIRROR_NODE_VERSION` | Mirror node version | `v0.138.0` |
| `RELAY_VERSION` | JSON-RPC Relay version | `v0.70.0` |
| `EXPLORER_VERSION` | Explorer UI version | `v25.1.1` |

For a comprehensive reference of all available environment variables, see [Using Environment Variables](/docs/advanced-solo-setup/using-environment-variables/).

### Example: Deploy with custom versions

```bash
cd scripts

# Deploy with specific component versions
CONSENSUS_NODE_VERSION=v0.66.0 \
MIRROR_NODE_VERSION=v0.139.0 \
task default-with-mirror
```

## Example Projects

The Solo repository includes 14+ maintained example projects that demonstrate common Solo workflows. These examples serve as templates and starting points for custom implementations.

### Getting Started with Examples

Each example is located in the `examples/` directory and includes:

- Pre-configured `Taskfile.yml` with deployment settings.
- `init-containers-values.yaml` for customization.
- Example-specific README with detailed instructions.

**To run an example:**

```bash
cd examples/<example-name>

# Deploy the example
task

# Clean up when done
task clean
```

### Available Examples

#### Network Setup Examples

- **[Address Book](https://github.com/hiero-ledger/solo/tree/main/examples/address-book)**: Use Yahcli to pull ledger and mirror node address books for querying network state
- **[Network with Domain Names](https://github.com/hiero-ledger/solo/tree/main/examples/network-with-domain-names)**: Setup a network with custom domain names for nodes instead of IP addresses
- **[Network with Block Node](https://github.com/hiero-ledger/solo/tree/main/examples/network-with-block-node)**: Deploy a network with block node for streaming block data

#### Configuration Examples

- **[Custom Network Config](https://github.com/hiero-ledger/solo/tree/main/examples/custom-network-config)**: Customize consensus network configuration for your specific needs
- **[Local Build with Custom Config](https://github.com/hiero-ledger/solo/tree/main/examples/local-build-with-custom-config)**: Deploy using a locally-built consensus node with custom configuration
- **[Consensus Node JVM Parameters](https://github.com/hiero-ledger/solo/tree/main/examples/consensus-node-jvm-parameters)**: Customize JVM parameters (memory, GC settings, etc.) for consensus nodes

#### Database Examples

- **[External Database Test](https://github.com/hiero-ledger/solo/tree/main/examples/external-database-test)**: Deploy Solo with an external PostgreSQL database instead of embedded storage
- **[Multi-Cluster Backup and Restore](https://github.com/hiero-ledger/solo/tree/main/examples/multicluster-backup-restore)**: Backup state from one cluster and restore to another using external database

#### State Management Examples

- **[State Save and Restore](https://github.com/hiero-ledger/solo/tree/main/examples/state-save-and-restore)**: Save the network state with mirror node, then restore to a new deployment
- **[Version Upgrade Test](https://github.com/hiero-ledger/solo/tree/main/examples/version-upgrade-test)**: Upgrade all network components to the current version to test compatibility

#### Node Transaction Examples

These examples demonstrate manual operations for adding, modifying, and removing nodes:

- **[Node Create Transaction](https://github.com/hiero-ledger/solo/tree/main/examples/node-create-transaction)**: Create a new node manually using the NodeCreate transaction
- **[Node Update Transaction](https://github.com/hiero-ledger/solo/tree/main/examples/node-update-transaction)**: Update an existing node configuration with NodeUpdate transaction
- **[Node Delete Transaction](https://github.com/hiero-ledger/solo/tree/main/examples/node-delete-transaction)**: Remove a node from the network with NodeDelete transaction

#### Integration Examples

- **[Hardhat with Solo](https://github.com/hiero-ledger/solo/tree/main/examples/hardhat-with-solo)**: Test smart contracts locally with Hardhat using Solo as the test network
- **[One-Shot Falcon Deployment](https://github.com/hiero-ledger/solo/tree/main/examples/one-shot-falcon)**: One-shot deployment using Falcon (consensus node implementation)
- **[One-Shot Local Build](https://github.com/hiero-ledger/solo/tree/main/examples/one-shot-local-build)**: One-shot deployment using a locally-built consensus node

#### Testing Examples

- **[Rapid-Fire](https://github.com/hiero-ledger/solo/tree/main/examples/rapid-fire)**: Rapid-fire deployment and teardown commands for stress testing the deployment workflow
- **[Running Solo Inside Cluster](https://github.com/hiero-ledger/solo/tree/main/examples/running-solo-inside-cluster)**: Deploy Solo within an existing Kubernetes cluster instead of creating a new one

## Practical Workflows

### Workflow 1: Quick Development Network with Logging

Deploy a network for development and debugging:

```bash
cd scripts

# Set logging level
export SOLO_LOG_LEVEL=debug

# Deploy with mirror and relay
task default-with-relay

# Retrieve logs if needed
task solo:node:logs

# View network endpoints
task show:ips

# Clean up
task clean
```

### Workflow 2: Test Configuration Changes

Iterate on network configuration:

```bash
cd examples/custom-network-config

# Edit the Taskfile or init-containers-values.yaml

# Deploy with your changes
task

# Test your configuration

# Clean up and try again
task clean
```

### Workflow 3: Upgrade Network Components

Test upgrading Solo components:

```bash
cd examples/version-upgrade-test

# Deploy with current versions
task

# The example automatically tests the upgrade path

# Clean up
task clean
```

### Workflow 4: Backup and Restore Network State

Test disaster recovery and state migration:

```bash
cd examples/state-save-and-restore

# Deploy initial network with state
task

# The example includes backup/restore operations

# Clean up
task clean
```

## Troubleshooting

### Common Issues

#### Task command not found

Ensure Task is installed and on your PATH:

```bash
which task
task --version
```

#### Taskfile not found

Run Task commands from the `scripts/` directory or an `examples/` subdirectory where a Taskfile.yml exists:

```bash
cd scripts
task default
```

#### Insufficient resources

Some deployments require significant resources. Verify your Docker has at least 12 GB of memory and 6 CPU cores allocated:

```bash
docker info --format 'CPU: {{.NCPU}}, Memory: {{.MemTotal | div 1000000000}}GB'
```

#### Cluster cleanup issues

If the cluster becomes unstable, perform a full cleanup:

```bash
cd scripts

# Remove all traces
task clean

# As a last resort, manually delete the Kind cluster
kind delete cluster --name solo-e2e
```

## Next Steps

After deploying a network with Task, explore:

- **[Using the JavaScript SDK](/docs/using-solo/javascript-sdk)**: Interact with your network programmatically
- **[Using Network Load Generator](/docs/using-solo/solo-with-network-load-generator)**: Stress test your network
- **[Environment Variables Reference](/docs/advanced-solo-setup/using-environment-variables)**: Fine-tune deployment behavior
- **[Solo CI Workflow](/docs/advanced-solo-setup/solo-ci-workflow)**: Integrate Solo deployments into CI/CD pipelines

## Additional Resources

- [Task Official Documentation](https://taskfile.dev/)
- [Solo Repository](https://github.com/hiero-ledger/solo)
- [Hiero Consensus Node](https://github.com/hiero-ledger/hiero-consensus-node)
- [Hiero Mirror Node](https://github.com/hiero-ledger/hiero-mirror-node)
- [JSON-RPC Relay](https://github.com/hiero-ledger/hiero-json-rpc-relay)
