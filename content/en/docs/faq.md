---
title: "FAQs"
weight: 5
description: >
    Frequently asked questions about the Solo CLI tool.
type: docs
---

## One-command deployment options and variants

### How can I set up a Solo network in a single command?

You can run one of the following commands depending on your needs:

**Single Node Deployment (recommended for development):**

```bash
npx @hashgraph/solo:@latest one-shot single deploy
```

**Multiple Node Deployment (for testing consensus scenarios):**

```bash
npx @hashgraph/solo:@latest one-shot multi deploy
```

**Falcon Deployment (with custom configuration file):**

```bash
npx @hashgraph/solo:@latest one-shot falcon deploy --values-file falcon-values.yaml
```

The falcon deployment allows you to configure all network components (consensus nodes, mirror node, explorer, relay, and block node) through a single YAML configuration file.

More documentation can be found here:

* [Solo User Guide](solo-user-guide/#one-shot-deployment)
* [Solo CLI Commands](solo-commands/#one-shot-single)

---

## Destroying a network and cleaning up resources

### How can I tear down a Solo network in a single command?

You can run one of the following commands depending on how you deployed:

**Single Node Teardown:**

```bash
npx @hashgraph/solo:@latest one-shot single destroy
```

**Multiple Node Teardown:**

```bash
npx @hashgraph/solo:@latest one-shot multiple destroy
```

**Falcon Deployment Teardown:**

```bash
npx @hashgraph/solo:@latest one-shot falcon destroy
```

---

## Accessing exposed services

### How do I access services after deployment?

After running `solo one-shot single deploy`, the following services are available on localhost:

| Service               | Endpoint                | Description                            |
|-----------------------|-------------------------|----------------------------------------|
| Explorer UI           | `http://localhost:8080` | Web UI for inspecting accounts and transactions. |
| Consensus node (gRPC) | `localhost:50211`       | gRPC endpoint for submitting transactions. |
| Mirror node REST API  | `http://localhost:5551` | REST API for querying historical data. |
| JSON RPC relay        | `localhost:7546`        | Ethereum-compatible JSON RPC endpoint. |

Open `http://localhost:8080` in your browser to start exploring your local network.

To verify these services are reachable, you can run a quick health check:

```bash
# Mirror node REST API
curl -s "http://localhost:5551/api/v1/transactions?limit=1"

# JSON RPC relay
curl -s -X POST http://localhost:7546 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

If any service is unreachable, confirm that all pods are healthy first:

```bash
kubectl get pods -A | grep -v kube-system
```

All Solo-related pods should be in a `Running` or `Completed` state before the endpoints become available.

### What should I do if `solo one-shot single destroy` fails or my Solo state is corrupted?

> **Warning:** This is a last resort. Always try `solo one-shot single destroy` first.

If the standard destroy command fails, perform a full reset manually:

```bash
# Delete only Solo-managed Kind clusters (names starting with "solo")
kind get clusters | grep '^solo' | while read cluster; do
  kind delete cluster -n "$cluster"
done

# Remove Solo configuration and cache
rm -rf ~/.solo
```

> **Warning:** Always use the `grep '^solo'` filter above — omitting it will delete **every** Kind cluster on your machine, including those unrelated to Solo.

After a full reset, you can redeploy by following the [Quickstart](../simple-solo-setup/quickstart) guide.

---

## Common usage patterns and gotchas

### How can I avoid using genesis keys?

You can run `solo ledger system init` anytime after `solo consensus node start`.

### Where can I find the default account keys?

By default, Solo leverages the Hiero Consensus Node well known ED25519 private genesis key:

```bash
302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137
```

the genesis public key is:

```bash
302a300506032b65700321000aa8e21064c61eab86e2a9c164565b4e7a9a4146106e0a6cd03a8c395a110e92
```

Unless changed it is the private key for the default operator account `0.0.2` of the consensus network.

It is defined in [Hiero source code](https://github.com/hiero-ledger/hiero-consensus-node/blob/develop/hedera-node/data/onboard/GenesisPrivKey.txt)

### What is the difference between ECDSA keys and ED25519 keys?

See <https://docs.hedera.com/hedera/core-concepts/keys-and-signatures> for a detailed answer.

### Where can I find the EVM compatible private key?

You will need to use ECDSA keys for EVM tooling compatibility.  If you take the `privateKeyRaw` provided by Solo and prefix it with `0x` you will have the private key used by Ethereum compatible tools.

### How do I get the key for an account?

Use the following command to get account balance and private key of the account `0.0.1007`:

```bash
# get account info of 0.0.1007 and also show the private key
solo ledger account info --account-id 0.0.1007 --deployment solo-deployment  --private-key
```

The output would be similar to the following:

```bash
{
 "accountId": "0.0.1007",
 "privateKey": "302e020100300506032b657004220420411a561013bceabb8cb83e3dc5558d052b9bd6a8977b5a7348bf9653034a29d7",
 "privateKeyRaw": "411a561013bceabb8cb83e3dc5558d052b9bd6a8977b5a7348bf9653034a29d7"
 "publicKey": "302a300506032b65700321001d8978e647aca1195c54a4d3d5dc469b95666de14e9b6edde8ed337917b96013",
 "balance": 100
}
```

### How to handle error "failed to setup chart repositories"

If during the installation of solo-charts you see the error similar to the following:

```text
failed to setup chart repositories,
repository name (hedera-json-rpc-relay) already exists
```

You need to remove the old helm repo manually, first run command `helm repo list` to
see the list of helm repos, and then run `helm repo remove <repo-name>` to remove the repo.
For example:

```bash
helm repo list

NAME                  URL                                                       
haproxy-ingress       https://haproxy-ingress.github.io/charts                  
haproxytech           https://haproxytech.github.io/helm-charts                 
metrics-server        https://kubernetes-sigs.github.io/metrics-server/         
metallb               https://metallb.github.io/metallb                         
mirror                https://hashgraph.github.io/hedera-mirror-node/charts     
hedera-json-rpc-relay https://hashgraph.github.io/hedera-json-rpc-relay/charts
```

Next run the command to remove the repo:

```bash
helm repo remove hedera-json-rpc-relay
```

### Why do I see unhealthy pods after deployment?

The most common cause is insufficient memory or CPU allocated to Docker Desktop. Minimum requirements:

| Deployment type | Minimum RAM | Minimum CPU |
| --- | --- | --- |
| Single-node | 12 GB | 6 cores |
| Multi-node (3+ nodes) | 16 GB | 8 cores |

Adjust these in **Docker Desktop → Settings → Resources** and restart Docker before deploying.

### Why should I destroy my network before redeploying?

Running `solo one-shot single deploy` while a prior deployment still exists causes conflicts and errors. Always run destroy first:

```bash
solo one-shot single destroy
solo one-shot single deploy
```

### How do I find my deployment name?

Most management commands (stop, start, diagnostics) require the deployment name. Retrieve it with:

```bash
cat ~/.solo/cache/last-one-shot-deployment.txt
```

This outputs a value like `solo-deployment-<hash>`. Use it as `<deployment-name>` in subsequent commands.

### How do I create test accounts after deployment?

Create funded test accounts with:

```bash
solo ledger account create --deployment <deployment-name> --hbar-amount 100
```

### Why does resource usage grow during testing?

The mirror node accumulates transaction history while the network is running. If you notice increasing memory or disk usage during extended testing sessions, destroy and redeploy the network to reset it to a clean state.

### How can I monitor my cluster more easily?

[k9s](https://k9scli.io/) provides a real-time terminal UI for inspecting pods, logs, and cluster state. Install it with:

```bash
brew install k9s
```

Then run `k9s` to launch. It is especially helpful for watching pod startup progress during deployment.

### How do I deploy multiple consensus nodes?

Pass the `--num-consensus-nodes` flag to the one-shot command:

```bash
solo one-shot single deploy --num-consensus-nodes 3
```

Tear it down with the same destroy command:

```bash
solo one-shot single destroy
```
