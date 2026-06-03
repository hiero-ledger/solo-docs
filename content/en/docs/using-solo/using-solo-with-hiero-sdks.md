---
title: "Using Solo with Hiero SDKs"
weight: 1
description: >
  Walk through submitting your first transaction to a local Solo network
  using the Hiero JavaScript, Java, or Go SDK.
categories: ["Integration", "Developer"]
tags: ["developer", "javascript-sdk", "java-sdk", "go-sdk", "transactions"]
type: docs
---

## Overview

The Hiero SDKs let you build and test applications on the Hiero network using
[JavaScript / TypeScript](https://github.com/hiero-ledger/hiero-sdk-js),
[Java](https://github.com/hiero-ledger/hiero-sdk-java), or
[Go](https://github.com/hiero-ledger/hiero-sdk-go). This guide walks you
through launching a local Solo network, locating its bootstrap operator
account, setting up a project for your chosen SDK, and running example
transactions. The Solo-side steps are identical across all three SDKs;
the language-specific steps appear in tabs you can switch between.

---

## Prerequisites

Before proceeding, ensure you have completed the following:

- [**System Readiness**](/docs/simple-solo-setup/system-readiness):
  - Your local environment meets all hardware and software requirements, including Docker, kubectl, and Solo.

  - The shared baseline tools:

    | Requirement | Version | Purpose |
    | --- | --- | --- |
    | [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | Runs the Solo cluster containers |
    | [Solo](/docs/simple-solo-setup/system-readiness) | Latest stable | Deploys and manages the local network |

- Plus the SDK-specific toolchain for the language you'll use:

  {{< tabpane text=true >}}

  {{% tab header="JavaScript" lang="javascript" %}}

  | Requirement | Version | Purpose |
  | --- | --- | --- |
  | [Node.js](https://nodejs.org/) | v20 or higher | Runs your application against the SDK |

  {{% /tab %}}

  {{% tab header="Java" lang="java" %}}

  | Requirement | Version | Purpose |
  | --- | --- | --- |
  | [JDK](https://adoptium.net/) | **v21 or higher** (Eclipse Temurin recommended) | Required by the Hiero Java SDK |
  | [Gradle](https://gradle.org/install/) | v8.5 or later | Builds and runs the Java project |

  {{% /tab %}}

  {{% tab header="Go" lang="go" %}}

  | Requirement | Version | Purpose |
  | --- | --- | --- |
  | [Go](https://go.dev/dl/) | **v1.25 or higher** | Required by the Hiero Go SDK |

  {{% /tab %}}

  {{< /tabpane >}}

> **Note:** Solo uses Docker Desktop to spin up local Hiero consensus and mirror nodes.
> Ensure Docker Desktop is running before deploying the local network.

---

## Step 1: Launch a Local Solo Network

Deploy a local Solo network by following the [Solo Quickstart](/docs/simple-solo-setup/quickstart). Once it's running, retrieve your deployment name with [`solo one-shot show deployment`](/docs/simple-solo-setup/quickstart#capture-your-deployment-name) - the rest of this guide refers to it as `<your-deployment-name>`.

---

## Step 2: Install the SDK

Install the Hiero SDK for your language.

{{< tabpane text=true >}}

{{% tab header="JavaScript" lang="javascript" %}}

Initialize a Node.js project and install the SDK from npm:

```bash
mkdir solo-js-demo && cd solo-js-demo
npm init -y
npm install @hiero-ledger/sdk
```

For the full SDK source tree (with the bundled `examples/` directory), follow the [Hiero JavaScript SDK README](https://github.com/hiero-ledger/hiero-sdk-js#installation). The repository uses pnpm workspaces + go-task to build.

{{% /tab %}}

{{% tab header="Java" lang="java" %}}

Follow the [Hiero Java SDK quickstart](https://github.com/hiero-ledger/hiero-sdk-java/blob/v2.72.0/docs/java-app/java-app-quickstart.md) to set up a Gradle (or Maven) project. The minimum dependency set:

```kotlin
implementation("com.hedera.hashgraph:sdk:2.72.0")
implementation("io.grpc:grpc-netty-shaded:1.64.0")
implementation("org.slf4j:slf4j-nop:2.0.9")
```

{{% /tab %}}

{{% tab header="Go" lang="go" %}}

Initialize a Go module and add the Hiero Go SDK:

```bash
mkdir solo-go-demo && cd solo-go-demo
go mod init solo-go-demo
go get github.com/hiero-ledger/hiero-sdk-go/v2@v2.80.0
```

Go 1.25 or higher is required (per `go.mod` in the SDK). See the [Hiero Go SDK README](https://github.com/hiero-ledger/hiero-sdk-go) for the full setup walkthrough.

{{% /tab %}}

{{< /tabpane >}}

---

## Step 3: Locate Your Operator Credentials

`solo one-shot single deploy` provisions a bootstrap operator account (`0.0.2`)
at genesis and writes its credentials to disk. Use this account as your
operator - you do **not** need to call `solo ledger account create` for the
examples in this guide.

- Print the operator credentials:

  ```bash
  cat ~/.solo/one-shot-<your-deployment-name>/accounts.json
  ```

- **Example output:**

  ```json
  {
    "systemAccounts": [
      {
        "name": "Operator",
        "accountId": "0.0.2",
        "publicKey": "302a300506032b65700321000aa8e21064c61eab86e2a9c164565b4e7a9a4146106e0a6cd03a8c395a110e92",
        "privateKey": "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"
      }
    ],
    "createdAccounts": [
      { "accountId": "0.0.1002", "privateKey": "0x105d050185...", "balance": "1000000 ℏ", "group": "ecdsa-alias" },
      ...
    ]
  }
  ```

  The `systemAccounts[0]` block is the operator (`0.0.2`) with an Ed25519 key in DER format. The `createdAccounts` array contains additional pre-funded ECDSA-alias accounts useful for EVM workflows.

- Save the `accountId` and `privateKey` values from `systemAccounts[0]` - you will configure the SDK with them in the next step.

> **EVM tooling note:** For ethers.js, Hardhat, or Foundry, use one of the
> `createdAccounts` entries; their `privateKey` values are already in
> 0x-prefixed hex form. See
> [Using Solo with EVM Tools](/docs/using-solo/using-solo-with-evm-tools) for
> the full EVM-side workflow.

---

## Step 4: Configure the SDK to Connect to Solo

Each SDK reads operator credentials and the network endpoint differently.
Pick your language tab below.

{{< tabpane text=true >}}

{{% tab header="JavaScript" lang="javascript" %}}

The Hiero JavaScript SDK uses environment variables to authenticate the operator account. Create a `.env` file at the root of the `hiero-sdk-js` directory:

```bash
cd hiero-sdk-js

cat > .env <<EOF
# Operator account ID (systemAccounts[0].accountId from Step 3)
OPERATOR_ID="0.0.2"

# Operator private key (systemAccounts[0].privateKey from Step 3)
OPERATOR_KEY="302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"

# Required by LocalProvider in the SDK example scripts (Step 5).
# Not used by the Client.fromConfig() snippet below, but harmless to include.
HEDERA_NETWORK="local-node"
EOF

source .env
```

> **Important:** `OPERATOR_KEY` must be set to the `privateKey` value, not the `publicKey`. The private key is the longer DER-encoded string beginning with `302e...`. The example scripts also require `HEDERA_NETWORK` - they throw "LocalProvider requires the `HEDERA_NETWORK` environment variable to be set" if it is missing.

> **Security:** Never commit `.env` to source control - the file holds the operator's private key. Add `.env` to your repository's `.gitignore`.

Configure the client with the **Solo 0.63+** port-forwards using `Client.fromConfig()`. The SDK's built-in `Client.forLocalNode()` preset is hardcoded to `localhost:50211`, which does not match Solo 0.63+ defaults (`localhost:35211` for consensus gRPC, `localhost:38081` for the mirror node ingress). Use the explicit network map shown below instead:

```typescript
import { Client, AccountId } from "@hiero-ledger/sdk";

const network = { "127.0.0.1:35211": AccountId.fromString("0.0.3") };
const mirrorNetwork = "127.0.0.1:38081";

const client = Client.fromConfig({
  network,
  mirrorNetwork,
  // Required: the SDK's address-book refresh otherwise pulls in the
  // hardcoded 50211/50212 ports, which Solo 0.63+ does not expose.
  scheduleNetworkUpdate: false,
});
client.setOperator(process.env.OPERATOR_ID!, process.env.OPERATOR_KEY!);
```

{{% /tab %}}

{{% tab header="Java" lang="java" %}}

Create a `.env` file at the project root to hold your operator credentials:

```bash
cat > .env <<EOF
# Operator account ID (systemAccounts[0].accountId from Step 3)
OPERATOR_ID=0.0.2

# Operator private key (systemAccounts[0].privateKey from Step 3)
OPERATOR_KEY=302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137
EOF
```

> **Important:** `OPERATOR_KEY` must be the `privateKey` value, not the `publicKey`. The private key is the longer DER-encoded string beginning with `302e...`.

> **Security:** Never commit `.env` to source control - the file holds the operator's private key. Add `.env` to your repository's `.gitignore`.

Load the env variables:

```bash
set -a; source .env; set +a
```

Configure the client in `src/main/java/Main.java`. Unlike the JavaScript SDK (which ships a `LocalProvider` / `Client.forName("local-node")` preset), the Hiero Java SDK has no local-node preset - `Client.forName(...)` only accepts `"mainnet"`, `"testnet"`, or `"previewnet"` and throws `IllegalArgumentException` otherwise. Build the network map explicitly using `Client.forNetwork(Map)` against Solo's auto-forwarded ports:

```java
import com.hedera.hashgraph.sdk.AccountId;
import com.hedera.hashgraph.sdk.AccountInfoQuery;
import com.hedera.hashgraph.sdk.Client;
import com.hedera.hashgraph.sdk.PrivateKey;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        String operatorId  = System.getenv("OPERATOR_ID");
        String operatorKey = System.getenv("OPERATOR_KEY");
        if (operatorId == null || operatorKey == null) {
            throw new IllegalStateException(
                    "Set OPERATOR_ID and OPERATOR_KEY env vars before running.");
        }

        Map<String, AccountId> network = new HashMap<>();
        network.put("127.0.0.1:35211", AccountId.fromString("0.0.3"));

        Client client = Client.forNetwork(network);
        client.setMirrorNetwork(List.of("127.0.0.1:38081"));
        client.setOperator(
                AccountId.fromString(operatorId),
                PrivateKey.fromString(operatorKey));

        // ... transactions and queries go here ...

        client.close();
    }
}
```

> `Client.setMirrorNetwork(List<String>)` declares `throws InterruptedException`, and queries/transactions throw `TimeoutException` / `PrecheckStatusException`. Declaring `throws Exception` on `main` keeps the example readable; wrap with explicit try/catch in production code.

{{% /tab %}}

{{% tab header="Go" lang="go" %}}

The Hiero Go SDK reads operator credentials and the target network from environment variables.

Create a `.env` file at the project root:

```bash
cat > .env <<'EOF'
# Operator account ID (systemAccounts[0].accountId from Step 3)
export OPERATOR_ID="0.0.2"

# Operator private key (systemAccounts[0].privateKey from Step 3)
export OPERATOR_KEY="302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"

# Network name. "localhost" is the SDK's local-node preset; only used by
# ClientForName(...) - the explicit ClientForNetworkV2 path below ignores it.
export HEDERA_NETWORK="localhost"
EOF

source .env
```

> **Important:** `OPERATOR_KEY` must be the `privateKey` value, not the `publicKey`. The private key is the longer DER-encoded string beginning with `302e...`.

> **Security:** Never commit `.env` to source control. Add it to `.gitignore`.

Configure the client in `main.go`. The Hiero Go SDK ships a `ClientForName` preset that recognizes `"local"` and `"localhost"`, but the preset is **hardcoded to `127.0.0.1:50211` (consensus gRPC) and `127.0.0.1:5600` (mirror gRPC)** - ports Solo does not expose by default (Solo's auto-port-forwards use `35211` and `38081`). The simplest path that works out of the box is to build the network map explicitly with `ClientForNetworkV2`:

```go
package main

import (
    "fmt"
    "os"

    hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
)

func main() {
    operatorID := os.Getenv("OPERATOR_ID")
    operatorKey := os.Getenv("OPERATOR_KEY")
    if operatorID == "" || operatorKey == "" {
        fmt.Fprintln(os.Stderr, "Set OPERATOR_ID and OPERATOR_KEY env vars before running.")
        os.Exit(1)
    }

    network := map[string]hiero.AccountID{
        "127.0.0.1:35211": {Account: 3},
    }

    client, err := hiero.ClientForNetworkV2(network)
    if err != nil {
        panic(err)
    }
    defer client.Close()

    client.SetMirrorNetwork([]string{"127.0.0.1:38081"})

    opAccID, err := hiero.AccountIDFromString(operatorID)
    if err != nil {
        panic(err)
    }
    opKey, err := hiero.PrivateKeyFromString(operatorKey)
    if err != nil {
        panic(err)
    }
    client.SetOperator(opAccID, opKey)

    // ... transactions and queries go here ...
}
```

> The network map's value uses the struct literal `hiero.AccountID{Account: 3}` (matches `network-node1`'s `0.0.3`). This is shorter than `hiero.AccountIDFromString("0.0.3")` and matches the form upstream examples use.

{{% /tab %}}

{{< /tabpane >}}

### Verify your configuration

Add an `AccountInfoQuery` for the operator and run it to confirm the client reaches Solo.

{{< tabpane text=true >}}

{{% tab header="JavaScript" lang="javascript" %}}

In your TypeScript/JavaScript code, after building `client`:

```typescript
const info = await new AccountInfoQuery()
  .setAccountId(AccountId.fromString(process.env.OPERATOR_ID!))
  .execute(client);

console.log("Account ID :", info.accountId.toString());
console.log("Balance    :", info.balance.toString());
```

{{% /tab %}}

{{% tab header="Java" lang="java" %}}

In `Main.java`, after `setOperator(...)`:

```java
var info = new AccountInfoQuery()
        .setAccountId(AccountId.fromString(operatorId))
        .execute(client);

System.out.println("Account ID : " + info.accountId);
System.out.println("Balance    : " + info.balance);
```

Then run `gradle run`.

**Expected output:**

```
Account ID : 0.0.2
Balance    : 49989999499.9946 ℏ
```

{{% /tab %}}

{{% tab header="Go" lang="go" %}}

In `main.go`, after `SetOperator(...)`:

```go
info, err := hiero.NewAccountInfoQuery().
    SetAccountID(opAccID).
    Execute(client)
if err != nil {
    panic(err)
}
fmt.Printf("Account ID : %s\n", info.AccountID)
fmt.Printf("Balance    : %s\n", info.Balance)
```

Then run `go run .`.

**Expected output:**

```
Account ID : 0.0.2
Balance    : 4.99899994792001e+10 ℏ
```

The Hbar value is printed in scientific notation by default; format it with `info.Balance.As(hiero.HbarUnits.Hbar)` or `info.Balance.AsTinybar()` for decimal HBAR or tinybars.

{{% /tab %}}

{{< /tabpane >}}

The exact balance differs slightly between deployments; what matters is that an `AccountInfo` returns at all - that proves the gRPC pipe to the consensus node is alive and the operator credentials are valid.

---

## Step 5: Run Transactions Against Solo

> **Heads up (JavaScript and Go only):** The SDK example programs use the
> SDK's local-node preset (`LocalProvider` in JS, `ClientForName("localhost")`
> in Go), which is hardcoded to `127.0.0.1:50211` (consensus gRPC) and
> `127.0.0.1:5600` (mirror gRPC). Solo doesn't expose those ports by default,
> so the upstream example programs cannot reach the network out of the box.
> Either follow [Make the examples reachable](#make-the-examples-reachable)
> below, or rewrite the example to use the `Client.fromConfig` (JS) /
> `ClientForNetworkV2` (Go) pattern from
> [Step 4](#step-4-configure-the-sdk-to-connect-to-solo). The Java SDK has no
> local-node preset, so this caveat does not apply there.

### Make the examples reachable

{{< tabpane text=true >}}

{{% tab header="JavaScript" lang="javascript" %}}

Pick one:

**Option A - forward Solo's services to the SDK's legacy ports** (run examples unchanged):

```bash
kubectl port-forward svc/haproxy-node1-svc -n <your-deployment-name> 50211:50211 &
kubectl port-forward svc/mirror-1-grpc     -n <your-deployment-name> 5600:5600 &
```

The kubectl namespace matches `<your-deployment-name>` for default one-shot deploys.

**Option B - edit the example** to use the `Client.fromConfig({ ..., scheduleNetworkUpdate: false })` pattern from [Step 4](#step-4-configure-the-sdk-to-connect-to-solo). No port-forwarding needed.

{{% /tab %}}

{{% tab header="Java" lang="java" %}}

No additional setup required. The `Client.forNetwork(Map)` pattern from
[Step 4](#step-4-configure-the-sdk-to-connect-to-solo) hits Solo's auto-forwarded
ports (`35211` consensus, `38081` mirror) directly.

{{% /tab %}}

{{% tab header="Go" lang="go" %}}

Pick one:

**Option A - forward Solo's services to the SDK's legacy ports** (run upstream examples with `HEDERA_NETWORK="localhost"` unchanged):

```bash
kubectl port-forward svc/haproxy-node1-svc -n <your-deployment-name> 50211:50211 &
kubectl port-forward svc/mirror-1-grpc     -n <your-deployment-name> 5600:5600 &
```

**Option B - use `ClientForNetworkV2` directly** (the pattern shown in [Step 4](#step-4-configure-the-sdk-to-connect-to-solo)). No port-forwarding needed.

{{% /tab %}}

{{< /tabpane >}}

### Try a tutorial against your Solo network

Once your client is configured (Step 4), the canonical Hiero / Hedera SDK
tutorials run against Solo the same way they run against testnet or mainnet -
only the network endpoint changes. Pick a tutorial and follow it as written:

- [Create an account](https://docs.hedera.com/hedera/getting-started-hedera-native-developers/create-an-account)
- [Create a topic](https://docs.hedera.com/hedera/getting-started-hedera-native-developers/create-a-topic)
- [Transfer cryptocurrency](https://docs.hedera.com/hedera/sdks-and-apis/sdks/cryptocurrency/transfer-cryptocurrency)
- Full tutorial index: [Hiero / Hedera SDK guides](https://docs.hedera.com/hedera/sdks-and-apis/sdks)

Each SDK also ships a runnable [`examples/`](#resources) directory with
dozens of additional patterns - token creation, smart contract deployment,
HCS pub/sub, scheduled transactions, and more.

Verify transactions you submit in the Hiero Explorer:
[http://localhost:38080/localnet/dashboard](http://localhost:38080/localnet/dashboard).

---

## Step 6: Tear Down the Network

When you are finished, remove the local consensus node, mirror node, block
node, relay, explorer, and all data volumes:

```bash
solo one-shot single destroy \
  --deployment <your-deployment-name>
```

---

## Optional: Manage Files on the Network

Solo provides CLI commands to create and update files stored on the Hiero File Service.

### Create a New File

```bash
solo ledger file create \
  --deployment <your-deployment-name> \
  --file-path ./config.json
```

This command:

- Creates a new file on the network and returns a system-assigned file ID.
- Automatically splits files larger than 4 KB into chunks using `FileAppendTransaction`.
- Verifies that the uploaded content matches the local file.

### Update an Existing File

```bash
solo ledger file update \
  --deployment <your-deployment-name> \
  --file-id 0.0.1234 \
  --file-path ./updated-config.json
```

This command:

- Verifies the file exists on the network (errors if not found).
- Replaces the file content and re-verifies the upload.
- Automatically handles chunking for large files (>4 KB).

> **Note:** For files larger than 4 KB, both commands split content into 4 KB chunks and display per-chunk progress during the append phase.

---

## Inspect Transactions in Hiero Explorer

Open the Hiero Explorer to visually inspect submitted transactions, accounts, topics, and files. The Solo Quickstart's [Access your local network](/docs/simple-solo-setup/quickstart#access-your-local-network) section lists the Explorer URL and port-availability behavior. Once it's open, search by account ID, transaction ID, or topic ID to confirm that your transactions reached consensus.

---

## Retrieving Logs

Solo writes logs to `~/.solo/logs/`:

| Log File | Contents |
| --- | --- |
| `solo.log` | Human-readable Solo CLI output and lifecycle events |
| `solo.ndjson` | Newline-delimited JSON of the same events (authoritative, machine-readable) |

The Solo log is useful for debugging connectivity issues between the SDK and your local Solo network.

### SDK logging

For SDK-side logs (which logger each SDK uses and how to configure it), see the upstream docs:

- **JavaScript:** [Hiero JS SDK README](https://github.com/hiero-ledger/hiero-sdk-js#logging)
- **Java:** [Hiero Java SDK logging guide](https://github.com/hiero-ledger/hiero-sdk-java#logging)
- **Go:** [Hiero Go SDK README](https://github.com/hiero-ledger/hiero-sdk-go#logging)

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `LocalProvider requires the HEDERA_NETWORK environment variable to be set` *(JS)* | `HEDERA_NETWORK` missing from `.env`, or `.env` not sourced in this shell | Add `HEDERA_NETWORK="local-node"` to `.env`; then `source .env` |
| `Dependency resolution is looking for a library compatible with JVM runtime version 17, but 'com.hedera.hashgraph:sdk:2.72.0' is only compatible with JVM runtime version 21 or newer` *(Java)* | JDK 17 target in `build.gradle.kts` | Set `sourceCompatibility = JavaVersion.VERSION_21` and ensure the JDK on `PATH` is v21+ |
| `IllegalArgumentException: Name must be one-of 'mainnet', 'testnet', or 'previewnet'` *(Java)* | Called `Client.forName("local-node")` | Use `Client.forNetwork(Map)` + `setMirrorNetwork(List)`; Java SDK has no local-node preset |
| `go: module ... requires go >= 1.25` *(Go)* | Local Go is older than the SDK's `go.mod` floor | Upgrade Go to v1.25+; on macOS, `brew install go` |
| `TimeoutException` from query or transaction *(all SDKs)* | Consensus node not actually serving (deploy reported a `NodesStarted` timeout even though the pod is `Running`) | Run `solo one-shot single destroy --deployment <name>` then `solo one-shot single deploy`; the second attempt usually succeeds |
| SDK calls fail; `127.0.0.1:35211` shows as not listening *(all SDKs)* | Solo's auto-port-forward for consensus gRPC died after deploy | Restore manually: `kubectl port-forward svc/haproxy-node1-svc -n <your-deployment-name> 35211:50211 &` |
| Upstream SDK example hangs against Solo *(JS, Go)* | Example uses the SDK's local-node preset, hardcoded to ports Solo doesn't expose | Follow [Option A or B in *Make the examples reachable*](#make-the-examples-reachable) |
| `INVALID_SIGNATURE` receipt error | `OPERATOR_KEY` set to public key instead of private key | Re-check your `.env` - use the `privateKey` field value |
| `INSUFFICIENT_TX_FEE` | Operator account has no HBAR | Use a pre-funded `createdAccounts` entry or top up the operator |

---

## Resources

- **Solo operational workflows** - [Solo examples directory](https://github.com/hiero-ledger/solo/tree/main/examples) (node management, state backup/restore, multi-cluster setups, version upgrades, etc.).
- **SDK examples and API references:**
  - JavaScript - [hiero-sdk-js examples](https://github.com/hiero-ledger/hiero-sdk-js/tree/main/examples) · [JSDoc](https://hiero-ledger.github.io/hiero-sdk-js/)
  - Java - [hiero-sdk-java examples](https://github.com/hiero-ledger/hiero-sdk-java/tree/main/examples) · [Javadoc](https://hiero-ledger.github.io/hiero-sdk-java/)
  - Go - [hiero-sdk-go examples](https://github.com/hiero-ledger/hiero-sdk-go/tree/main/examples) · [godoc](https://pkg.go.dev/github.com/hiero-ledger/hiero-sdk-go/v2)
- **EVM workflows** - [Using Solo with EVM Tools](/docs/using-solo/using-solo-with-evm-tools).
- **Solo cluster internals** - [Accessing Solo Services](/docs/using-solo/accessing-solo-services/).
