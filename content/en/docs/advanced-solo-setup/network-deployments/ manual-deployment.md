---
title: "Step-by-Step Manual Deployment"
description: "Deploy each Solo network component individually for maximum control over configuration and debugging."
weight: 3
type: docs
---

## Overview

Manual deployment lets you deploy each Solo network component individually,
giving you full control over configuration, sequencing, and troubleshooting.
Use this approach when you need to customise specific steps, debug a component
in isolation, or integrate Solo into a bespoke automation pipeline.

---

## Prerequisites

Before proceeding, ensure you have completed the following:

- [**System Readiness**](/onboarding/system-readiness) — your local environment
  meets all hardware and software requirements (Docker, kind, kubectl, helm, Solo).
- [**Quickstart**](/onboarding/quickstart) — you have a running Kind cluster and
  have run `solo init` at least once.
- Set your environment variables if you have not already done so:

  ```bash
  export SOLO_CLUSTER_NAME=solo
  export SOLO_NAMESPACE=solo
  export SOLO_CLUSTER_SETUP_NAMESPACE=solo-cluster
  export SOLO_DEPLOYMENT=solo-deployment
  ```

---

## Deployment Steps

### 1. Connect Cluster and Create Deployment

- Connect Solo to the Kind cluster and create a new deployment configuration:

  ```bash
  # Connect to the Kind cluster
  solo cluster-ref config connect \
    --cluster-ref kind-${SOLO_CLUSTER_NAME} \
    --context kind-${SOLO_CLUSTER_NAME}

  # Create a new deployment
  solo deployment config create \
    -n "${SOLO_NAMESPACE}" \
    --deployment "${SOLO_DEPLOYMENT}"
  ```
- **Expected Output**:

  ```bash
  ******************************* Solo *********************************************
  Version			: 0.63.0
  Kubernetes Context	: kind-solo
  Kubernetes Cluster	: kind-solo
  Current Command		: cluster-ref config connect --cluster-ref kind-solo --context kind-solo
  **********************************************************************************
  Initialize
  ✔ Initialize 
  Validating cluster ref: 
  ✔ Validating cluster ref: kind-solo 
  Test connection to cluster: 
  ✔ Test connection to cluster: kind-solo 
  Associate a context with a cluster reference: 
  ✔ Associate a context with a cluster reference: kind-solo
  ```

---

### 2. Add Cluster to Deployment

- Attach the cluster to your deployment and specify the number of consensus nodes:

    #### 1. Single node:

    ```bash
    solo deployment cluster attach \
      --deployment "${SOLO_DEPLOYMENT}" \
      --cluster-ref kind-${SOLO_CLUSTER_NAME} \
      --num-consensus-nodes 1
    ```

    #### 2. Multiple nodes (e.g., --num-consensus-nodes 3):

    ```bash 
    solo deployment cluster attach \
      --deployment "${SOLO_DEPLOYMENT}" \
      --cluster-ref kind-${SOLO_CLUSTER_NAME} \
      --num-consensus-nodes 3
    ```

- **Expected Output**:

  ```bash 
  solo-deployment_ADD_CLUSTER_OUTPUT
  ```

---

### 3. Generate Keys

- Generate the gossip and TLS keys for your consensus nodes:

  ```bash
  solo keys consensus generate \
    --gossip-keys \
    --tls-keys \
    --deployment "${SOLO_DEPLOYMENT}"
  ```
  PEM key files are written to `~/.solo/cache/keys/`.

- **Example output**:

  ```bash
  ******************************* Solo *********************************************
  Version			: 0.63.0
  Kubernetes Context	: kind-solo
  Kubernetes Cluster	: kind-solo
  Current Command		: keys consensus generate --gossip-keys --tls-keys --deployment solo-deployment
  **********************************************************************************
  Initialize
  ✔ Initialize 
  Generate gossip keys
  Backup old files
  ✔ Backup old files 
  Gossip key for node: node1
  ✔ Gossip key for node: node1 [0.2s]
  ✔ Generate gossip keys [0.2s]
  Generate gRPC TLS Keys
  Backup old files
  TLS key for node: node1
  ✔ Backup old files 
  ✔ TLS key for node: node1 [0.3s]
  ✔ Generate gRPC TLS Keys [0.3s]
  Finalize
  ✔ Finalize
  ```

---

### 4. Set Up Cluster with Shared Components

- Install shared cluster-level components (MinIO Operator, Prometheus CRDs, etc.)
into the cluster setup namespace:

  ```bash
  solo cluster-ref config setup --cluster-setup-namespace "${SOLO_CLUSTER_SETUP_NAMESPACE}"
  ```

- **Example output**:

  ```bash
  ******************************* Solo *********************************************
  Version			: 0.63.0
  Kubernetes Context	: kind-solo
  Kubernetes Cluster	: kind-solo
  Current Command		: cluster-ref config setup --cluster-setup-namespace solo-cluster
  **********************************************************************************
  Check dependencies
  Check dependency: helm [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  Check dependency: kind [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  Check dependency: kubectl [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  ✔ Check dependency: kind [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependency: helm [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependency: kubectl [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependencies 
  Setup chart manager
  ✔ Setup chart manager [0.6s]
  Initialize
  ✔ Initialize 
  Install cluster charts
  Install pod-monitor-role ClusterRole
  -  ClusterRole pod-monitor-role already exists in context kind-solo, skipping
  ✔ Install pod-monitor-role ClusterRole 
  Install MinIO Operator chart
  ✔ MinIO Operator chart installed successfully on context kind-solo
  ✔ Install MinIO Operator chart [0.8s]
  ✔ Install cluster charts [0.8s]
  ```

---

### 5. Deploy the Network

- Deploy the Solo network Helm chart, which provisions the consensus node pods,
HAProxy, Envoy, and MinIO:

  ```bash
  solo consensus network deploy --deployment "${SOLO_DEPLOYMENT}"
  ```

- **Example output**:

  ```bash
  ******************************* Solo *********************************************
  Version			: 0.63.0
  Kubernetes Context	: kind-solo
  Kubernetes Cluster	: kind-solo
  Current Command		: consensus network deploy --deployment solo-deployment --release-tag v0.66.0
  **********************************************************************************
  Check dependencies
  Check dependency: helm [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  Check dependency: kind [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  Check dependency: kubectl [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  ✔ Check dependency: kind [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependency: helm [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependency: kubectl [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependencies 
  Setup chart manager
  ✔ Setup chart manager [0.7s]
  Initialize
  Acquire lock
  ✔ Acquire lock - lock acquired successfully, attempt: 1/10 
  ✔ Initialize [0.2s]
  Copy gRPC TLS Certificates
  Copy gRPC TLS Certificates [SKIPPED: Copy gRPC TLS Certificates]
  Prepare staging directory
  Copy Gossip keys to staging
  ✔ Copy Gossip keys to staging 
  Copy gRPC TLS keys to staging
  ✔ Copy gRPC TLS keys to staging 
  ✔ Prepare staging directory 
  Copy node keys to secrets
  Copy TLS keys
  Node: node1, cluster: kind-solo
  Copy Gossip keys
  ✔ Copy TLS keys 
  ✔ Copy Gossip keys 
  ✔ Node: node1, cluster: kind-solo 
  ✔ Copy node keys to secrets 
  Install monitoring CRDs
  Pod Logs CRDs
  ✔ Pod Logs CRDs 
  Prometheus Operator CRDs
  - Installed prometheus-operator-crds chart, version: 24.0.2
  ✔ Prometheus Operator CRDs [4s]
  ✔ Install monitoring CRDs [4s]
  Install chart 'solo-deployment'
  - Installed solo-deployment chart, version: 0.62.0
  ✔ Install chart 'solo-deployment' [2s]
  Check for load balancer
  Check for load balancer [SKIPPED: Check for load balancer]
  Redeploy chart with external IP address config
  Redeploy chart with external IP address config [SKIPPED: Redeploy chart with external IP address config]
  Check node pods are running
  Check Node: node1, Cluster: kind-solo
  ✔ Check Node: node1, Cluster: kind-solo [24s]
  ✔ Check node pods are running [24s]
  Check proxy pods are running
  Check HAProxy for: node1, cluster: kind-solo
  Check Envoy Proxy for: node1, cluster: kind-solo
  ✔ Check HAProxy for: node1, cluster: kind-solo 
  ✔ Check Envoy Proxy for: node1, cluster: kind-solo 
  ✔ Check proxy pods are running 
  Check auxiliary pods are ready
  Check MinIO
  ✔ Check MinIO 
  ✔ Check auxiliary pods are ready 
  Add node and proxies to remote config
  ✔ Add node and proxies to remote config 
  Copy wraps lib into consensus node
  Copy wraps lib into consensus node [SKIPPED: Copy wraps lib into consensus node]
  Copy block-nodes.json
  ✔ Copy block-nodes.json [1s]
  Copy JFR config file to nodes
  Copy JFR config file to nodes [SKIPPED: Copy JFR config file to nodes]
  ```

---

### 6. Set Up Consensus Nodes

- Download the consensus node platform software and configure each node:

  ```bash
  export CONSENSUS_NODE_VERSION=v0.66.0

  solo consensus node setup \
    --deployment "${SOLO_DEPLOYMENT}" \
    --release-tag "${CONSENSUS_NODE_VERSION}"
  ```

- **Example output**:

  ```bash
  ******************************* Solo *********************************************
  Version			: 0.63.0
  Kubernetes Context	: kind-solo
  Kubernetes Cluster	: kind-solo
  Current Command		: consensus node setup --deployment solo-deployment --release-tag v0.66.0
  **********************************************************************************
  Load configuration
  ✔ Load configuration [0.2s]
  Initialize
  ✔ Initialize [0.2s]
  Validate nodes states
  Validating state for node node1
  ✔ Validating state for node node1 - valid state: requested 
  ✔ Validate nodes states 
  Identify network pods
  Check network pod: node1
  ✔ Check network pod: node1 
  ✔ Identify network pods 
  Fetch platform software into network nodes
  Update node: node1 [ platformVersion = v0.66.0, context = kind-solo ]
  ✔ Update node: node1 [ platformVersion = v0.66.0, context = kind-solo ] [3s]
  ✔ Fetch platform software into network nodes [3s]
  Setup network nodes
  Node: node1
  Copy configuration files
  ✔ Copy configuration files [0.3s]
  Set file permissions
  ✔ Set file permissions [0.4s]
  ✔ Node: node1 [0.8s]
  ✔ Setup network nodes [0.9s]
  setup network node folders
  ✔ setup network node folders [0.1s]
  Change node state to configured in remote config
  ✔ Change node state to configured in remote config
  ```

---

### 7. Start Consensus Nodes

- Start all configured nodes and wait for them to reach ACTIVE status:

  ```bash
  solo consensus node start --deployment "${SOLO_DEPLOYMENT}"
  ```

- **Example output**:

  ```bash
  ******************************* Solo *********************************************
  Version			: 0.63.0
  Kubernetes Context	: kind-solo
  Kubernetes Cluster	: kind-solo
  Current Command		: consensus node start --deployment solo-deployment
  **********************************************************************************
  Check dependencies
  Check dependency: helm [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  Check dependency: kind [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  Check dependency: kubectl [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  ✔ Check dependency: kind [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependency: helm [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependency: kubectl [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependencies 
  Setup chart manager
  ✔ Setup chart manager [0.7s]
  Load configuration
  ✔ Load configuration [0.2s]
  Initialize
  ✔ Initialize [0.2s]
  Validate nodes states
  Validating state for node node1
  ✔ Validating state for node node1 - valid state: configured 
  ✔ Validate nodes states 
  Identify existing network nodes
  Check network pod: node1
  ✔ Check network pod: node1 
  ✔ Identify existing network nodes 
  Upload state files network nodes
  Upload state files network nodes [SKIPPED: Upload state files network nodes]
  Starting nodes
  Start node: node1
  ✔ Start node: node1 [0.1s]
  ✔ Starting nodes [0.1s]
  Enable port forwarding for debug port and/or GRPC port
  Using requested port 50211
  ✔ Enable port forwarding for debug port and/or GRPC port 
  Check all nodes are ACTIVE
  Check network pod: node1 
  ✔ Check network pod: node1  - status ACTIVE, attempt: 16/300 [20s]
  ✔ Check all nodes are ACTIVE [20s]
  Check node proxies are ACTIVE
  Check proxy for node: node1
  ✔ Check proxy for node: node1 [6s]
  ✔ Check node proxies are ACTIVE [6s]
  Wait for TSS
  Wait for TSS [SKIPPED: Wait for TSS]
  set gRPC Web endpoint
  Using requested port 30212
  ✔ set gRPC Web endpoint [3s]
  Change node state to started in remote config
  ✔ Change node state to started in remote config 
  Add node stakes
  Adding stake for node: node1
  ✔ Adding stake for node: node1 [4s]
  ✔ Add node stakes [4s]
  Stopping port-forward for port [30212]
  ```

---

### 8. Deploy Mirror Node

- Deploy the Hedera Mirror Node, which indexes all transaction data and exposes a
REST API and gRPC endpoint:

  ```bash
  solo mirror node add \
    --deployment "${SOLO_DEPLOYMENT}" \
    --cluster-ref kind-${SOLO_CLUSTER_NAME} \
    --enable-ingress \
    --pinger
  ```

  The `--pinger` flag keeps the mirror node's importer active by regularly
submitting record files. The `--enable-ingress` flag installs the HAProxy
ingress controller for the mirror node REST API.

- **Example output**:
  ```bash
  ******************************* Solo *********************************************
  Version			: 0.63.0
  Kubernetes Context	: kind-solo
  Kubernetes Cluster	: kind-solo
  Current Command		: mirror node add --deployment solo-deployment --cluster-ref kind-solo --enable-ingress --quiet-mode
  **********************************************************************************
  Check dependencies
  Check dependency: helm [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  Check dependency: kind [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  Check dependency: kubectl [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  ✔ Check dependency: kind [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependency: helm [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependency: kubectl [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependencies 
  Setup chart manager
  ✔ Setup chart manager [0.6s]
  Initialize
  Using requested port 30212
  Acquire lock
  ✔ Acquire lock - lock acquired successfully, attempt: 1/10 [0.1s]
  ✔ Initialize [1s]
  Enable mirror-node
  Prepare address book
  ✔ Prepare address book 
  Install mirror ingress controller
  - Installed haproxy-ingress-1 chart, version: 0.14.5
  ✔ Install mirror ingress controller [0.7s]
  Deploy mirror-node
  - Installed mirror chart, version: v0.149.0
  ✔ Deploy mirror-node [3s]
  ✔ Enable mirror-node [4s]
  Check pods are ready
  Check Postgres DB
  Check REST API
  Check GRPC
  Check Monitor
  Check Web3
  Check Importer
  ✔ Check Postgres DB [32s]
  ✔ Check Web3 [46s]
  ✔ Check REST API [52s]
  ✔ Check GRPC [58s]
  ✔ Check Monitor [1m16s]
  ✔ Check Importer [1m32s]
  ✔ Check pods are ready [1m32s]
  Seed DB data
  Insert data in public.file_data
  ✔ Insert data in public.file_data [0.6s]
  ✔ Seed DB data [0.6s]
  Add mirror node to remote config
  ✔ Add mirror node to remote config 
  Enable port forwarding for mirror ingress controller
  Using requested port 8081
  ✔ Enable port forwarding for mirror ingress controller 
  Stopping port-forward for port [30212]
  ```

---

### 9. Deploy Explorer

- Deploy the Hiero Explorer, a web UI for browsing transactions and accounts:

  ```bash
  solo explorer node add \
    --deployment "${SOLO_DEPLOYMENT}" \
    --cluster-ref kind-${SOLO_CLUSTER_NAME}
  ```

- **Example output**:
  ```bash
  ******************************* Solo *********************************************
  Version			: 0.63.0
  Kubernetes Context	: kind-solo
  Kubernetes Cluster	: kind-solo
  Current Command		: explorer node add --deployment solo-deployment --cluster-ref kind-solo --quiet-mode
  **********************************************************************************
  Check dependencies
  Check dependency: helm [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  Check dependency: kind [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  Check dependency: kubectl [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  ✔ Check dependency: kind [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependency: helm [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependency: kubectl [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependencies 
  Setup chart manager
  ✔ Setup chart manager [0.7s]
  Initialize
  Acquire lock
  ✔ Acquire lock - lock acquired successfully, attempt: 1/10 
  ✔ Initialize [0.5s]
  Load remote config
  ✔ Load remote config [0.2s]
  Install cert manager
  Install cert manager [SKIPPED: Install cert manager]
  Install explorer
  - Installed hiero-explorer-1 chart, version: 26.0.0
  ✔ Install explorer [0.8s]
  Install explorer ingress controller
  Install explorer ingress controller [SKIPPED: Install explorer ingress controller]
  Check explorer pod is ready
  ✔ Check explorer pod is ready [18s]
  Check haproxy ingress controller pod is ready
  Check haproxy ingress controller pod is ready [SKIPPED: Check haproxy ingress controller pod is ready]
  Add explorer to remote config
  ✔ Add explorer to remote config 
  Enable port forwarding for explorer
  No port forward config found for Explorer
  Using requested port 8080
  ✔ Enable port forwarding for explorer [0.1s]
  ```

---

### 10. Deploy JSON-RPC Relay

- Deploy the Hiero JSON-RPC Relay to expose an Ethereum-compatible JSON-RPC
endpoint for EVM tooling (MetaMask, Hardhat, Foundry, etc.):

  ```bash
  solo relay node add \
    -i node1 \
    --deployment "${SOLO_DEPLOYMENT}"
  ```

- **Example output**:
  ```bash
  ******************************* Solo *********************************************
  Version			: 0.63.0
  Kubernetes Context	: kind-solo
  Kubernetes Cluster	: kind-solo
  Current Command		: relay node add --node-aliases node1 --deployment solo-deployment --cluster-ref kind-solo
  **********************************************************************************
  Check dependencies
  Check dependency: helm [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  Check dependency: kind [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  Check dependency: kubectl [OS: linux, Release: 6.8.0-106-generic, Arch: x64]
  ✔ Check dependency: kind [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependency: helm [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependency: kubectl [OS: linux, Release: 6.8.0-106-generic, Arch: x64] 
  ✔ Check dependencies 
  Setup chart manager
  ✔ Setup chart manager [0.7s]
  Initialize
  Acquire lock
  ✔ Acquire lock - lock acquired successfully, attempt: 1/10 
  ✔ Initialize [0.4s]
  Check chart is installed
  ✔ Check chart is installed [0.1s]
  Prepare chart values
  Using requested port 30212
  ✔ Prepare chart values [1s]
  Deploy JSON RPC Relay
  - Installed relay-1 chart, version: 0.73.0
  ✔ Deploy JSON RPC Relay [0.7s]
  Check relay is running
  ✔ Check relay is running [16s]
  Check relay is ready
  ✔ Check relay is ready [21s]
  Add relay component in remote config
  ✔ Add relay component in remote config 
  Enable port forwarding for relay node
  Using requested port 7546
  ✔ Enable port forwarding for relay node [0.1s]
  Stopping port-forward for port [30212]
  ``` 

---


</details>

---

## Cleanup

When you are done, destroy components in the reverse order of deployment.

> **Important:** Always destroy components before destroying the network. Skipping
> this order can leave orphaned Helm releases and PVCs in your cluster.


### 1. Destroy JSON-RPC Relay
```bash
solo relay node destroy \
  -i node1 \
  --deployment "${SOLO_DEPLOYMENT}" \
  --cluster-ref kind-${SOLO_CLUSTER_NAME}
```


### 2. Destroy Mirror Node
```bash
solo mirror node destroy \
  --deployment "${SOLO_DEPLOYMENT}" \
  --force
```

### 3. Destroy Explorer
```bash
solo explorer node destroy \
  --deployment "${SOLO_DEPLOYMENT}" \
  --force
```

### 4. Destroy the Network
```bash
solo consensus network destroy \
  --deployment "${SOLO_DEPLOYMENT}" \
  --force
```
---