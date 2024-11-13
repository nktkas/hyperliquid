# @nktkas/hyperliquid

[![JSR](https://jsr.io/badges/@nktkas/hyperliquid)](https://jsr.io/@nktkas/hyperliquid) [![JSR Score](https://jsr.io/badges/@nktkas/hyperliquid/score)](https://jsr.io/@nktkas/hyperliquid)

SDK for Hyperliquid API trading with TypeScript.

## Installation

```bash
# npm
npx jsr add @nktkas/hyperliquid

# yarn 
yarn dlx jsr add @nktkas/hyperliquid

# pnpm
pnpm dlx jsr add @nktkas/hyperliquid

# bun
bunx jsr add @nktkas/hyperliquid

# deno
import * as hyperliquid from "jsr:@nktkas/hyperliquid"
```

## Usage

### Initialize Transport

First, choose and configure your transport layer. The SDK supports both HTTP and WebSocket:

```typescript
import * as hyperliquid from "@nktkas/hyperliquid";

// HTTP Transport
const httpTransport = new hyperliquid.HttpTransport({
  url: "https://api.hyperliquid.xyz",   // API base URL
  timeout: 10000,                       // Request timeout in ms
  fetchOptions: { ... },                // Additional fetch options
  retry: {
    maxAttempts: 3,                   // Maximum retry attempts
    baseDelay: 150,                   // Base delay between retries in ms
    maxDelay: 5000,                   // Maximum delay between retries in ms
  }
});

// OR WebSocket Transport
const wsTransport = new hyperliquid.WebSocketTransport({
  url: "wss://api.hyperliquid.xyz/ws",   // WebSocket URL
  timeout: 10000,                        // Request timeout in ms
  keepAliveInterval: 20000,              // Ping interval in ms
  reconnect: {
    maxAttempts: 3,                    // Maximum reconnection attempts
    baseDelay: 150,                    // Base delay between reconnections in ms
    maxDelay: 5000                     // Maximum delay between reconnections in ms
  }
});
```

### Initialize Client

Next, initialize the client with the transport layer. There are two main clients: `ExchangeClient` for interacting with the exchange API and `InfoClient` for interacting with the info API.

#### Create ExchangeClient

##### Private key via [viem](https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc)

```typescript
import * as hyperliquid from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount("0x...");
const transport = new hyperliquid.HttpTransport(); // or WebSocketTransport

const client = new hyperliquid.ExchangeClient(account, transport);
```

##### Private key via [ethers](https://docs.ethers.org/v6/api/wallet/#Wallet)

```typescript
import * as hyperliquid from "@nktkas/hyperliquid";
import { ethers } from "ethers";

const wallet = new ethers.Wallet("0x...");
const transport = new hyperliquid.HttpTransport(); // or WebSocketTransport

const client = new hyperliquid.ExchangeClient(wallet, transport);
```

##### External wallet (e.g. MetaMask) via [viem](https://viem.sh/docs/clients/wallet#optional-hoist-the-account)

```typescript
import * as hyperliquid from "@nktkas/hyperliquid";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" });
const walletClient = createWalletClient({ account, chain: arbitrum, transport: http() });
const transport = new hyperliquid.HttpTransport(); // or WebSocketTransport

const client = new hyperliquid.ExchangeClient(walletClient, transport);
```

#### Create InfoClient

```typescript
import * as hyperliquid from "@nktkas/hyperliquid";

const transport = new hyperliquid.HttpTransport(); // or WebSocketTransport
const client = new hyperliquid.InfoClient(transport);
```

### Basic example

```typescript
import * as hyperliquid from "@nktkas/hyperliquid";

// Initialize the transport
const transport = new hyperliquid.HttpTransport(); // or WebSocketTransport

// Initialize the exchange client
const exchangeClient = new hyperliquid.ExchangeClient(..., transport);

// Initialize the info client
const infoClient = new hyperliquid.InfoClient(transport);

// Example: Place an order
const orderResult = await exchangeClient.order({
  orders: [
    {
      a: 0, // Asset index
      b: true, // Buy order
      p: "1000", // Price
      s: "1", // Size
      r: false, // Not reduce-only
      t: { limit: { tif: "Gtc" } }, // Good-til-cancelled limit order
    },
  ],
  grouping: "na", // Just order(s) without grouping
});

console.log("Order placed:", orderResult);

// Example: Get user's open orders
const openOrders = await infoClient.openOrders({ user: "0x..." });
console.log("Open orders:", openOrders);
```

## API Reference

The SDK provides several main classes:

### Transport Classes

#### HttpTransport

HTTP transport for API communication.

```typescript
class HttpTransport implements IRESTTransport {
  constructor(config?: HttpTransportConfig);
  request<T>(endpoint: "info" | "action" | "explorer", payload: unknown): Promise<T>;
}
```

Configuration options:

```typescript
interface HttpTransportConfig {
  url?: string | URL; // API base URL (default: "https://api.hyperliquid.xyz")
  timeout?: number; // Request timeout in ms (default: 10000)
  fetchOptions?: RequestInit; // Additional fetch options
  retry?: {
    maxAttempts?: number; // Maximum retry attempts (default: 3)
    baseDelay?: number; // Base delay between retries in ms (default: 150)
    maxDelay?: number; // Maximum delay between retries in ms (default: 5000)
    shouldRetry?: (error: unknown) => boolean | Promise<boolean>; // Custom retry logic (Retries on network errors, timeouts, and 5xx status codes)
  };
}
```

#### WebSocketTransport

WebSocket transport for API communication.

```typescript
class WebSocketTransport implements IRESTTransport {
  constructor(config?: WebSocketTransportConfig);
  request<T>(endpoint: "info" | "action" | "explorer", payload: unknown): Promise<T>;
  ready(signal?: AbortSignal): Promise<void>; // Wait for connection
  close(signal?: AbortSignal): Promise<void>; // Close connection
}
```

Configuration options:

```typescript
interface WebSocketTransportConfig {
  url?: string | URL; // WebSocket URL (default: "wss://api.hyperliquid.xyz/ws")
  timeout?: number; // Request timeout in ms (default: 10000)
  keepAliveInterval?: number; // Ping interval in ms (default: 20000)
  reconnect?: {
    maxAttempts?: number; // Maximum reconnection attempts (default: 3)
    baseDelay?: number; // Base delay between reconnections in ms (default: 150)
    maxDelay?: number; // Maximum delay between reconnections in ms (default: 5000)
    shouldReconnect?: (event: CloseEvent) => boolean | Promise<boolean>; // Custom reconnection logic
  };
}
```

### Client Classes

Each method is fully documented with TypeScript types and JSDoc comments. For detailed information about parameters and response types, refer to the source code or type definitions.

#### ExchangeClient

Client for interacting with the exchange API (placing orders, cancelling orders, etc.).

```typescript
class ExchangeClient {
  constructor(
    wallet: AbstractWalletClient | AbstractSigner,
    transport: IRESTTransport,
    isTestnet?: boolean,
  );

  // Order Management
  order(args: OrderParameters): Promise<OrderResponseSuccess>;
  modify(args: ModifyParameters): Promise<SuccessResponse>;
  cancel(args: CancelParameters): Promise<CancelResponseSuccess>;
  cancelByCloid(args: CancelByCloidParameters): Promise<CancelResponseSuccess>;
  batchModify(args: BatchModifyParameters): Promise<OrderResponseSuccess>;
  scheduleCancel(args: ScheduleCancelParameters): Promise<SuccessResponse>;

  // Account Management
  updateLeverage(args: UpdateLeverageParameters): Promise<SuccessResponse>;
  updateIsolatedMargin(args: UpdateIsolatedMarginParameters): Promise<SuccessResponse>;
  createSubAccount(args: CreateSubAccountParameters): Promise<CreateSubAccountResponse>;
  subAccountTransfer(args: SubAccountTransferParameters): Promise<SuccessResponse>;

  // Transfers & Withdrawals
  withdraw3(args: Withdraw3Parameters): Promise<SuccessResponse>;
  usdSend(args: UsdSendParameters): Promise<SuccessResponse>;
  spotSend(args: SpotSendParameters): Promise<SuccessResponse>;
  usdClassTransfer(args: UsdClassTransferParameters): Promise<SuccessResponse>;
  vaultTransfer(args: VaultTransferParameters): Promise<SuccessResponse>;

  // Approvals & Settings
  approveAgent(args: ApproveAgentParameters): Promise<SuccessResponse>;
  approveBuilderFee(args: ApproveBuilderFeeParameters): Promise<SuccessResponse>;
  setReferrer(args: SetReferrerParameters): Promise<SuccessResponse>;
}
```

#### InfoClient

Client for retrieving information (order book, user positions, etc.).

```typescript
class InfoClient {
  constructor(transport: IRESTTransport);

  // Market Data
  allMids(): Promise<AllMids>;
  candleSnapshot(args: CandleSnapshotParameters): Promise<CandleSnapshot[]>;
  fundingHistory(args: FundingHistoryParameters): Promise<FundingHistory[]>;
  l2Book(args: L2BookParameters): Promise<L2Book>;
  meta(): Promise<Meta>;
  metaAndAssetCtxs(): Promise<MetaAndAssetCtxs>;
  spotMeta(): Promise<SpotMeta>;
  spotMetaAndAssetCtxs(): Promise<SpotMetaAndAssetCtxs>;

  // Account Information
  clearinghouseState(args: ClearinghouseStateParameters): Promise<ClearinghouseState>;
  spotClearinghouseState(args: SpotClearinghouseStateParameters): Promise<SpotClearinghouseState>;
  openOrders(args: OpenOrdersParameters): Promise<OpenOrder[]>;
  frontendOpenOrders(args: FrontendOpenOrdersParameters): Promise<FrontendOpenOrder[]>;
  maxBuilderFee(args: MaxBuilderFeeParameters): Promise<number>;
  orderStatus(args: OrderStatusParameters): Promise<OrderStatusResponse>;
  referral(args: ReferralParameters): Promise<Referral>;
  subAccounts(args: SubAccountsParameters): Promise<SubAccount[]>;

  // User Activity
  userFills(args: UserFillsParameters): Promise<UserFill[]>;
  userFillsByTime(args: UserFillsByTimeParameters): Promise<UserFill[]>;
  userFunding(args: UserFundingParameters): Promise<UserFunding[]>;
  userNonFundingLedgerUpdates(args: UserNonFundingLedgerUpdatesParameters): Promise<UserNonFundingLedgerUpdates[]>;
  userFees(args: UserFeesParameters): Promise<UserFees>;
  userRateLimit(args: UserRateLimitParameters): Promise<UserRateLimit>;
}
```

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING](./CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
