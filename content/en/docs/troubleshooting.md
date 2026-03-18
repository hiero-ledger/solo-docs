---
title: "Troubleshooting"
weight: 4
description: >
  Solutions to common issues when using Solo, plus guidance on getting help.
type: docs
---

This guide covers common issues you may encounter when using Solo and how to resolve them.

## Quick Navigation

Use this page when something is failing and you need to diagnose or recover quickly.

- [Pods not reaching Ready state](#pods-not-reaching-ready-state)
- [CrashLoopBackOff causes and remediation](#crashloopbackoff-causes-and-remediation)
- [Resource constraint errors (CPU / RAM / Disk)](#resource-constraint-errors-cpu--ram--disk)
- [Old installation artifacts](#old-installation-artifacts)
- [Getting help](#getting-help)

## Related Operational Topics

If you are looking for setup or day-to-day usage guidance rather than failure diagnosis, start with these pages:

- [One-command deployment options and variants](faq.md#one-command-deployment-options-and-variants)
- [How to fully destroy a network and clean up resources](simple-solo-setup/cleanup.md)
- [How to access exposed services (mirror node, relay, explorer)](faq.md#accessing-exposed-services)
- [Common usage patterns and gotchas](faq.md#common-usage-patterns-and-gotchas)

## Common Issues and Solutions

### Pods Not Reaching Ready State

If pods remain in `Pending`, `Init`, `ContainerCreating`, or `CrashLoopBackOff` state, use the checks below to identify the blocker.

#### Check Readiness and Restarts

```bash
# Show readiness and restart count for each pod
kubectl get pods -n "${SOLO_NAMESPACE}" \
  -o custom-columns=NAME:.metadata.name,PHASE:.status.phase,READY:.status.containerStatuses[*].ready,RESTARTS:.status.containerStatuses[*].restartCount
```

#### Check Pod Events

```bash
# List all pods in your namespace
kubectl get pods -n "${SOLO_NAMESPACE}"

# Describe a specific pod to see events
kubectl describe pod -n "${SOLO_NAMESPACE}" <pod-name>
```

#### Common Causes and Fixes

| Symptom | Cause | Solution |
|---------|-------|----------|
| `Pending` state | Insufficient resources | Increase Docker memory/CPU allocation |
| `Pending` state | Storage issues | Check available disk space, restart Docker |
| `CrashLoopBackOff` | Container failing to start | Check pod logs: `kubectl logs -n "${SOLO_NAMESPACE}" <pod-name>` |
| `ImagePullBackOff` | Can't pull container images | Check internet connection, Docker Hub rate limits |

### CrashLoopBackOff Causes and Remediation

If a pod repeatedly restarts and enters `CrashLoopBackOff`, inspect current logs, previous logs, and events for the failing container:

```bash
# Current container logs
kubectl logs -n "${SOLO_NAMESPACE}" <pod-name>

# Previous container logs (captures startup failures)
kubectl logs -n "${SOLO_NAMESPACE}" <pod-name> --previous

# Pod events and failure reasons
kubectl describe pod -n "${SOLO_NAMESPACE}" <pod-name>
```

Common causes include invalid runtime config, missing dependencies, and insufficient memory.

Recommended remediation sequence:

1. If events mention `OOMKilled` or repeated liveness probe failures, increase Docker CPU/RAM and retry.
2. If the issue started after a failed upgrade/deploy, run the cleanup steps in **Old Installation Artifacts** and redeploy.
3. If only one node is affected, refresh or restart it:

```bash
solo consensus node refresh --node-aliases node1 --deployment "${SOLO_DEPLOYMENT}"
# or
solo consensus node restart --deployment "${SOLO_DEPLOYMENT}"
```

#### Resource Allocation

Ensure Docker has adequate resources:

- **Memory**: At least 12 GB (16 GB recommended)
- **CPU**: At least 6 cores (8 recommended)
- **Disk**: At least 20 GB free

On Docker Desktop, check: **Settings > Resources**

### Resource Constraint Errors (CPU / RAM / Disk)

Resource pressure is a common cause of `Pending` pods, startup delays, and repeated restarts.

```bash
# Kubernetes-level CPU and memory utilization
kubectl top nodes
kubectl top pods -n "${SOLO_NAMESPACE}"

# Host disk availability
df -h

# Docker disk usage (if using Docker)
docker system df
```

Recommended local baseline:

- **Memory**: 12 GB minimum (16 GB recommended)
- **CPU**: 6 cores minimum (8 cores recommended)
- **Disk**: 20 GB free minimum

---

### Connection Refused Errors

If you can't connect to network endpoints:

#### Check Service Endpoints

```bash
# List all services
kubectl get svc -n "${SOLO_NAMESPACE}"

# Check if endpoints are populated
kubectl get endpoints -n "${SOLO_NAMESPACE}"
```

#### Manual Port Forwarding

If automatic port forwarding isn't working:

```bash
# Consensus Node (gRPC)
kubectl port-forward svc/haproxy-node1-svc -n "${SOLO_NAMESPACE}" 50211:50211 &

# Explorer UI
kubectl port-forward svc/hiero-explorer -n "${SOLO_NAMESPACE}" 8080:8080 &

# Mirror Node gRPC
kubectl port-forward svc/mirror-1-grpc -n "${SOLO_NAMESPACE}" 5600:5600 &

# Mirror Node REST
kubectl port-forward svc/mirror-1-rest -n "${SOLO_NAMESPACE}" 5551:80 &

# JSON RPC Relay
kubectl port-forward svc/relay-node1-hedera-json-rpc-relay -n "${SOLO_NAMESPACE}" 7546:7546 &
```

If you need the standard exposed endpoints after a successful one-shot deployment, see [How to access exposed services (mirror node, relay, explorer)](faq.md#accessing-exposed-services).

---

### Node Synchronization Issues

If nodes aren't forming consensus or transactions aren't being processed:

#### Check Node Status

```bash
# Download state information
solo consensus state download --deployment "${SOLO_DEPLOYMENT}" --node-aliases node1

# Check logs for gossip issues
kubectl logs -n "${SOLO_NAMESPACE}" network-node-0 | grep -i gossip
```

#### Restart Problematic Nodes

```bash
# Refresh a specific node
solo consensus node refresh --node-aliases node1 --deployment "${SOLO_DEPLOYMENT}"

# Or restart all nodes
solo consensus node restart --deployment "${SOLO_DEPLOYMENT}"
```

### Mirror Node Not Importing Records

If the mirror node isn't showing new transactions:

#### Verify Pinger is Running

The `--pinger` flag should have been used when deploying the mirror node. The pinger sends periodic transactions to ensure record files are created.

```bash
# Check if pinger pod is running
kubectl get pods -n "${SOLO_NAMESPACE}" | grep pinger
```

#### Redeploy Mirror Node with Pinger

```bash
# Destroy existing mirror node
solo mirror node destroy --deployment "${SOLO_DEPLOYMENT}" --force

# Redeploy with pinger enabled
solo mirror node add --deployment "${SOLO_DEPLOYMENT}" --cluster-ref kind-${SOLO_CLUSTER_NAME} --enable-ingress --pinger
```

### Helm Repository Errors

If you see errors like `repository name already exists`:

```bash
# List current Helm repos
helm repo list

# Remove conflicting repository
helm repo remove <repo-name>

# Example: remove hedera-json-rpc-relay
helm repo remove hedera-json-rpc-relay
```

### Kind Cluster Issues

#### Cluster Won't Start

```bash
# Delete and recreate the cluster
kind delete cluster -n "${SOLO_CLUSTER_NAME}"
kind create cluster -n "${SOLO_CLUSTER_NAME}"
```

#### Docker Context Issues

Ensure Docker is running and the correct context is set:

```bash
# Check Docker is running
docker ps

# On macOS/Windows, ensure Docker Desktop is started
# On Linux, ensure the Docker daemon is running:
sudo systemctl start docker
```

### Old Installation Artifacts

Previous Solo installations can cause issues. Clean up Solo-managed clusters:

```bash
# Delete only Solo-managed Kind clusters (names starting with "solo")
kind get clusters | grep '^solo' | while read cluster; do
  kind delete cluster -n "$cluster"
done

# Remove Solo configuration and cache
rm -rf ~/.solo
```

> **Warning:** Keep the `grep '^solo'` filter. Removing it can delete unrelated Kind clusters on your machine.

After cleanup, redeploy with:

```bash
solo one-shot single deploy
```

For a full teardown workflow, including standard destroy before manual cleanup, see [How to fully destroy a network and clean up resources](simple-solo-setup/cleanup.md).

---

## Collecting Diagnostic Information

Before seeking help, collect diagnostic information:

### Solo Diagnostics

```bash
# Capture comprehensive diagnostics
solo deployment diagnostics all --deployment "${SOLO_DEPLOYMENT}"
```

This creates logs and diagnostic files in `~/.solo/logs/`.

### Key Log Files

| File | Description |
|------|-------------|
| `~/.solo/logs/solo.log` | Solo CLI command logs |
| `~/.solo/logs/hashgraph-sdk.log` | SDK transaction logs |

### Kubernetes Diagnostics

```bash
# Cluster info
kubectl cluster-info

# All resources in namespace
kubectl get all -n "${SOLO_NAMESPACE}"

# Recent events
kubectl get events -n "${SOLO_NAMESPACE}" --sort-by='.lastTimestamp'

# Node resource usage
kubectl top nodes
kubectl top pods -n "${SOLO_NAMESPACE}"
```

## Getting Help

### 1. Check the Logs

Always start by examining logs:

```bash
# Solo logs
cat ~/.solo/logs/solo.log | tail -100

# Pod logs
kubectl logs -n "${SOLO_NAMESPACE}" <pod-name>
```

### 2. Documentation

- [Quickstart](simple-solo-setup/quickstart.md) - Basic setup and usage
- [Advanced Solo Setup](advanced-solo-setup/_index.md) - Complex deployment scenarios
- [FAQ](faq.md) - Common questions and answers
- [Solo CLI User Manual](advanced-solo-setup/solo-cli.md) - Command reference and examples

### 3. GitHub Issues

Report bugs or request features:

- **Repository**: <https://github.com/hiero-ledger/solo/issues>

When opening an issue, include:

- Solo version (`solo --version`)
- Operating system and version
- Docker/Kubernetes versions
- Steps to reproduce the issue
- Relevant log output
- Any error messages

### 4. Community Support

Join the community for discussions and help:

- **Hedera Discord**: Look for the `#solo` channel
- **Hiero Community**: <https://hiero.org/community>
