---
title: "Using Solo with Hiero JavaScript SDK"
weight: 1
description: >
  Walk through submitting your first transaction to a local Solo network
  using the Hiero JavaScript SDK.
type: docs
---

## Overview
The [Hiero JavaScript SDK](https://github.com/hiero-ledger/hiero-sdk-js) lets
you build and test applications on the Hiero network using JavaScript or
TypeScript. This guide walks you through launching a local Solo network,
creating a funded test account, connecting the SDK, and running example scripts
to submit your first transaction.

---

## Prerequisites

Before proceeding, ensure you have completed the following:

- [**System Readiness**](/docs/simple-solo-setup/system-readiness):
  - Your local environment meets all hardware and software requirements, including Docker, kubectl, and Solo.

  - You will need the following tools installed:

    | Requirement | Version | Purpose |
    | --- | --- | --- |
    | [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | Runs the Solo cluster containers |
    | [Solo](/onboarding/system-readiness) | Latest | Deploys and manages the local network |
    | [Node.js](https://nodejs.org/) | v18 or higher | Runs the SDK examples |
    | [Taskfile](https://taskfile.dev/installation/) | Latest | Runs convenience scripts in the Solo repo |

> **Note:** Solo uses Docker Desktop to spin up local Hiero consensus and mirror nodes.
> Ensure Docker Desktop is running before executing any `task` commands.

---

## Step 1: Launch a Local Solo Network

Clone the Solo repository and navigate into the `scripts` directory, then start the
network with the mirror node and Hiero Explorer:

```bash
# Clone Solo repo
git clone https://github.com/hiero-ledger/solo.git
cd solo
```

```bash
# Launch a local Solo network with mirror node and Hiero Explorer
cd scripts
task default-with-mirror
```

This command starts:

- Creates a local Kind Kubernetes cluster.
- Deploys a local Hiero consensus node.
- A mirror node for transaction history queries , and Hiero Explorer.

Once complete, the Hiero Explorer is available at:
[http://localhost:8080/localnet/dashboard](http://localhost:8080/localnet/dashboard).

---

## Step 2: Install the Hiero JavaScript SDK

- Clone the Hiero JavaScript SDK repository and install its dependencies:

  ```bash
  git clone https://github.com/hiero-ledger/hiero-sdk-js.git
  cd hiero-sdk-js
  npm install
  ```

- The SDK provides classes for building and submitting transactions (e.g.,
`AccountCreateTransaction`, `TopicCreateTransaction`) and for reading receipts
and query responses from the network.

---

## Step 3: Create a Test Account

- With your Solo network running, create a funded operator account with 100 HBAR that your scripts will use to sign and pay for transactions.

- From the `solo` repository root, run:

  ```bash
  npm run solo-test -- ledger account create \
    --deployment solo-deployment \
    --hbar-amount 100
  ```

- **Example output:**

  ```bash
  *** new account created ***
  -------------------------------------------------------------------------------
  {
  "accountId": "0.0.1007",
  "publicKey": "302a300506032b65700321001d8978e647aca1195c54a4d3d5dc469b95666de14e9b6edde8ed337917b96013",
  "balance": 100
  }
  ```

Note the `accountId` value (`0.0.1007` in this example). You will use it in the
next step.

### Retrieve the Private Key

- To sign transactions you need the account's **private key**. Retrieve it with:

  ```bash
  npm run solo-test -- ledger account info \
  --account-id 0.0.1007 \
  --deployment solo-deployment \
  --private-key
  ```

- **Expected output:**

  ```json
  {
    "accountId": "0.0.1007",
    "privateKey": "302e020100300506032b657004220420411a561013bceabb8cb83e3dc5558d052b9bd6a8977b5a7348bf9653034a29d7",
    "privateKeyRaw": "411a561013bceabb8cb83e3dc5558d052b9bd6a8977b5a7348bf9653034a29d7",
    "publicKey": "302a300506032b65700321001d8978e647aca1195c54a4d3d5dc469b95666de14e9b6edde8ed337917b96013",
    "balance": 100
  }
  ```

- Save the `accountId` and `privateKey` values - you will configure the SDK with them
in the next step.

---

## Step 4: Configure the SDK to Connect to Solo

- The Hiero JavaScript SDK uses environment variables to locate the network and
authenticate the operator account. Create a `.env` file at the root of the
`hiero-sdk-js` directory:

  ```bash
  # Navigate to the SDK root
  cd hiero-sdk-js

  # Create the environment file
  cat > .env <<EOF

  # Operator account ID (accountId from Step 3)
  export OPERATOR_ID="0.0.1007"

  # Operator private key (not publicKey) from Step 3
  export OPERATOR_KEY="302e020100300506032b657004220420411a561013bceabb8cb83e3dc5558d052b9bd6a8977b5a7348bf9653034a29d7"

  # Target the local Solo network
  export HEDERA_NETWORK="local-node"
  EOF

  # Load the variables into your current shell session
  source .env
  ```

  > **Important:** `OPERATOR_KEY` must be set to the `privateKey` value, not the
  > `publicKey`. The private key is the longer DER-encoded string beginning with
  > `302e...`.

- When `HEDERA_NETWORK` is set to `"local-node"`, the SDK automatically connects to
the Solo consensus node at `localhost:50211` and the mirror node REST API at
`localhost:5551`.

---

## Step 5: Submit Your First Transaction

### Example 1: Create an Account (AccountCreateTransaction)

- This example uses `AccountCreateTransaction` to create a new account on your local
Solo network, waits for consensus, and prints the resulting receipt.

  ```bash
  node examples/create-account.js
  ```

- **Expected output:**

  ```bash
  private key = 302e020100300506032b6570042204208a3c1093c4df779c4aa980d20731899e0b509c7a55733beac41857a9dd3f1193
  public key = 302a300506032b6570032100c55adafae7e85608ea893d0e2c77e2dae3df90ba8ee7af2f16a023ba2258c143
  account id = 0.0.1009
  ```

**What happened:**

1. The SDK built an `AccountCreateTransaction` signed by your operator key.
2. The transaction was submitted to the Solo consensus node.
3. The SDK polled for the transaction receipt until consensus was reached.
4. The receipt confirmed the new account ID (`0.0.1009`).

### Example 2: Create a Topic (TopicCreateTransaction)

- The Hiero Consensus Service (HCS) lets you create topics and publish messages to
them. Run the topic creation example:

  ```bash
  node examples/create-topic.js
  ```

- **Expected output:**

  ```bash
  topic id = 0.0.1008
  topic sequence number = 1
  ```

**What happened:**

1. The SDK submitted a `TopicCreateTransaction`.
2. After consensus, the receipt returned a new topic ID (`0.0.1008`).
3. A test message was published and its sequence number confirmed.

Verify both transactions in the Hiero Explorer:
[http://localhost:8080/localnet/dashboard](http://localhost:8080/localnet/dashboard).

---

## Step 6: Tear Down the Network

When you are finished, stop and remove all Solo containers:

```bash
# Run from the solo/scripts directory
cd solo/scripts
task clean
```

This removes the local consensus node, mirror node, and all associated data volumes.

---

## Read a Transaction Receipt

- Every transaction submitted via the Hiero JavaScript SDK returns a `TransactionReceipt`
after reaching consensus. A receipt includes:

  | Field | Description |
  | --- | --- |
  | `status` | `SUCCESS` if consensus was reached, otherwise an error code |
  | `accountId` | Set when an account was created |
  | `topicId` | Set when a topic was created |
  | `fileId` | Set when a file was created |
  | `topicSequenceNumber` | Sequence number of an HCS message |

- In your own `TypeScript/JavaScript` code, the pattern looks like this:

  ```typescript
  import {
    Client,
    AccountCreateTransaction,
    PrivateKey,
    Hbar,
  } from "@hashgraph/sdk";

  // Configure the client to connect to the local Solo network
  const client = Client.forLocalNode();
  client.setOperator(
    process.env.OPERATOR_ID!,
    process.env.OPERATOR_KEY!
  );

  // Build and submit the transaction
  const newKey = PrivateKey.generateED25519();
  const response = await new AccountCreateTransaction()
    .setKey(newKey.publicKey)
    .setInitialBalance(new Hbar(10))
    .execute(client);

  // Wait for consensus and read the receipt
  const receipt = await response.getReceipt(client);

  console.log(`Transaction status : ${receipt.status}`);
  console.log(`New account ID     : ${receipt.accountId}`);
  ```

  > **Tip:** If `receipt.status` is not `SUCCESS`, the SDK throws a
  > `ReceiptStatusError` with the error code. Common causes on a fresh Solo network
  > are insufficient HBAR balance or a misconfigured operator key.

---

## Optional: Manage Files on the Network

Solo provides CLI commands to create and update files stored on the Hiero File
Service.

### Create a New File

```bash
npm run solo-test -- ledger file create \
  --deployment solo-deployment \
  --file-path ./config.json
```

  This command:

- Creates a new file on the network and returns a system-assigned file ID.
- Automatically splits files larger than 4 KB into chunks using `FileAppendTransaction`.
- Verifies that the uploaded content matches the local file.

**Example output:**

  ```bash
  ✓ Initialize configuration
    File: config.json
    Size: 2048 bytes

  ✓ Load node client and treasury keys

  ✓ Create file on Hiero network
    ✓ Create new file
      Creating file with 2048 bytes...
      ✓ File created with ID: 0.0.1234

  ✓ Verify uploaded file
    Querying file contents to verify upload...
    Expected size: 2048 bytes
    Retrieved size: 2048 bytes
    ✓ File verification successful
    ✓ Size: 2048 bytes
    ✓ Content matches uploaded file

  ✅ File created successfully!
  📄 File ID: 0.0.1234
  ```

### Update an existing file

  ```bash
  npm run solo-test -- ledger file update \
    --deployment solo-deployment \
    --file-id 0.0.1234 \
    --file-path ./updated-config.json
  ```

  This command:

- Verifies the file exists on the network (errors if not found).
- Replaces the file content and re-verifies the upload.
- Automatically handles chunking for large files (>4 KB).

**Example output:**

  ```bash
  ✓ Initialize configuration
    File: updated-config.json
    Size: 3072 bytes
    File ID: 0.0.1234

  ✓ Load node client and treasury keys

  ✓ Check if file exists
    File 0.0.1234 exists. Proceeding with update.
    Current size: 2048 bytes
    Keys: 1

  ✓ Update file on Hiero network
    ✓ Update existing file
      Updating file with 3072 bytes...
      ✓ File updated successfully

  ✓ Verify uploaded file
    Querying file contents to verify upload...
    Expected size: 3072 bytes
    Retrieved size: 3072 bytes
    ✓ File verification successful
    ✓ Size: 3072 bytes
    ✓ Content matches uploaded file

  ✅ File updated successfully!
  ```

> **Note:** For files larger than 4 KB, both commands split content into 4 KB
> chunks and display per-chunk progress during the append phase.

  ```bash
  ✓ Create file on Hiero network
    ✓ Create new file
      Creating file with first 4096 bytes (multi-part create)...
      ✓ File created with ID: 0.0.1234
    ✓ Append remaining file content (chunk 1/3)
      Appending chunk 1/3 (4096 bytes, 8192 bytes remaining)...
    ✓ Append remaining file content (chunk 2/3)
      Appending chunk 2/3 (4096 bytes, 4096 bytes remaining)...
    ✓ Append remaining file content (chunk 3/3)
      Appending chunk 3/3 (4096 bytes, 0 bytes remaining)...
    ✓ Append remaining file content (3 chunks completed)
      ✓ Appended 3 chunks successfully
  ```

---

## Inspect Transactions in Hiero Explorer

While your Solo network is running, open the Hiero Explorer to visually inspect
submitted transactions, accounts, topics, and files:

```url
http://localhost:8080/localnet/dashboard
```

You can search by account ID, transaction ID, or topic ID to confirm that your
transactions reached consensus and view their receipts.

---

## Retrieving Logs

Solo writes logs to `~/.solo/logs/`:

| Log File | Contents |
| --- | --- |
| `solo.log` | All Solo CLI command output and lifecycle events |
| `hashgraph-sdk.log` | SDK-level transaction submissions and responses sent to network nodes |

These logs are useful for debugging failed transactions or connectivity issues between
the SDK and your local Solo network.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `INVALID_SIGNATURE` receipt error | `OPERATOR_KEY` set to public key instead of private key | Re-check your `.env` - use the `privateKey` field value |
| `INSUFFICIENT_TX_FEE` | Operator account has no HBAR | Re-create the account with `--hbar-amount 100` |
| SDK cannot connect | Solo network not running or Docker not started | Run `task default-with-mirror` and wait for full startup |
| `HEDERA_NETWORK` not recognized | `.env` not sourced | Run `source .env` before executing example scripts |

---
