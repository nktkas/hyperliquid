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

# deno (import directly)
import * as hyperliquid from "jsr:@nktkas/hyperliquid"

# CDN (import directly)
import * as hyperliquid from "https://esm.sh/jsr/@nktkas/hyperliquid"
```

## Usage

### Initialize Transport

First, choose and configure your transport layer (more details in the [API Reference](#transport-layer)):

```typescript
import * as hyperliquid from "@nktkas/hyperliquid";

// HTTP Transport
const httpTransport = new hyperliquid.HttpTransport({ // All options are optional
  url: "https://api.hyperliquid.xyz", // API base URL for /info, /exchange, /explorer
  timeout: 10_000, // Request timeout in ms
});

// OR WebSocket Transport
const wsTransport = new hyperliquid.WebSocketTransport({ // All options are optional
  url: "wss://api.hyperliquid.xyz/ws", // WebSocket URL
  timeout: 10_000, // Request timeout in ms
});
```

### Initialize Client

Next, initialize the client with the transport layer (more details in the [API Reference](#client-classes)):

#### Create InfoClient

```typescript
import * as hyperliquid from "@nktkas/hyperliquid";

const transport = new hyperliquid.HttpTransport(); // or WebSocketTransport
const client = new hyperliquid.InfoClient(transport);
```

#### Create ExchangeClient

```typescript
import * as hyperliquid from "@nktkas/hyperliquid";
import { createWalletClient, custom, privateKeyToAccount } from "viem";
import { arbitrum } from "viem/chains";
import { ethers } from "ethers";

const transport = new hyperliquid.HttpTransport(); // or WebSocketTransport

// 1. Using Viem with private key
const viemAccount = privateKeyToAccount("0x...");
const viemClient = new hyperliquid.ExchangeClient(viemAccount, transport);

// 2. Using Ethers with private key
const ethersWallet = new ethers.Wallet("0x...");
const ethersClient = new hyperliquid.ExchangeClient(ethersWallet, transport);

// 3. Using external wallet (e.g. MetaMask) via Viem
const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" });
const walletClient = createWalletClient({
  account,
  chain: arbitrum,
  transport: custom(window.ethereum),
});
const metamaskClient = new hyperliquid.ExchangeClient(walletClient, transport);
```

## API Reference

### Transport Layer

The SDK supports both HTTP and WebSocket transports for API communication:

#### HttpTransport

```typescript
class HttpTransport implements IRESTTransport {
  constructor(config?: HttpTransportConfig);
  request<T>(endpoint: "info" | "action" | "explorer", payload: unknown, signal?: AbortSignal): Promise<T>;
}
```

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

```typescript
class WebSocketTransport implements IRESTTransport {
  constructor(config?: WebSocketTransportConfig);
  request<T>(endpoint: "info" | "action" | "explorer", payload: unknown, signal?: AbortSignal): Promise<T>;
  ready(signal?: AbortSignal): Promise<void>; // Wait for connection
  close(signal?: AbortSignal): Promise<void>; // Close connection
}
```

```typescript
interface WebSocketTransportConfig {
  url?: string | URL; // WebSocket URL (default: "wss://api.hyperliquid.xyz/ws")
  timeout?: number; // Request timeout in ms (default: 10000)
  keepAliveInterval?: number; // Ping interval in ms (default: 20000)
  reconnect?: { // Only re-establishes the connection, does not retry failed requests.
    maxAttempts?: number; // Maximum number of reconnection attempts (default: 3)
    delay?: number | ((attempt: number) => number | Promise<number>); // Delay between reconnections (default: Exponential backoff)
    shouldReattempt?: (event: CloseEvent) => boolean | Promise<boolean>; // Custom reconnection logic (default: Non-normal close code)
  };
  retry?: { // Only works with async requests and when reconnect is enabled.
    maxAttempts?: number; // Maximum number of retry attempts (default: 0)
  };
}
```

### Client Classes

The SDK provides two client classes for interacting with the Hyperliquid API:

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

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING](./CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
