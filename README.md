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
    maxAttempts: 0,                               // Maximum retry attempts
    delay: (attempt) => ~~(1 << attempt) * 150,   // Delay between retries in ms (default: Exponential backoff)
    shouldReattempt: (error) => error instanceof TypeError || (error instanceof HttpRequestError && error.response.status >= 500 && error.response.status < 600) // Custom retry logic (default: Retries on network errors and 5xx status codes)
  }
});

// OR WebSocket Transport
const wsTransport = new hyperliquid.WebSocketTransport({
  url: "wss://api.hyperliquid.xyz/ws",   // WebSocket URL
  timeout: 10000,                        // Request timeout in ms
  keepAliveInterval: 20000,              // Ping interval in ms
  reconnect: {
    maxAttempts: 3,                                 // Maximum reconnection attempts
    delay: (attempt) => ~~(1 << attempt) * 150,     // Delay between reconnections in ms (default: Exponential backoff)
    shouldReattempt: (event) => event.code !== 1000 // Custom reconnection logic (default: Non-normal close code)
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

## API Reference

The SDK provides several main classes:

### Transport Classes

#### HttpTransport

HTTP transport for API communication.

```typescript
class HttpTransport implements IRESTTransport {
  constructor(config?: HttpTransportConfig);
  request<T>(endpoint: "info" | "action" | "explorer", payload: unknown, signal?: AbortSignal): Promise<T>;
}
```

Configuration options:

```typescript
interface HttpTransportConfig {
  url?: string | URL; // API base URL (default: "https://api.hyperliquid.xyz")
  timeout?: number; // Request timeout in ms (default: 10000)
  fetchOptions?: RequestInit; // Additional fetch options
  retry?: {
    maxAttempts?: number; // Maximum number of retry attempts (default: 0)
    delay?: number | ((attempt: number) => number | Promise<number>); // Delay between reconnections (default: Exponential backoff)
    shouldReattempt?: (error: unknown) => boolean | Promise<boolean>; // Custom retry logic (default: Retries on network errors and 5xx status codes)
  };
}
```

#### WebSocketTransport

WebSocket transport for API communication.

```typescript
class WebSocketTransport implements IRESTTransport {
  constructor(config?: WebSocketTransportConfig);
  request<T>(endpoint: "info" | "action" | "explorer", payload: unknown, signal?: AbortSignal): Promise<T>;
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
    maxAttempts?: number; // Maximum number of reconnection attempts (default: 3)
    delay?: number | ((attempt: number) => number | Promise<number>); // Delay between reconnections (default: Exponential backoff)
    shouldReattempt?: (event: CloseEvent) => boolean | Promise<boolean>; // Custom reconnection logic (default: Non-normal close code)
  };
  retry?: {
    maxAttempts?: number; // Maximum number of retry attempts (default: 0)
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
  order(args: OrderParameters, signal?: AbortSignal): Promise<OrderResponseSuccess>;
  modify(args: ModifyParameters, signal?: AbortSignal): Promise<SuccessResponse>;
  cancel(args: CancelParameters, signal?: AbortSignal): Promise<CancelResponseSuccess>;
  cancelByCloid(args: CancelByCloidParameters, signal?: AbortSignal): Promise<CancelResponseSuccess>;
  batchModify(args: BatchModifyParameters, signal?: AbortSignal): Promise<OrderResponseSuccess>;
  scheduleCancel(args: ScheduleCancelParameters, signal?: AbortSignal): Promise<SuccessResponse>;

  // Account Management
  updateLeverage(args: UpdateLeverageParameters, signal?: AbortSignal): Promise<SuccessResponse>;
  updateIsolatedMargin(args: UpdateIsolatedMarginParameters, signal?: AbortSignal): Promise<SuccessResponse>;
  createSubAccount(args: CreateSubAccountParameters, signal?: AbortSignal): Promise<CreateSubAccountResponse>;
  subAccountTransfer(args: SubAccountTransferParameters, signal?: AbortSignal): Promise<SuccessResponse>;

  // Transfers & Withdrawals
  withdraw3(args: Withdraw3Parameters, signal?: AbortSignal): Promise<SuccessResponse>;
  usdSend(args: UsdSendParameters, signal?: AbortSignal): Promise<SuccessResponse>;
  spotSend(args: SpotSendParameters, signal?: AbortSignal): Promise<SuccessResponse>;
  usdClassTransfer(args: UsdClassTransferParameters, signal?: AbortSignal): Promise<SuccessResponse>;
  vaultTransfer(args: VaultTransferParameters, signal?: AbortSignal): Promise<SuccessResponse>;

  // Approvals & Settings
  approveAgent(args: ApproveAgentParameters, signal?: AbortSignal): Promise<SuccessResponse>;
  approveBuilderFee(args: ApproveBuilderFeeParameters, signal?: AbortSignal): Promise<SuccessResponse>;
  setReferrer(args: SetReferrerParameters, signal?: AbortSignal): Promise<SuccessResponse>;
}
```

#### InfoClient

Client for retrieving information (order book, user positions, etc.).

```typescript
class InfoClient {
  constructor(transport: IRESTTransport);

  // Market Data
  allMids(signal?: AbortSignal): Promise<AllMids>;
  candleSnapshot(args: CandleSnapshotParameters, signal?: AbortSignal): Promise<CandleSnapshot[]>;
  fundingHistory(args: FundingHistoryParameters, signal?: AbortSignal): Promise<FundingHistory[]>;
  l2Book(args: L2BookParameters, signal?: AbortSignal): Promise<L2Book>;
  meta(signal?: AbortSignal): Promise<Meta>;
  metaAndAssetCtxs(signal?: AbortSignal): Promise<MetaAndAssetCtxs>;
  spotMeta(signal?: AbortSignal): Promise<SpotMeta>;
  spotMetaAndAssetCtxs(signal?: AbortSignal): Promise<SpotMetaAndAssetCtxs>;

  // Account Information
  clearinghouseState(args: ClearinghouseStateParameters, signal?: AbortSignal): Promise<ClearinghouseState>;
  spotClearinghouseState(args: SpotClearinghouseStateParameters, signal?: AbortSignal): Promise<SpotClearinghouseState>;
  openOrders(args: OpenOrdersParameters, signal?: AbortSignal): Promise<OpenOrder[]>;
  frontendOpenOrders(args: FrontendOpenOrdersParameters, signal?: AbortSignal): Promise<FrontendOpenOrder[]>;
  maxBuilderFee(args: MaxBuilderFeeParameters, signal?: AbortSignal): Promise<number>;
  orderStatus(args: OrderStatusParameters, signal?: AbortSignal): Promise<OrderStatusResponse>;
  referral(args: ReferralParameters, signal?: AbortSignal): Promise<Referral>;
  subAccounts(args: SubAccountsParameters, signal?: AbortSignal): Promise<SubAccount[]>;

  // User Activity
  userFills(args: UserFillsParameters, signal?: AbortSignal): Promise<UserFill[]>;
  userFillsByTime(args: UserFillsByTimeParameters, signal?: AbortSignal): Promise<UserFill[]>;
  userFunding(args: UserFundingParameters, signal?: AbortSignal): Promise<UserFunding[]>;
  userNonFundingLedgerUpdates(args: UserNonFundingLedgerUpdatesParameters, signal?: AbortSignal): Promise<UserNonFundingLedgerUpdates[]>;
  userFees(args: UserFeesParameters, signal?: AbortSignal): Promise<UserFees>;
  userRateLimit(args: UserRateLimitParameters, signal?: AbortSignal): Promise<UserRateLimit>;
}
```

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING](./CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
