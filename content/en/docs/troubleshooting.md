---
title: "Troubleshooting"
weight: 4
description: >
  Solutions to common issues when using Solo, plus guidance on getting help.
  This document covers installation problems, pod readiness issues, resource constraints,
  and how to find additional support.
categories: ["Troubleshooting"]
tags: ["troubleshooting", "debugging", "kubernetes", "operations"]
type: docs
---

This guide covers common issues you may encounter when using Solo and how to resolve them.

## Quick Navigation

Use this page when something is failing and you need to diagnose or recover quickly.

- [Troubleshooting installation and upgrades](#troubleshooting-installation-and-upgrades)
- [Pods not reaching Ready state](#pods-not-reaching-ready-state)
- [CrashLoopBackOff causes and remediation](#crashloopbackoff-causes-and-remediation)
- [Resource constraint errors (CPU / RAM / Disk)](#resource-constraint-errors-cpu--ram--disk)
- [Getting help](#getting-help)

## Related Operational Topics

If you are looking for setup or day-to-day usage guidance rather than failure diagnosis, start with these pages:

- [One-command deployment options and variants](/docs/faqs#one-command-deployment-options-and-variants)
- [How to fully destroy a network and clean up resources](/docs/simple-solo-setup/cleanup)
- [How to access exposed services (mirror node, relay, explorer)](/docs/faqs#accessing-exposed-services)
- [Common usage patterns and gotchas](/docs/faqs#common-usage-patterns-and-gotchas)

## Common Issues and Solutions

### Troubleshooting Installation and Upgrades

Installation and upgrade failures are common, especially when older installs or previous deployments are still present.

### Symptoms

You are likely hitting an installation or upgrade problem if:

- `solo` fails to start after changing versions.
- `solo one-shot single deploy` fails early with validation or environment errors.
- Commands report missing dependencies or incompatible versions.
- A new deployment fails immediately after a previous network was not destroyed.

### Quick Checks

1. **Confirm installation method**

   If you previously installed Solo via npm and are now using Homebrew, remove the legacy npm install to avoid conflicts:

   ```bash
   # Remove legacy npm-based Solo (if present)
   if command -v npm >/dev/null 2>&1; then
     npm uninstall -g @hiero-ledger/solo || true
   fi
   ```

   Then reinstall Solo using the steps in the [Quickstart](/docs/simple-solo-setup/quickstart).

2. **Verify system resources**

     - Ensure your machine and Docker (or other container runtime) meet the minimum requirements described in  
   [System readiness](/docs/simple-solo-setup/system-readiness#hardware-requirements).

     - If Docker Desktop or your container runtime is configured below these values, increase the allocations and retry the install or deploy.

3. **Clean up previous deployments**

   If an upgrade or redeploy fails, first run a standard destroy:

   ```bash
   solo one-shot single destroy
   ```

---

### Pods not reaching Ready state

If pods remain in `Pending`, `Init`, `ContainerCreating`, or `CrashLoopBackOff`, follow this sequence to identify the blocker.

1. Check readiness and restarts

   ```bash
   # Show readiness and restart count for each pod
   kubectl get pods -n "${SOLO_NAMESPACE}" \
     -o custom-columns=NAME:.metadata.name,PHASE:.status.phase,READY:.status.containerStatuses[*].ready,RESTARTS:.status.containerStatuses[*].restartCount
   ```

2. Inspect pod events

   ```bash
   # List all pods in your namespace
   kubectl get pods -n "${SOLO_NAMESPACE}"

   # Describe a specific pod to see events
   kubectl describe pod -n "${SOLO_NAMESPACE}" <pod-name>
   ```

3. Map symptoms to likely causes

   | Symptom            | Likely cause                | Next step                                                           |
   | ------------------ | --------------------------- | ------------------------------------------------------------------- |
   | `Pending`          | Insufficient resources      | Increase Docker memory/CPU allocation, then retry                   |
   | `Pending`          | Storage issues              | Check disk space, free space if needed, restart Docker              |
   | `CrashLoopBackOff` | Container failing to start  | Check pod logs: `kubectl logs -n "${SOLO_NAMESPACE}" <pod-name>`    |
   | `ImagePullBackOff` | Can't pull container images | Check internet connectivity and Docker Hub rate limits              |

### CrashLoopBackOff causes and remediation

If a pod repeatedly restarts and enters `CrashLoopBackOff`, inspect current logs, previous logs, and events:

```bash
# Current container logs
kubectl logs -n "${SOLO_NAMESPACE}" <pod-name>

# Previous container logs (captures startup failures)
kubectl logs -n "${SOLO_NAMESPACE}" <pod-name> --previous

# Pod events and failure reasons
kubectl describe pod -n "${SOLO_NAMESPACE}" <pod-name>
```

Common causes include invalid runtime configuration, missing dependencies, and insufficient memory.

- Recommended remediation sequence:

  1. If events mention `OOMKilled` or repeated liveness probe failures, increase Docker CPU/RAM and retry.
  2. If the issue started after a failed upgrade or deploy, run the cleanup steps in **Old installation artifacts** and redeploy.
  3. If only one node is affected, refresh or restart it:
  
     ```bash
     solo consensus node refresh --node-aliases node1 --deployment "${SOLO_DEPLOYMENT}"
     # or
     solo consensus node restart --deployment "${SOLO_DEPLOYMENT}"
     ```

  #### Resource allocation:
  
  - Ensure your machine and Docker (or other container runtime) meet the minimum requirements described in [System readiness](/docs/simple-solo-setup/system-readiness#hardware-requirements).
  
  - On Docker Desktop, check: **Settings > Resources**.

### Resource constraint errors (CPU / RAM / Disk)

Resource pressure is a common cause of `Pending` pods, slow startup, and repeated restarts.

1. Check Kubernetes-level CPU and memory utilization:

   ```bash
   kubectl top nodes
   kubectl top pods -n "${SOLO_NAMESPACE}"
   ```

2. Check host and Docker disk usage:

   ```bash
   # Host disk availability
   df -h

   # Docker disk usage (if using Docker)
   docker system df
   ```

3. Compare against the recommended local baseline:

See [System readiness](/docs/simple-solo-setup/system-readiness#hardware-requirements) for the recommended memory, CPU, and disk values.

---

### Connection refused errors

If you cannot connect to Solo network endpoints from your machine, use this sequence to isolate the issue.

1. Verify services and endpoints inside the cluster

   ```bash
   # List all services
   kubectl get svc -n "${SOLO_NAMESPACE}"

   # Check if endpoints are populated
   kubectl get endpoints -n "${SOLO_NAMESPACE}"
   ```

   - If the service exists but has **no endpoints**, the backing pods are not Ready.  
     See [Pods not reaching Ready state](#pods-not-reaching-ready-state).

2. Use manual port forwarding (bypass automation)

   If automatic port forwarding (from `solo` commands or your environment) is not working, forward the required services manually:

   ```bash
   # Consensus node (gRPC)
   kubectl port-forward svc/haproxy-node1-svc -n "${SOLO_NAMESPACE}" 50211:50211 &

   # Explorer UI
   kubectl port-forward svc/hiero-explorer -n "${SOLO_NAMESPACE}" 8080:8080 &

   # Mirror node gRPC
   kubectl port-forward svc/mirror-1-grpc -n "${SOLO_NAMESPACE}" 5600:5600 &

   # Mirror node REST
   kubectl port-forward svc/mirror-1-rest -n "${SOLO_NAMESPACE}" 5551:80 &

   # JSON-RPC relay
   kubectl port-forward svc/relay-node1-hedera-json-rpc-relay -n "${SOLO_NAMESPACE}" 7546:7546 &
   ```

3. Confirm the expected endpoints and ports

   After forwarding, connect to the local ports shown above (for example, `http://localhost:8080/localnet/dashboard` for the explorer).  
   For the standard exposed endpoints after a successful one-shot deployment, see [How to access exposed services (mirror node, relay, explorer)](/docs/faqs#accessing-exposed-services).

---

### Node synchronization issues

If nodes are not forming consensus or transactions are not being processed, follow these steps.

1. Check node state and gossip logs:

   ```bash
   # Download state information for a node
   solo consensus state download --deployment "${SOLO_DEPLOYMENT}" --node-aliases node1

   # Check logs for gossip-related issues
   kubectl logs -n "${SOLO_NAMESPACE}" network-node-0 | grep -i gossip
   ```

   Look for repeated connection failures, timeouts, or gossip disconnection messages.

2. Restart problematic nodes:

   ```bash
   # Refresh a specific node
   solo consensus node refresh --node-aliases node1 --deployment "${SOLO_DEPLOYMENT}"

   # Or restart all nodes
   solo consensus node restart --deployment "${SOLO_DEPLOYMENT}"
   ```

   After restarting, submit a small test transaction and verify that it reaches consensus.

### Mirror node not importing records

If the mirror node is not showing new transactions, first confirm that records are being generated and imported.

1. Verify the pinger is running

   The `--pinger` flag should be enabled when deploying the mirror node. The pinger sends periodic transactions so that record files are created.

   ```bash
   # Check if pinger pod is running
   kubectl get pods -n "${SOLO_NAMESPACE}" | grep pinger
   ```

2. Redeploy the mirror node with pinger enabled

   If the pinger is missing or misconfigured:

   ```bash
   # Destroy the existing mirror node
   solo mirror node destroy --deployment "${SOLO_DEPLOYMENT}" --force

   # Redeploy with pinger enabled
   solo mirror node add \
     --deployment "${SOLO_DEPLOYMENT}" \
     --cluster-ref kind-${SOLO_CLUSTER_NAME} \
     --enable-ingress \
     --pinger
   ```

### Helm repository errors

If you see errors such as `repository name already exists`, you likely have a conflicting Helm repo entry.

1. List current Helm repositories:

   ```bash
   helm repo list
   ```

2. Remove the conflicting repository:

   ```bash
   helm repo remove <repo-name>

   # Example: remove hedera-json-rpc-relay
   helm repo remove hedera-json-rpc-relay
   ```

Re-run the Solo command that configures Helm after removing the conflict.

### Kind cluster issues

Problems starting or accessing the Kind cluster often present as cluster creation failures or missing nodes.

1. Cluster will not start or is in a bad state:

   ```bash
   # Delete and recreate the cluster
   kind delete cluster -n "${SOLO_CLUSTER_NAME}"
   kind create cluster -n "${SOLO_CLUSTER_NAME}"
   ```

2. Docker context or daemon issues

   Ensure Docker is running and the correct context is active:

   ```bash
   # Check Docker is running
   docker ps

   # On macOS/Windows, ensure Docker Desktop is started.
   # On Linux, ensure the Docker daemon is running:
   sudo systemctl start docker
   ```

### Cleanup and reset (old installation artifacts)

Previous Solo installations can cause conflicts during new deployments.  
For the full teardown and full reset procedure, see the [Cleanup guide](/docs/simple-solo-setup/cleanup).

At a high level:

1. Run a standard destroy first:

   ```bash
   solo one-shot single destroy
   ```

2. If `destroy` fails or Solo state is corrupted, perform a [full reset](/docs/simple-solo-setup/cleanup#full-reset), which:
   - Deletes Solo-managed Kind clusters (names starting with `solo`).
   - Removes the Solo home directory (`~/.solo`).

---

## Collecting diagnostic information

Before seeking help, collect the following diagnostics so issues can be reproduced and analyzed.

### Solo diagnostics

1. Capture comprehensive diagnostics for the deployment:

   ```bash
   solo deployment diagnostics all --deployment "${SOLO_DEPLOYMENT}"
   ```

   This creates logs and diagnostic files under `~/.solo/logs/`.

### Key log files

These files are often requested when reporting issues:

| File                              | Description                           |
| --------------------------------- | ------------------------------------- |
| `~/.solo/logs/solo.log`           | Solo CLI command logs                 |

### Kubernetes diagnostics

Collect basic cluster and namespace information:

```bash
# Cluster info
kubectl cluster-info

# All resources in the Solo namespace
kubectl get all -n "${SOLO_NAMESPACE}"

# Recent events in the namespace (sorted by time)
kubectl get events -n "${SOLO_NAMESPACE}" --sort-by='.lastTimestamp'

# Node and pod resource usage
kubectl top nodes
kubectl top pods -n "${SOLO_NAMESPACE}"
```

---

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

- [Quickstart](/docs/simple-solo-setup/quickstart) - Basic setup and usage.
- [Advanced Solo Setup](/docs/advanced-solo-setup) - Complex deployment scenarios.
- [FAQs](/docs/faqs) - Common questions and answers.
- [Solo CLI Reference](/docs/advanced-solo-setup/cli/solo-cli) - Canonical command and flag reference.

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
- **Contribute to Hiero**: <https://hiero.org/#contribute>
