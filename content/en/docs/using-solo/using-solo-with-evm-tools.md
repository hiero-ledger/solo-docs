---
title: "Using Solo with EVM Tools"
weight: 2
description: >
  Point your existing Ethereum tooling (Hardhat, ethers.js, and MetaMask) at a local Hiero network via the  Hiero JSON-RPC relay. This document covers enabling the relay, creating and configuring a Hardhat project, deploying a Solidity contract, and configuring wallets.
categories: ["Integration", "Developer"]
tags: ["developer", "evm", "hardhat", "solidity", "json-rpc", "smart-contracts"]
type: docs
---

## Overview

Hiero is EVM-compatible. The  Hiero **JSON-RPC relay** exposes a standard Ethereum
JSON-RPC interface on your local Solo network, letting you use familiar EVM tools
without modification.

This guide walks you through:

- Launching a Solo network with the JSON-RPC relay enabled.
- Retrieving ECDSA accounts for EVM tooling.
- Creating and configuring a Hardhat project against the relay.
- Deploying and interacting with a Solidity contract.
- Verifying transactions via the Explorer and Mirror Node.
- Configuring ethers.js and MetaMask.

## Prerequisites

Before proceeding, ensure you have completed the following:

- [**System Readiness**](/docs/simple-solo-setup/system-readiness/) - your local
  environment meets all hardware and software requirements, including Docker
  and Solo.
- [**Quickstart**](/docs/simple-solo-setup/quickstart/) - you are comfortable
  running Solo deployments.

You will also need:

- [Git](https://git-scm.com/) - to clone the optional pre-built example.
- [Taskfile](https://taskfile.dev/installation/) - only required if using the
  [automated example](#reference-running-the-full-example-automatically).

---

## Step 1: Launch a Solo Network with the JSON-RPC Relay

The easiest way to start a Solo network with the relay pre-configured is via
`one-shot single deploy`, which provisions the consensus node, mirror node,
Hiero Mirror Node Explorer, and the Hiero JSON-RPC relay in a single step:

```bash
npx @hiero-ledger/solo one-shot single deploy
```

This command:

- Creates a local Kind Kubernetes cluster.
- Deploys a Hiero consensus node, mirror node, and Hiero Mirror Node Explorer.
- Deploys the Hiero **JSON-RPC relay** and exposes it at `http://localhost:37546` (Solo 0.63+).
- Generates three groups of pre-funded accounts, including ECDSA (EVM-compatible) accounts.

> **Relay endpoint summary (Solo 0.63 and later):**
>
> | Property | Value |
> | --- | --- |
> | RPC URL | `http://localhost:37546` |
> | Chain ID | `298` |
> | Currency symbol | `HBAR` |
>
> If you are using Solo 0.62 or earlier, the relay is at `http://localhost:7546`.

### Adding the Relay to an Existing Deployment

If you already have a running Solo network without the relay, see [**Step 10: Deploy JSON-RPC Relay**](/docs/advanced-solo-setup/network-deployments/manual-deployment/#10-deploy-json-rpc-relay) in the Step-by-Step Manual Deployment guide for full instructions, then return here once your relay is running on `http://localhost:37546` (Solo 0.63+) or `http://localhost:7546` (Solo 0.62 and earlier).

To remove the relay when you no longer need it, see [**Cleanup Step 1: Destroy JSON-RPC Relay**](/docs/advanced-solo-setup/network-deployments/manual-deployment/#1-destroy-json-rpc-relay) in the same guide.

---

## Step 2: Retrieve Your ECDSA Account and Private Key

`one-shot single deploy` creates ECDSA alias accounts, which are required for EVM tooling such as Hardhat, ethers.js, and MetaMask.
These accounts and their private keys are saved to a cache directory on completion.

> Note: ED25519 accounts are not compatible with Hardhat, ethers.js, or MetaMask when used via the JSON-RPC interface.
> Always use the ECDSA keys from accounts.json for EVM tooling.

- To find your deployment name, run:

  ```bash
  cat ~/.solo/cache/last-one-shot-deployment.txt
  ```

- Then open the accounts file at:

  ```bash
  ~/.solo/cache/one-shot-<deployment-name>/accounts.json
  ```

- Open that file to retrieve your ECDSA keys and EVM address. Each account entry contains:
  - An **ECDSA private key** - 64 hex characters with a `0x` prefix (e.g. `0x105d0050...`).
  - An **ECDSA public key** - the corresponding public key.
  - An **EVM address** - derived from the public key (e.g. `0x70d379d473e2005bb054f50a1d9322f45acb215a`). In Hiero terminology, this means the account has an EVM address aliased from its ECDSA public key.
  
  ```bash
  0x105d0050185ccb907fba04dd92d8de9e32c18305e097ab41dadda21489a211524
  0x2e1d968b041d84dd120a5860cee60cd83f9374ef527ca86996317ada3d0d03e7
  ...
  ```

- Export the private key for one account as an environment variable - **never
hardcode private keys in source files**:

  ```bash
  export SOLO_EVM_PRIVATE_KEY="0x105d0050185ccb907fba04dd92d8de9e32c18305e097ab41dadda21489a211524"
  ```

---

## Step 3: Create and Configure a Hardhat Project

### Option A: Use the Pre-Built Solo Example (Recommended for First Time)

A ready-to-run Hardhat project is provided in the Solo repository. Skip to
[Step 4](#step-4-deploy-and-interact-with-a-solidity-contract) after cloning:

```bash
git clone https://github.com/hiero-ledger/solo.git
cd solo/examples/hardhat-with-solo/hardhat-example
npm install
```

### Option B: Create a New Hardhat Project from Scratch

If you want to integrate Solo into your own project:

```bash
mkdir solo-hardhat && cd solo-hardhat
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

When prompted, choose **TypeScript project** or **JavaScript project** based on
your preference.

Install dependencies:

```bash
npm install
```

### Configure Hardhat to Connect to the Solo Relay

Create or update `hardhat.config.ts` to point at the Solo JSON-RPC relay.
The `chainId` of `298` is required - Hardhat will reject transactions if it
does not match the network:

```typescript
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    solo: {
      url: "http://127.0.0.1:37546",
      chainId: 298,
      // Load from environment — never commit private keys to source control
      accounts: process.env.SOLO_EVM_PRIVATE_KEY
        ? [process.env.SOLO_EVM_PRIVATE_KEY]
        : [],
    },
  },
};

export default config;
```

> **Important:** `chainId: 298` must be set explicitly. Without it, Hardhat's
> network validation will fail when connecting to the Solo relay.

---

## Step 4: Deploy and Interact with a Solidity Contract

### The Sample Contract

If using the pre-built Solo example, `contracts/SimpleStorage.sol` is included.
For a new project, create `contracts/SimpleStorage.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 private value;

    event ValueChanged(
        uint256 indexed oldValue,
        uint256 indexed newValue,
        address indexed changer
    );

    constructor(uint256 initial) {
        value = initial;
    }

    function get() external view returns (uint256) {
        return value;
    }

    function set(uint256 newValue) external {
        uint256 old = value;
        value = newValue;
        emit ValueChanged(old, newValue, msg.sender);
    }
}
```

### Compile the Contract

```bash
npx hardhat compile
```

**Expected output:**

```bash
Compiled 1 Solidity file successfully (evm target: paris).
```

### Run the Tests

```bash
npx hardhat test --network solo
```

For the pre-built example, the test suite covers three scenarios:

```bash
  SimpleStorage
    ✔ deploys with initial value
    ✔ updates value and emits ValueChanged event
    ✔ allows other accounts to set value

  3 passing (12s)
```

### Deploy via a Script

To deploy `SimpleStorage` to your Solo network using a deploy script:

```bash
npx hardhat run scripts/deploy.ts --network solo
```

A minimal `scripts/deploy.ts` looks like:

```typescript
import { ethers } from "hardhat";

async function main() {
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const contract = await SimpleStorage.deploy(42);
  await contract.waitForDeployment();

  console.log("SimpleStorage deployed to:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

---

## Step 5: Send a Transaction with ethers.js

To submit a transaction directly from a script using ethers.js via Hardhat:

```typescript
import { ethers } from "hardhat";

async function main() {
  const [sender] = await ethers.getSigners();
  console.log("Sender:", sender.address);

  const balance = await ethers.provider.getBalance(sender.address);
  console.log("Balance:", ethers.formatEther(balance), "HBAR");

  const tx = await sender.sendTransaction({
    to: sender.address,
    value: 10_000_000_000n,
  });

  await tx.wait();
  console.log("Transaction confirmed. Hash:", tx.hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Run it with:

```bash
npx hardhat run scripts/send-tx.ts --network solo
```

---

## Step 6: Verify Transactions

Confirm your transactions reached consensus using any of the following:

### Hiero Mirror Node Explorer

```url
http://localhost:38080/localnet/dashboard
```

> **Note:** If you are using Solo 0.62 or earlier, the Explorer is at `http://localhost:8080/localnet/dashboard`.

Search by account address, transaction hash, or contract address to view
transaction details and receipts.

### Hiero Mirror Node REST API

```url
http://localhost:38081/api/v1/transactions?limit=5
```

Returns the five most recent transactions in JSON format. Useful for scripted
verification.

> Note: `localhost:5551` (the legacy Mirror Node REST API direct endpoint) is being phased out.
> Use `localhost:38081` (Solo 0.63+) or `localhost:8081` (Solo 0.62 and earlier) to ensure compatibility with all endpoints.

### Hiero JSON RPC Relay (eth_getTransactionReceipt)

```bash
curl -X POST http://localhost:37546 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["0xYOUR_TX_HASH"],"id":1}'
```

---

## Step 7: Configure MetaMask

To connect MetaMask to your local Solo network:

1. Open MetaMask and go to **Settings → Networks → Add a network → Add a
   network manually**.
2. Enter the following values:

   | Field | Value |
   | --- | --- |
   | Network name | `Solo Local` |
   | New RPC URL | `http://localhost:37546` |
   | Chain ID | `298` |
   | Currency symbol | `HBAR` |
   | Block explorer URL | `http://localhost:38080/localnet/dashboard` (optional) |

   > **Note:** If you are using Solo 0.62 or earlier, use `http://localhost:7546` for the RPC URL and `http://localhost:8080/localnet/dashboard` for the block explorer URL.

3. Click **Save** and switch to the **Solo Local** network.
4. Import an account using an ECDSA private key from `accounts.json`:
   - Click the account icon → **Import account**.
   - Paste the private key (with `0x` prefix).
   - Click **Import**.

Your MetaMask wallet is now connected to the local Solo network and funded with
the pre-allocated HBAR balance.

---

## Step 8: Tear Down the Network

When finished, destroy the Solo deployment and all associated containers:

```bash
npx @hiero-ledger/solo one-shot single destroy
```

If you added the relay manually to an existing deployment:

```bash
solo relay node destroy --deployment "${SOLO_DEPLOYMENT}"
```

---

## Reference: Running the Full Example Automatically

The `hardhat-with-solo` example includes a `Taskfile.yml` that automates all
steps - deploy network, install dependencies, compile, and test - in a single
command:

```bash
cd solo/examples/hardhat-with-solo
task
```

To tear everything down:

```bash
task destroy
```

This is useful for CI pipelines. See the
[Solo deployment with Hardhat Example](https://github.com/hiero-ledger/solo/tree/main/examples/hardhat-with-solo) for full
details.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `connection refused` on port `37546` | Relay not running | Run `one-shot single deploy` or `solo relay node add` |
| `invalid sender` or signature error | Using ED25519 key instead of ECDSA | Use ECDSA keys from `accounts.json` |
| Hardhat `chainId` mismatch error | Missing or wrong `chainId` in config | Set `chainId: 298` in `hardhat.config.ts` |
| MetaMask shows wrong network | Chain ID mismatch | Ensure Chain ID is `298` in MetaMask network settings |
| `INSUFFICIENT_TX_FEE` on transaction | Account not funded | Use a pre-funded ECDSA account from `accounts.json` |
| Hardhat test timeout | Network not fully started | Wait for `one-shot` to fully complete before running tests |
| Port `37546` already in use | Another process is using the port | Run `lsof -i :37546` and stop the conflicting process |

---

## Further Reading

- [Solo deployment with Hardhat Example](https://github.com/hiero-ledger/solo/tree/main/examples/hardhat-with-solo).
- [Configuring Hardhat with Hiero Local Node](https://docs.hedera.com/hedera/tutorials/smart-contracts/configuring-hardhat-with-hiero-local-node-a-step-by-step-guide) - the Hedera tutorial this guide is modelled on.
- [Retrieving Logs](/docs/advanced-solo-setup/jvm-debugger/) - for debugging network-level issues.
