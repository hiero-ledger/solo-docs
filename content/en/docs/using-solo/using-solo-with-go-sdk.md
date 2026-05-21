---
title: "Using Solo with Hiero Go SDK"
weight: 1
description: >
  Walk through submitting your first transaction to a local Solo network
  using the Hiero Go SDK.
categories: ["Integration", "Developer"]
tags: ["developer", "go-sdk", "transactions"]
type: docs
---

## Overview
The [Hiero Go SDK](https://github.com/hiero-ledger/hiero-sdk-go) lets you build
and test applications on the Hiero network using Go. This guide walks you
through launching a local Solo network, locating its bootstrap operator
account, configuring a Go module against the SDK, and running example
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
    | [Go](https://go.dev/dl/) | **v1.25 or higher** | Required by the Hiero Go SDK |

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

## Step 2: Create a Go Module

The Hiero Go SDK is consumed as a standard Go module. Create a fresh project
that pulls the SDK from `pkg.go.dev`:

- Create the project directory and initialize the module:

  ```bash
  mkdir solo-go-demo && cd solo-go-demo
  go mod init solo-go-demo
  ```

- Add the Hiero Go SDK pinned to the latest stable version:

  ```bash
  go get github.com/hiero-ledger/hiero-sdk-go/v2@v2.80.0
  ```

  `go get` resolves the SDK plus its transitive dependencies (gRPC, protobuf,
  zerolog, and a few cryptography helpers). Your `go.mod` will pin the SDK and
  set `go 1.25.7` (the floor declared in the SDK's own `go.mod`).

- Verify the project builds:

  ```bash
  go build ./...
  ```

  An empty success output (with no source files yet) confirms that Go resolved
  the SDK from the module proxy and that your Go toolchain is the right
  version.

---

## Step 3: Locate Your Operator Credentials

`solo one-shot single deploy` provisions a bootstrap operator account
(`0.0.2`) at genesis and writes its credentials to disk. Use this account as
your operator - you do **not** need to call `solo ledger account create` for
the examples in this guide.

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

The Hiero Go SDK reads operator credentials and the target network from
environment variables. Configure them, then build the client in your Go code.

- Create a `.env` file at the project root:

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
  ```

  > **Important:** `OPERATOR_KEY` must be the `privateKey` value, not the
  > `publicKey`. The private key is the longer DER-encoded string beginning
  > with `302e...`.

  > **Security:** Never commit `.env` to source control - the file holds the
  > operator's private key, which grants full control over the account's HBAR
  > and signing authority. Add `.env` to your repository's `.gitignore` before
  > running the snippet above. The Solo bootstrap operator is throwaway, but
  > the habit matters for accounts on `testnet` or `mainnet`.

- Load the env variables into your shell session:

  ```bash
  source .env
  ```

- Configure the client in `main.go`. The Hiero Go SDK ships a `ClientForName`
  preset that recognizes `"local"` and `"localhost"`, but the preset is
  **hardcoded to `127.0.0.1:50211` (consensus gRPC) and `127.0.0.1:5600`
  (mirror gRPC)** - ports that Solo does not expose by default (Solo's
  auto-port-forwards use `35211` and `38081`). The simplest path that works
  out of the box is to build the network map explicitly with
  `ClientForNetworkV2`:

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

      // Build the network map against Solo's auto-forwarded ports.
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

  > **Note on the network map value:** The map's value is a struct literal
  > `hiero.AccountID{Account: 3}` (matches the `network-node1` account ID
  > `0.0.3` on a single-node Solo). This is shorter than calling
  > `hiero.AccountIDFromString("0.0.3")` and is the form upstream examples use.

### Verify your configuration

Add an `AccountInfoQuery` for the operator and run it to confirm the client
reaches Solo:

```go
info, err := hiero.NewAccountInfoQuery().
    SetAccountID(opAccID).
    Execute(client)
if err != nil {
    panic(err)
}

fmt.Printf("Account ID : %s\n", info.AccountID)
fmt.Printf("Balance    : %s\n", info.Balance)
fmt.Printf("Public key : %s\n", info.Key)
```

Run it:

```bash
go run .
```

**Expected output:**

```
Account ID : 0.0.2
Balance    : 4.99899994792001e+10 ℏ
Public key : 302a300506032b65700321000aa8e21064c61eab86e2a9c164565b4e7a9a4146106e0a6cd03a8c395a110e92
```

The exact balance differs slightly between deployments; what matters is that
an `AccountInfo` returns at all - that proves the gRPC pipe to the consensus
node is alive and the operator credentials are valid. The Hbar value is
printed in scientific notation by default; to render it as decimal HBAR or
tinybars, use `info.Balance.As(hiero.HbarUnits.Hbar)` or
`info.Balance.AsTinybar()`.

---

## Step 5: Submit Your First Transaction

> **Heads up:** The SDK examples shipped in `hiero-sdk-go/examples/` construct
> their client via `hiero.ClientForName(os.Getenv("HEDERA_NETWORK"))`. With
> `HEDERA_NETWORK="localhost"` the resulting client is hardcoded to
> `127.0.0.1:50211` (consensus gRPC) and `127.0.0.1:5600` (mirror gRPC).
> Solo doesn't expose those ports by default, so the upstream examples need
> one of the two setups in [Make the examples reachable](#make-the-examples-reachable)
> before they will connect.

### Make the examples reachable

Pick one:

**Option A - forward Solo's services to the SDK's legacy ports** (run upstream examples with `HEDERA_NETWORK="localhost"` unchanged):

```bash
kubectl port-forward svc/haproxy-node1-svc -n <your-deployment-name> 50211:50211 &
kubectl port-forward svc/mirror-grpc       -n <your-deployment-name> 5600:5600 &
```

The kubectl namespace matches `<your-deployment-name>` for default one-shot deploys; pass `--namespace` to `solo one-shot single deploy` to override.

**Option B - use `ClientForNetworkV2` directly** (the pattern shown in [Step 4](#step-4-configure-the-sdk-to-connect-to-solo)). No port-forwarding needed; the snippets below assume this path.

### Example 1: Create an Account (`AccountCreateTransaction`)

This example builds an `AccountCreateTransaction` signed by your operator,
waits for consensus, and prints the new account's ID.

Add to `main.go`:

```go
newKey, err := hiero.GeneratePrivateKey()
if err != nil {
    panic(err)
}

txResponse, err := hiero.NewAccountCreateTransaction().
    SetKeyWithoutAlias(newKey.PublicKey()).
    SetInitialBalance(hiero.NewHbar(10)).
    Execute(client)
if err != nil {
    panic(err)
}

receipt, err := txResponse.GetReceipt(client)
if err != nil {
    panic(err)
}

fmt.Printf("private key = %s\n", newKey)
fmt.Printf("public key  = %s\n", newKey.PublicKey())
fmt.Printf("account id  = %s\n", *receipt.AccountID)
```

**Expected output:**

```
private key = 302e020100300506032b6570042204202b311af4a7cf1d34c947133147229e7d2349466c6e24ed9094954173b4797546
public key  = 302a300506032b6570032100de9f4fb5b3348a4b0059ffb18110829ea12fa6415dca0b53edc82a59da783ef8
account id  = 0.0.1014
```

**What happened:**

1. The SDK generated a new Ed25519 key with `GeneratePrivateKey`.
2. The SDK built an `AccountCreateTransaction` signed by your operator key.
3. The transaction was submitted to the Solo consensus node over gRPC at `127.0.0.1:35211`.
4. `GetReceipt(client)` blocked until consensus and returned the new account ID.

### Example 2: Create a Topic (`TopicCreateTransaction`)

The Hiero Consensus Service (HCS) lets you create topics and publish messages
to them. Add:

```go
topicResponse, err := hiero.NewTopicCreateTransaction().Execute(client)
if err != nil {
    panic(err)
}
topicReceipt, err := topicResponse.GetReceipt(client)
if err != nil {
    panic(err)
}
fmt.Printf("topic id = %s\n", *topicReceipt.TopicID)

msgResponse, err := hiero.NewTopicMessageSubmitTransaction().
    SetTopicID(*topicReceipt.TopicID).
    SetMessage([]byte("Hello, Solo!")).
    Execute(client)
if err != nil {
    panic(err)
}
msgReceipt, err := msgResponse.GetReceipt(client)
if err != nil {
    panic(err)
}
fmt.Printf("topic sequence number = %d\n", msgReceipt.TopicSequenceNumber)
```

**Expected output:**

```
topic id = 0.0.1015
topic sequence number = 1
```

**What happened:**

1. The SDK submitted a `TopicCreateTransaction`; the receipt returned a new topic ID.
2. The SDK then submitted a `TopicMessageSubmitTransaction` against that topic.
3. The second receipt's `TopicSequenceNumber` confirmed the message reached consensus.

Verify both transactions in the Hiero Explorer:
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

## Read a Transaction Receipt

Every transaction submitted via the Hiero Go SDK returns a
`TransactionResponse`; calling `GetReceipt(client)` on it blocks until
consensus and returns a `TransactionReceipt`. The receipt struct exposes:

| Field | Type | Description |
| --- | --- | --- |
| `Status` | `Status` | `StatusSuccess` if consensus was reached, otherwise a Hedera status code |
| `AccountID` | `*AccountID` | Set when an account was created |
| `TopicID` | `*TopicID` | Set when a topic was created |
| `FileID` | `*FileID` | Set when a file was created |
| `TopicSequenceNumber` | `uint64` | Sequence number of an HCS message |
| `TopicRunningHash` | `[]byte` | Running hash of the topic after this message |

The end-to-end pattern in your own Go code:

```go
package main

import (
    "fmt"
    "os"

    hiero "github.com/hiero-ledger/hiero-sdk-go/v2/sdk"
)

func main() {
    network := map[string]hiero.AccountID{
        "127.0.0.1:35211": {Account: 3},
    }
    client, err := hiero.ClientForNetworkV2(network)
    if err != nil {
        panic(err)
    }
    defer client.Close()

    client.SetMirrorNetwork([]string{"127.0.0.1:38081"})

    opAccID, err := hiero.AccountIDFromString(os.Getenv("OPERATOR_ID"))
    if err != nil {
        panic(err)
    }
    opKey, err := hiero.PrivateKeyFromString(os.Getenv("OPERATOR_KEY"))
    if err != nil {
        panic(err)
    }
    client.SetOperator(opAccID, opKey)

    newKey, err := hiero.GeneratePrivateKey()
    if err != nil {
        panic(err)
    }
    resp, err := hiero.NewAccountCreateTransaction().
        SetKeyWithoutAlias(newKey.PublicKey()).
        SetInitialBalance(hiero.NewHbar(10)).
        Execute(client)
    if err != nil {
        panic(err)
    }

    receipt, err := resp.GetReceipt(client)
    if err != nil {
        // If status was not SUCCESS, err is non-nil and wraps the failing status.
        // Inspect it directly to react to specific Hedera status codes.
        fmt.Fprintf(os.Stderr, "receipt error: %v\n", err)
        os.Exit(1)
    }

    fmt.Printf("Transaction status : %s\n", receipt.Status)
    fmt.Printf("New account ID     : %s\n", *receipt.AccountID)
}
```

> **Tip:** If the network rejects the transaction or the receipt's status is
> not `StatusSuccess`, `GetReceipt(client)` returns a non-nil error wrapping
> the status code. Common causes on a fresh Solo network are insufficient HBAR
> balance or a misconfigured operator key.

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

While your Solo network is running, open the Hiero Explorer to visually
inspect submitted transactions, accounts, topics, and files:

```url
http://localhost:38080/localnet/dashboard
```

> **Note:** If you are using Solo 0.62 or earlier, the Explorer is at
> `http://localhost:8080/localnet/dashboard`. If the port is in use, Solo
> picks the next available one - see
> [Port availability](/docs/simple-solo-setup/quickstart#port-availability) to
> find the active assignment.

You can search by account ID, transaction ID, or topic ID to confirm that
your transactions reached consensus and view their receipts.

---

## Retrieving Logs

Solo writes logs to `~/.solo/logs/`:

| Log File | Contents |
| --- | --- |
| `solo.log` | Human-readable Solo CLI output and lifecycle events |
| `solo.ndjson` | Newline-delimited JSON of the same events (authoritative, machine-readable) |

The Solo log is useful for debugging connectivity issues between the SDK and
your local Solo network.

The Hiero Go SDK uses [zerolog](https://github.com/rs/zerolog) for structured
logging internally. By default the SDK does not write logs anywhere visible.
To enable SDK logs, configure zerolog at the start of your program - for
example, `log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})`
prints human-readable logs to stderr.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `go: module github.com/hiero-ledger/hiero-sdk-go/v2 ... requires go >= 1.25` | Local Go is older than the SDK's `go.mod` floor | Upgrade Go to v1.25 or newer; on macOS, `brew install go` |
| Timeout from `Execute(client)` or `GetReceipt(client)` | Consensus node not actually serving (deploy reported a `NodesStarted` timeout even though the pod is `Running`) | Run `solo one-shot single destroy --deployment <name>` then `solo one-shot single deploy`; the second attempt usually succeeds |
| SDK calls fail; `127.0.0.1:35211` shows as not listening | Solo's auto-port-forward for consensus gRPC died after deploy | Restore manually: `kubectl port-forward svc/haproxy-node1-svc -n <your-deployment-name> 35211:50211 &` |
| `error converting string to PrivateKey` from `PrivateKeyFromString` | Pasted the `publicKey` value into `OPERATOR_KEY`, or copied a truncated string | Use the `privateKey` field from `accounts.json` - the longer DER-encoded value beginning with `302e...` |
| Upstream `hiero-sdk-go` example hangs against Solo | Example uses `ClientForName("localhost")` which is hardcoded to `:50211` + `:5600`; Solo does not expose those ports by default | Use [Option A or B in *Make the examples reachable*](#make-the-examples-reachable) |
| Receipt error wrapping a Hedera status code | Receipt status is not `StatusSuccess` (insufficient fee, invalid signature, etc.) | Inspect the returned error and re-verify operator credentials + balance |

---

## Resources

- **Hiero Go SDK examples.** The [`examples/` directory in `hiero-sdk-go`](https://github.com/hiero-ledger/hiero-sdk-go/tree/v2.80.0/examples) ships around 50 standalone Go programs - account creation, smart contract deployment, HCS pub-sub, batch transactions, scheduled transactions, and more. Each is a runnable `main.go` you can drop into a fresh module.
- **Solo operational workflows.** The [Solo `examples/` directory](https://github.com/hiero-ledger/solo/tree/v0.73.0/examples) ships task-driven workflows for node add/delete/update, state backup/restore, multi-cluster setups, version upgrades, and more. The accompanying SDK programs are written in JavaScript, but the Solo CLI sequences themselves are language-agnostic — port the SDK transactions to Go equivalents to follow these workflows from Go.
