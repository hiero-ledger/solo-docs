---
title: "Using Solo with Mirror Node"
description: >
  Add Mirror Node to a Solo network to stream and query transaction records,
  account history, and token data via the Hiero Mirror Node REST API.
weight: 2
categories: ["solo", "mirror-node"]
tags: ["solo", "mirror-node", "explorer", "api", "deployment", "operations"]
type: docs
---

## Overview

The Hiero Mirror Node stores the full transaction history of your local Solo network
and exposes it through several interfaces:

- A **web-based block explorer** (Hiero Mirror Node Explorer) at `http://localhost:8080`.
- A **REST API** via the mirror-ingress service at `http://localhost:8081`
    (recommended entry point-routes to the correct REST implementation).
- A **gRPC endpoint** for mirror node subscriptions.

This guide walks you through adding Mirror Node and the Hiero Explorer to a
Solo network, and shows you how to query transaction data and create accounts.

---

## Prerequisites

Before proceeding, ensure you have completed the following:

- [**System Readiness**](/docs/simple-solo-setup/system-readiness/) - your
  local environment meets all hardware and software requirements, including Docker and Solo.
- [**Quickstart**](/docs/simple-solo-setup/quickstart/) - you have a running Solo
  network deployed using `solo one-shot single deploy`.
- To find your deployment name at any time, run:

  ```bash
  cat ~/.solo/cache/last-one-shot-deployment.txt
  ```

---

## Step 1: Deploy Solo with Mirror Node

> **Note:** If you deployed your network using
> [one-shot](/docs/simple-solo-setup/quickstart),
> [Falcon](/docs/advanced-solo-setup/advanced-network-deployments/falcon-deployment),
> or the [Task Tool](/docs/advanced-solo-setup/customizing-solo-with-tasks),
> Mirror Node is already running -
> skip to [Step 2: Access the Mirror Node Explorer](#step-2-access-the-mirror-node-explorer).

### Fresh manual Deployment

If you are building a custom network or adding the mirror node to an existing
deployment, run the following commands in sequence:

```bash
# Set environment variables
export SOLO_CLUSTER_NAME=solo-cluster
export SOLO_NAMESPACE=solo-e2e
export SOLO_CLUSTER_SETUP_NAMESPACE=solo-cluster-setup
export SOLO_DEPLOYMENT=solo-deployment

# Reset environment
rm -Rf ~/.solo
kind delete cluster -n "${SOLO_CLUSTER_NAME}"
kind create cluster -n "${SOLO_CLUSTER_NAME}"

# Initialize Solo and configure cluster
solo init
solo cluster-ref config setup \
  --cluster-setup-namespace "${SOLO_CLUSTER_SETUP_NAMESPACE}"
solo cluster-ref config connect \
  --cluster-ref ${SOLO_CLUSTER_NAME} \
  --context kind-${SOLO_CLUSTER_NAME}

# Create deployment
solo deployment config create \
  --namespace "${SOLO_NAMESPACE}" \
  --deployment "${SOLO_DEPLOYMENT}"
solo deployment cluster attach \
  --deployment "${SOLO_DEPLOYMENT}" \
  --cluster-ref ${SOLO_CLUSTER_NAME} \
  --num-consensus-nodes 2

# Generate keys and deploy consensus nodes
solo keys consensus generate \
  --deployment "${SOLO_DEPLOYMENT}" \
  --gossip-keys --tls-keys \
  -i node1,node2
solo consensus network deploy --deployment "${SOLO_DEPLOYMENT}" -i node1,node2
solo consensus node setup --deployment "${SOLO_DEPLOYMENT}" -i node1,node2
solo consensus node start --deployment "${SOLO_DEPLOYMENT}" -i node1,node2

# Add mirror node and explorer
solo mirror node add \
  --deployment "${SOLO_DEPLOYMENT}" \
  --cluster-ref ${SOLO_CLUSTER_NAME} \
  --enable-ingress \
  --pinger
solo explorer node add \
  --deployment "${SOLO_DEPLOYMENT}" \
  --cluster-ref ${SOLO_CLUSTER_NAME}
```

> **Note:** The `--pinger` flag in `solo mirror node add` starts a background
> service that sends transactions to the network at regular intervals. This is
> **required** because mirror node record files are only imported when a new
> record file is created - without it, the mirror node will appear empty until
> the next transaction occurs naturally.

---

## Step 2: Access the Mirror Node Explorer

Once Mirror Node is running, open the Hiero Explorer in your browser at:

```url
http://localhost:8080
```

The Explorer lets you browse accounts, transactions, tokens, and contracts on
your Solo network in real time.

---

## Step 3: Create Accounts and View Transactions

Create test accounts and observe them appearing in the Explorer:

```bash
solo ledger account create --deployment solo-deployment --hbar-amount 100
solo ledger account create --deployment solo-deployment --hbar-amount 100
```

Open the Explorer at `http://localhost:8080` to see the new accounts and their
transactions recorded by the Mirror Node.

You can also use the [Hiero JavaScript SDK](/docs/using-solo/javascript-sdk)
to create a topic, submit a message, and subscribe to it.

---

## Step 4: Access Mirror Node APIs

### Option A: Mirror-Ingress (localhost:8081)

Use `localhost:8081` for all Mirror Node REST API access. The mirror-ingress
service routes requests to the correct REST implementation automatically. This
is important because certain endpoints are only supported in the newer
`rest-java` version.

```bash
# List recent transactions
curl -s "http://localhost:8081/api/v1/transactions?limit=5"

# Get account details
curl -s "http://localhost:8081/api/v1/accounts/0.0.2"
```

> **Note:** `localhost:5551` (the legacy Mirror Node REST API) is being phased
> out. Always use `localhost:8081` to ensure compatibility with all endpoints.

If you need to access it directly:

  ```bash
  kubectl port-forward svc/mirror-1-rest -n "${SOLO_NAMESPACE}" 5551:80 &
  curl -s "http://${REST_IP:-127.0.0.1}:5551/api/v1/transactions?limit=1"
  ```

### Option B: Mirror Node gRPC

For mirror node gRPC subscriptions (e.g. topic messages, account balance
updates), enable port-forwarding manually if not already active:

```bash
kubectl port-forward svc/mirror-1-grpc -n "${SOLO_NAMESPACE}" 5600:5600 &
```

Then verify available services:

```bash
grpcurl -plaintext "${GRPC_IP:-127.0.0.1}:5600" list
```

### Option C: Mirror Node REST-Java (Direct Access)

For direct access to the `rest-java` service (bypassing the ingress):

```bash
kubectl port-forward service/mirror-1-restjava -n "${SOLO_NAMESPACE}" 8084:80 &

# Example: NFT allowances
curl -s "http://${REST_IP:-127.0.0.1}:8084/api/v1/accounts/0.0.2/allowances/nfts"
```

In most cases you should use `localhost:8081` instead.

---

## Port Reference

| Service | Local Port | Access Method |
| --- | --- | --- |
| Hiero Explorer | `8080` | Browser (`--enable-ingress`) |
| Mirror Node (all-in-one) | `8081` | HTTP (`--enable-ingress`) |
| Mirror Node REST API | `5551` | `kubectl port-forward` |
| Mirror Node gRPC | `5600` | `kubectl port-forward` |
| Mirror Node REST Java | `8084` | `kubectl port-forward` |

---

## Restoring Port-Forwards

If port-forwards are interrupted-for example after a system restart-restore
them without redeploying:

```bash
solo deployment refresh port-forwards
```

---

## Tearing Down

To remove the Mirror Node from a running deployment:

```bash
solo mirror node destroy --deployment "${SOLO_DEPLOYMENT}" --force
```

To remove the Hiero Mirror Node Explorer:

```bash
solo explorer node destroy --deployment "${SOLO_DEPLOYMENT}" --force
```

For full network teardown, see
[**Step-by-Step Manual Deployment-Cleanup**](/docs/advanced-solo-setup/network-deployments/manual-deployment/#cleanup).
