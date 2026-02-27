# Agent wallets and vaults

Hyperliquid supports delegated trading through
[agent wallets](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#api-wallets),
and isolated capital through
[vaults and sub-accounts](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#subaccounts-and-vaults).

## Agent wallets

An agent wallet signs trades on behalf of your master account. Approve it once, then use the agent's private key for all
subsequent requests:

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const client = new ExchangeClient({
  transport: new HttpTransport(),
  wallet: privateKeyToAccount("0x..."), // agent's private key
});

// All trades are executed as the master account
await client.order({
  orders: [{
    a: 0,
    b: true,
    p: "50000",
    s: "0.01",
    r: false,
    t: { limit: { tif: "Gtc" } },
  }],
  grouping: "na",
});
```

### Create an agent

Approve an agent via `approveAgent` or through the [Hyperliquid UI](https://app.hyperliquid.xyz/API):

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const client = new ExchangeClient({
  transport: new HttpTransport(),
  wallet: privateKeyToAccount("0x..."), // master account
});

await client.approveAgent({
  agentAddress: "0x...", // address of the agent wallet
  agentName: "my-bot",
});
```

Agents expire after 90 days by default. To set a custom expiration (up to 180 days), append `valid_until <timestamp>` to
the name:

```ts
const timestamp = Date.now() + 180 * 24 * 60 * 60 * 1000; // 180 days from now
await client.approveAgent({
  agentAddress: "0x...",
  agentName: `my-bot valid_until ${timestamp}`,
});
```

## Vaults

A vault is an isolated trading account that other users can deposit into. Trade on behalf of a vault by setting
`vaultAddress`:

```ts
const client = new ExchangeClient({
  transport,
  wallet,
  defaultVaultAddress: "0x...",
});
```

```ts
await client.order({ orders: [/* ... */], grouping: "na" }, {
  vaultAddress: "0x...",
});
```

### Manage vaults

```ts
// Create
const result = await client.createVault({
  name: "My Vault",
  description: "Automated trading strategy",
  initialUsd: 100e6, // 100 USD in microunits
  nonce: Date.now(),
});

// Deposit
await client.vaultTransfer({
  vaultAddress: "0x...",
  isDeposit: true,
  usd: 50e6, // 50 USD in microunits
});

// Withdraw
await client.vaultTransfer({
  vaultAddress: "0x...",
  isDeposit: false,
  usd: 25e6, // 25 USD in microunits
});
```

## Sub-accounts

Sub-accounts work like vaults but belong to a single user. They share the same `vaultAddress` mechanism for trading:

```ts
// Create
const result = await client.createSubAccount({ name: "trading-bot" });
const subAccountAddress = result.response.data;

// Transfer funds
await client.subAccountTransfer({
  subAccountUser: subAccountAddress,
  isDeposit: true,
  usd: 10e6, // 10 USD in microunits
});

// Transfer spot tokens
await client.subAccountSpotTransfer({
  subAccountUser: subAccountAddress,
  isDeposit: true,
  token: "USDC:0xeb62eee3685fc4c43992febcd9e75443",
  amount: "100", // 100 USDC
});

// Trade on behalf of sub-account
await client.order({ orders: [/* ... */], grouping: "na" }, {
  vaultAddress: subAccountAddress,
});
```
