---
title: "Using Solo with Hiero Java SDK"
weight: 1
description: >
  Walk through submitting your first transaction to a local Solo network
  using the Hiero Java SDK.
categories: ["Integration", "Developer"]
tags: ["developer", "java-sdk", "transactions"]
type: docs
---

## Overview
The [Hiero Java SDK](https://github.com/hiero-ledger/hiero-sdk-java) lets you
build and test applications on the Hiero network using Java. This guide walks
you through launching a local Solo network, locating its bootstrap operator
account, configuring a Gradle project against the SDK, and running example
transactions.

---

## Prerequisites

Before proceeding, ensure you have completed the following:

- [**System Readiness**](/docs/simple-solo-setup/system-readiness):
  - Your local environment meets all hardware and software requirements, including Docker, kubectl, and Solo.

  - You will need the following tools installed:

    | Requirement | Version | Purpose |
    | --- | --- | --- |
    | [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | Runs the Solo cluster containers |
    | [Solo](/docs/simple-solo-setup/system-readiness) | Latest stable | Deploys and manages the local network |
    | [JDK](https://adoptium.net/) | **v21 or higher** (Eclipse Temurin recommended) | Required by `com.hedera.hashgraph:sdk:2.72.0` |
    | [Gradle](https://gradle.org/install/) | v8.5 or later | Builds and runs the Java project |

> **Note:** Solo uses Docker Desktop to spin up local Hiero consensus and mirror nodes.
> Ensure Docker Desktop is running before deploying the local network.

---

## Step 1: Launch a Local Solo Network

Start the network with a single consensus node, mirror node, block node,
JSON-RPC relay, and Hiero Explorer:

```bash
solo one-shot single deploy
```

This command:

- Creates a local Kind Kubernetes cluster.
- Deploys a Hiero consensus node, mirror node, block node, JSON-RPC relay, and the Hiero Explorer.
- Exposes the mirror node REST endpoint, consensus gRPC, and Explorer as local port-forwards (Solo auto-forwards by default; disable with `--no-force-port-forward`).

> **Platform note (Windows / WSL2):** Port-forwards bind inside the WSL2
> distribution by default, so services are reachable from inside WSL2 but not
> from the Windows host. Pass `--external-address 0.0.0.0` to
> `solo one-shot single deploy` (and the same flag to any manual
> `kubectl port-forward` you run later) so bindings are exposed on all
> interfaces. On macOS and Linux the default binding works for local clients.

Once complete, the Hiero Explorer is available at:
[http://localhost:38080/localnet/dashboard](http://localhost:38080/localnet/dashboard) (Solo 0.63+) or
[http://localhost:8080/localnet/dashboard](http://localhost:8080/localnet/dashboard) (Solo 0.62 and earlier).
If the port is in use, Solo picks the next available one - see
[Port availability](/docs/simple-solo-setup/quickstart#port-availability) to find the active assignment.

The rest of this guide refers to your deployment as `<your-deployment-name>`. Retrieve it with [`solo one-shot show deployment`](/docs/simple-solo-setup/quickstart#capture-your-deployment-name) and substitute your actual value into the commands and snippets below.

---

## Step 2: Create a Gradle Project

Unlike the JavaScript SDK, the Hiero Java SDK is consumed as a Maven Central
dependency - you do not need to clone the SDK repository. Create a fresh Gradle
project that pulls the SDK from Maven Central:

- Create the project directory and source layout:

  ```bash
  mkdir -p solo-java-demo/src/main/java
  cd solo-java-demo
  ```

- Create `settings.gradle.kts`:

  ```kotlin
  rootProject.name = "solo-java-demo"
  ```

- Create `build.gradle.kts`:

  ```kotlin
  plugins {
      java
      application
  }

  repositories {
      mavenCentral()
  }

  dependencies {
      implementation("com.hedera.hashgraph:sdk:2.72.0")
      implementation("io.grpc:grpc-netty-shaded:1.64.0")
      implementation("org.slf4j:slf4j-nop:2.0.9")
  }

  java {
      sourceCompatibility = JavaVersion.VERSION_21
      targetCompatibility = JavaVersion.VERSION_21
  }

  application {
      mainClass.set("Main")
  }
  ```

  The three dependencies are:
  - `com.hedera.hashgraph:sdk` - the Hiero Java SDK itself.
  - `io.grpc:grpc-netty-shaded` - the gRPC transport. The upstream quickstart
    recommends `grpc-netty-shaded` for server/desktop applications;
    `grpc-okhttp` is the lighter alternative for Android.
  - `org.slf4j:slf4j-nop` - a no-op SLF4J binding that silences SDK log output.
    Swap to `org.slf4j:slf4j-simple` if you want SDK logs printed to the console.

- Verify the project compiles:

  ```bash
  gradle build
  ```

  A clean `BUILD SUCCESSFUL` (with no source files yet) confirms that Gradle
  resolved the Hiero SDK, gRPC transport, and SLF4J binding from Maven Central
  and that your JDK is the right version.

---

## Step 3: Locate Your Operator Credentials

`solo one-shot single deploy` provisions a bootstrap operator account
(`0.0.2`) at genesis and writes its credentials to disk. Use this account as
your operator - you do **not** need to call `solo ledger account create` for the
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

  The `systemAccounts[0]` block is the operator (`0.0.2`) with an Ed25519 key
  in DER format. The `createdAccounts` array contains additional pre-funded
  ECDSA-alias accounts useful for EVM workflows.

- Save the `accountId` and `privateKey` values from `systemAccounts[0]` - you
  will configure the SDK with them in the next step.

> **EVM tooling note:** For ethers.js, Hardhat, or Foundry, use one of the
> `createdAccounts` entries; their `privateKey` values are already in 0x-prefixed
> hex form. See
> [Using Solo with EVM Tools](/docs/using-solo/using-solo-with-evm-tools) for
> the full EVM-side workflow.

---

## Step 4: Configure the SDK to Connect to Solo

- Create a `.env` file at the project root to hold your operator credentials:

  ```bash
  cat > .env <<EOF
  # Operator account ID (systemAccounts[0].accountId from Step 3)
  OPERATOR_ID=0.0.2

  # Operator private key (systemAccounts[0].privateKey from Step 3)
  OPERATOR_KEY=302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137
  EOF
  ```

  > **Important:** `OPERATOR_KEY` must be set to the `privateKey` value, not the
  > `publicKey`. The private key is the longer DER-encoded string beginning with
  > `302e...`.

  > **Security:** Never commit `.env` to source control - the file holds the
  > operator's private key, which grants full control over the account's HBAR
  > and signing authority. Add `.env` to your repository's `.gitignore` before
  > running the snippet above. The Solo bootstrap operator is throwaway, but the
  > habit matters for accounts on `testnet` or `mainnet`.

- Load the env variables into your shell session:

  ```bash
  set -a; source .env; set +a
  ```

- Configure the client in `src/main/java/Main.java`. Unlike the JavaScript SDK
  (which ships a `LocalProvider` / `Client.forName("local-node")` preset), the
  Hiero Java SDK has no local-node preset - `Client.forName(...)` only accepts
  `"mainnet"`, `"testnet"`, or `"previewnet"` and throws
  `IllegalArgumentException` for anything else. You must build the network map
  explicitly using `Client.forNetwork(Map)` against Solo's auto-forwarded ports
  (`35211` for consensus gRPC, `38081` for the mirror node):

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

  > **Why `throws Exception` on `main`:** `Client.setMirrorNetwork(List<String>)`
  > declares `throws InterruptedException`, and `AccountInfoQuery.execute(...)`
  > throws `TimeoutException` / `PrecheckStatusException`. Declaring
  > `throws Exception` on the entry point keeps the example readable. Wrap with
  > explicit try/catch in production code.

### Verify your configuration

Add an `AccountInfoQuery` for the operator and run it to confirm the client
reaches Solo:

```java
var info = new AccountInfoQuery()
        .setAccountId(AccountId.fromString(operatorId))
        .execute(client);

System.out.println("Account ID : " + info.accountId);
System.out.println("Balance    : " + info.balance);
```

Run it:

```bash
gradle run
```

**Expected output:**

```
Account ID : 0.0.2
Balance    : 49989999499.9946 ℏ
```

The exact balance differs slightly between deployments; what matters is that an
`AccountInfo` returns at all - that proves the gRPC pipe to the consensus node
is alive and the operator credentials are valid.

---

## Step 5: Submit Your First Transaction

### Example 1: Create an Account (`AccountCreateTransaction`)

This example builds an `AccountCreateTransaction` signed by your operator,
waits for consensus, and prints the new account's ID.

Add to `Main.java`:

```java
import com.hedera.hashgraph.sdk.AccountCreateTransaction;
import com.hedera.hashgraph.sdk.Hbar;

PrivateKey newKey = PrivateKey.generateED25519();

var accountResponse = new AccountCreateTransaction()
        .setKeyWithoutAlias(newKey.getPublicKey())
        .setInitialBalance(new Hbar(10))
        .execute(client);

var accountReceipt = accountResponse.getReceipt(client);

System.out.println("private key = " + newKey);
System.out.println("public key  = " + newKey.getPublicKey());
System.out.println("account id  = " + accountReceipt.accountId);
```

**Expected output:**

```
private key = 302e020100300506032b6570042204208a3c1093c4df...
public key  = 302a300506032b6570032100c55adafae7e85608ea89...
account id  = 0.0.1012
```

**What happened:**

1. The SDK built an `AccountCreateTransaction` signed by your operator key.
2. The transaction was submitted to the Solo consensus node over gRPC at `127.0.0.1:35211`.
3. The SDK polled for the transaction receipt until consensus was reached.
4. The receipt confirmed the new account ID.

### Example 2: Create a Topic (`TopicCreateTransaction`)

The Hiero Consensus Service (HCS) lets you create topics and publish messages
to them. Add:

```java
import com.hedera.hashgraph.sdk.TopicCreateTransaction;
import com.hedera.hashgraph.sdk.TopicMessageSubmitTransaction;

var topicResponse = new TopicCreateTransaction().execute(client);
var topicReceipt  = topicResponse.getReceipt(client);
System.out.println("topic id = " + topicReceipt.topicId);

var msgResponse = new TopicMessageSubmitTransaction()
        .setTopicId(topicReceipt.topicId)
        .setMessage("Hello, Solo!")
        .execute(client);
var msgReceipt = msgResponse.getReceipt(client);
System.out.println("topic sequence number = " + msgReceipt.topicSequenceNumber);
```

**Expected output:**

```
topic id = 0.0.1013
topic sequence number = 1
```

**What happened:**

1. The SDK submitted a `TopicCreateTransaction`; the receipt returned a new topic ID.
2. The SDK then submitted a `TopicMessageSubmitTransaction` against that topic.
3. The second receipt's `topicSequenceNumber` confirmed the message reached consensus.

Verify both transactions in the Hiero Explorer:
[http://localhost:38080/localnet/dashboard](http://localhost:38080/localnet/dashboard).

---

## Step 6: Tear Down the Network

When you are finished, remove the local consensus node, mirror node, block node,
relay, explorer, and all data volumes:

```bash
solo one-shot single destroy \
  --deployment <your-deployment-name>
```

---

## Read a Transaction Receipt

Every transaction submitted via the Hiero Java SDK returns a
`TransactionReceipt` after reaching consensus. A receipt includes:

| Field | Description |
| --- | --- |
| `status` | `SUCCESS` if consensus was reached, otherwise a Hedera status code |
| `accountId` | Set when an account was created |
| `topicId` | Set when a topic was created |
| `fileId` | Set when a file was created |
| `topicSequenceNumber` | Sequence number of an HCS message |

The end-to-end pattern in your own Java code:

```java
import com.hedera.hashgraph.sdk.AccountCreateTransaction;
import com.hedera.hashgraph.sdk.AccountId;
import com.hedera.hashgraph.sdk.Client;
import com.hedera.hashgraph.sdk.Hbar;
import com.hedera.hashgraph.sdk.PrivateKey;
import com.hedera.hashgraph.sdk.TransactionReceipt;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

Map<String, AccountId> network = new HashMap<>();
network.put("127.0.0.1:35211", AccountId.fromString("0.0.3"));

Client client = Client.forNetwork(network);
client.setMirrorNetwork(List.of("127.0.0.1:38081"));
client.setOperator(
        AccountId.fromString(System.getenv("OPERATOR_ID")),
        PrivateKey.fromString(System.getenv("OPERATOR_KEY")));

PrivateKey newKey = PrivateKey.generateED25519();
var response = new AccountCreateTransaction()
        .setKeyWithoutAlias(newKey.getPublicKey())
        .setInitialBalance(new Hbar(10))
        .execute(client);

TransactionReceipt receipt = response.getReceipt(client);

System.out.println("Transaction status : " + receipt.status);
System.out.println("New account ID     : " + receipt.accountId);
```

> **Tip:** If `receipt.status` is not `SUCCESS`, calling `getReceipt(client)`
> throws a `ReceiptStatusException` with the failing status. Common causes on
> a fresh Solo network are insufficient HBAR balance or a misconfigured operator
> key.

---

## Optional: Manage Files on the Network

Solo provides CLI commands to create and update files stored on the Hiero File
Service.

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

> **Note:** For files larger than 4 KB, both commands split content into 4 KB
> chunks and display per-chunk progress during the append phase.

---

## Inspect Transactions in Hiero Explorer

While your Solo network is running, open the Hiero Explorer to visually inspect
submitted transactions, accounts, topics, and files:

```url
http://localhost:38080/localnet/dashboard
```

> **Note:** If you are using Solo 0.62 or earlier, the Explorer is at
> `http://localhost:8080/localnet/dashboard`. If the port is in use, Solo picks
> the next available one - see
> [Port availability](/docs/simple-solo-setup/quickstart#port-availability) to
> find the active assignment.

You can search by account ID, transaction ID, or topic ID to confirm that your
transactions reached consensus and view their receipts.

---

## Retrieving Logs

Solo writes logs to `~/.solo/logs/`:

| Log File | Contents |
| --- | --- |
| `solo.log` | Human-readable Solo CLI output and lifecycle events |
| `solo.ndjson` | Newline-delimited JSON of the same events (authoritative, machine-readable) |

The Solo log is useful for debugging connectivity issues between the SDK and
your local Solo network.

The Hiero Java SDK uses [SLF4J](https://www.slf4j.org/) for logging. This guide
includes `org.slf4j:slf4j-nop:2.0.9` as the SLF4J binding, which silences all
SDK log output. To enable console logging, swap the dependency for
`org.slf4j:slf4j-simple:2.0.9` in your `build.gradle.kts`. For file output or
custom log levels, use a richer binding such as Logback or Log4j 2 and follow
the SLF4J configuration docs.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `Dependency resolution is looking for a library compatible with JVM runtime version 17, but 'com.hedera.hashgraph:sdk:2.72.0' is only compatible with JVM runtime version 21 or newer` | JDK 17 target in `build.gradle.kts` | Set `sourceCompatibility = JavaVersion.VERSION_21` and ensure the JDK on `PATH` is v21+ |
| `IllegalArgumentException: Name must be one-of 'mainnet', 'testnet', or 'previewnet'` | Called `Client.forName("local-node")` | Use `Client.forNetwork(Map)` + `setMirrorNetwork(List)` as shown in [Step 4](#step-4-configure-the-sdk-to-connect-to-solo); the Java SDK has no local-node preset |
| `TimeoutException` from a query or transaction `.execute()` | Consensus node not actually serving (deploy reported a `NodesStarted` timeout even though the pod is `Running`) | Run `solo one-shot single destroy --deployment <name>` then `solo one-shot single deploy`; the second attempt usually succeeds |
| SDK calls fail; `127.0.0.1:35211` shows as not listening | Solo's auto-port-forward for consensus gRPC died after deploy | Restore manually: `kubectl port-forward svc/haproxy-node1-svc -n <your-deployment-name> 35211:50211 &` |
| Compile error: `unreported exception InterruptedException` from `setMirrorNetwork` | `Client.setMirrorNetwork(List)` declares `throws InterruptedException` | Declare `throws Exception` on `main` (or wrap in try/catch) |
| `ReceiptStatusException: receipt for transaction ... contained error status` | Receipt status is not `SUCCESS` (insufficient fee, invalid signature, etc.) | Check `receipt.status` and re-verify operator credentials + balance |

---

## Resources

- **Solo operational workflows.** The [Solo `examples/` directory](https://github.com/hiero-ledger/solo/tree/v0.73.0/examples) ships task-driven workflows for node add/delete/update, state backup/restore, multi-cluster setups, version upgrades, and more. The accompanying SDK programs are written in JavaScript, but the Solo CLI sequences themselves are language-agnostic - port the SDK transactions to Java equivalents to follow these workflows from Java.

---
