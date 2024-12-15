# @nktkas/hyperliquid

[![JSR](https://jsr.io/badges/@nktkas/hyperliquid)](https://jsr.io/@nktkas/hyperliquid)
[![JSR Score](https://jsr.io/badges/@nktkas/hyperliquid/score)](https://jsr.io/@nktkas/hyperliquid)

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
import * as hl from "jsr:@nktkas/hyperliquid"

# web (import directly)
import * as hl from "https://esm.sh/jsr/@nktkas/hyperliquid"
```

## Usage

### Initialize Transport

First, choose and configure your transport layer (more details in the [API Reference](#transport-layer)):

```typescript
import * as hl from "@nktkas/hyperliquid";

// HTTP Transport
const httpTransport = new hl.HttpTransport({ // All options are optional
    url: "https://api.hyperliquid.xyz", // API base URL for /info, /exchange, /explorer
    timeout: 10_000, // Request timeout in ms
});

// OR WebSocket Transport
const wsTransport = new hl.WebSocketTransport({ // All options are optional
    url: "wss://api.hyperliquid.xyz/ws", // WebSocket URL
    timeout: 10_000, // Request timeout in ms
});
```

### Initialize Client

Next, initialize the client with the transport layer (more details in the [API Reference](#client-classes)):

#### Create PublicClient

```typescript
import * as hl from "@nktkas/hyperliquid";

const transport = new hl.HttpTransport(); // or WebSocketTransport
const client = new hl.PublicClient(transport);
```

#### Create WalletClient

```typescript
import * as hl from "@nktkas/hyperliquid";
import { createWalletClient, custom, privateKeyToAccount } from "viem";
import { arbitrum } from "viem/chains";
import { ethers } from "ethers";

const transport = new hl.HttpTransport(); // or WebSocketTransport

// 1. Using Viem with private key
const viemAccount = privateKeyToAccount("0x...");
const viemClient = new hl.WalletClient(viemAccount, transport);

// 2. Using Ethers (or Ethers V5) with private key
const ethersWallet = new ethers.Wallet("0x...");
const ethersClient = new hl.WalletClient(ethersWallet, transport);

// 3. Using external wallet (e.g. MetaMask) via Viem
const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
const walletClient = createWalletClient({
    account,
    chain: arbitrum,
    transport: custom(window.ethereum),
});
const metamaskClient = new hl.WalletClient(walletClient, transport);
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
    timeout?: number; // Request timeout in ms (default: 10_000)
    fetchOptions?: RequestInit; // Additional fetch options
    onRequest?: (request: Request) => MaybePromise<Request | void | null | undefined>; // Callback before request is sent
    onResponse?: (response: Response) => MaybePromise<Response | void | null | undefined>; // Callback after response is received
}
```

#### WebSocketTransport

```typescript
class WebSocketTransport implements IRESTTransport {
    constructor(config?: WebSocketTransportConfig);
    request<T>(endpoint: "info" | "action" | "explorer", payload: unknown, signal?: AbortSignal): Promise<T>;
    close(signal?: AbortSignal): Promise<void>;
}
```

```typescript
interface WebSocketTransportConfig {
    url?: string | URL; // WebSocket URL (default: "wss://api.hyperliquid.xyz/ws")
    timeout?: number; // Request timeout in ms (default: 10_000)
    keepAliveInterval?: number; // Ping interval in ms (default: 20_000)
    reconnect?: { // Only re-establishes the connection, does not retry failed requests.
        maxAttempts?: number; // Maximum number of reconnection attempts (default: 3)
        delay?: number | ((attempt: number) => number | Promise<number>); // Delay between reconnections (default: Exponential backoff (max 10s))
        shouldReattempt?: (event: CloseEvent) => boolean | Promise<boolean>; // Custom reconnection logic (default: Always reattempt)
        messageBuffer?: MessageBufferStrategy; // Message buffering strategy between reconnection (default: FIFO buffer with a maximum size of 100 messages)
    };
}
```

### Client Classes

The SDK provides two client classes for interacting with the Hyperliquid API:

#### PublicClient

Client for retrieving information (order book, user positions, etc.).

```typescript
class PublicClient {
    constructor(transport: IRESTTransport); // HttpTransport or WebSocketTransport

    // Market
    allMids(): Promise<AllMids>;
    candleSnapshot(args: CandleSnapshotParameters): Promise<CandleSnapshot[]>;
    fundingHistory(args: FundingHistoryParameters): Promise<FundingHistory[]>;
    l2Book(args: L2BookParameters): Promise<L2Book>;
    meta(): Promise<Meta>;
    metaAndAssetCtxs(): Promise<MetaAndAssetCtxs>;
    spotMeta(): Promise<SpotMeta>;
    spotMetaAndAssetCtxs(): Promise<SpotMetaAndAssetCtxs>;
    tokenDetails(args: TokenDetailsParameters): Promise<TokenDetails>;

    // Account
    clearinghouseState(args: ClearinghouseStateParameters): Promise<ClearinghouseState>;
    extraAgents(args: ExtraAgentsParameters): Promise<ExtraAgent[]>;
    frontendOpenOrders(args: FrontendOpenOrdersParameters): Promise<FrontendOpenOrder[]>;
    maxBuilderFee(args: MaxBuilderFeeParameters): Promise<number>;
    openOrders(args: OpenOrdersParameters): Promise<OpenOrder[]>;
    orderStatus(args: OrderStatusParameters): Promise<OrderStatusResponse>;
    referral(args: ReferralParameters): Promise<Referral>;
    spotClearinghouseState(args: SpotClearinghouseStateParameters): Promise<SpotClearinghouseState>;
    subAccounts(args: SubAccountsParameters): Promise<SubAccount[]>;
    twapHistory(args: TwapHistoryParameters): Promise<TwapHistory>;
    userFees(args: UserFeesParameters): Promise<UserFees>;
    userFills(args: UserFillsParameters): Promise<UserFill[]>;
    userFillsByTime(args: UserFillsByTimeParameters): Promise<UserFill[]>;
    userFunding(args: UserFundingParameters): Promise<UserFunding[]>;
    userNonFundingLedgerUpdates(args: UserNonFundingLedgerUpdatesParameters): Promise<UserNonFundingLedgerUpdates[]>;
    userRateLimit(args: UserRateLimitParameters): Promise<UserRateLimit>;

    // Blockchain
    blockDetails(args: BlockDetailsParameters): Promise<BlockDetailsResponse>;
    txDetails(args: TxDetailsParameters): Promise<TxDetailsResponse>;
}
```

#### WalletClient

Client for interacting with the exchange API (placing orders, cancelling orders, etc.).

```typescript
class WalletClient {
    constructor(
        wallet: AbstractViemWalletClient | AbstractEthersSigner | AbstractEthersV5Signer, // viem, ethers, or ethers v5
        transport: IRESTTransport, // HttpTransport or WebSocketTransport
        isTestnet?: boolean, // Whether to use the testnet API (default: false)
    );

    // Order Management
    batchModify(args: BatchModifyParameters): Promise<OrderResponseSuccess>;
    cancel(args: CancelParameters): Promise<CancelResponseSuccess>;
    cancelByCloid(args: CancelByCloidParameters): Promise<CancelResponseSuccess>;
    modify(args: ModifyParameters): Promise<SuccessResponse>;
    order(args: OrderParameters): Promise<OrderResponseSuccess>;
    scheduleCancel(args: ScheduleCancelParameters): Promise<SuccessResponse>;
    updateIsolatedMargin(args: UpdateIsolatedMarginParameters): Promise<SuccessResponse>;
    updateLeverage(args: UpdateLeverageParameters): Promise<SuccessResponse>;

    // Account Management
    approveAgent(args: ApproveAgentParameters): Promise<SuccessResponse>;
    approveBuilderFee(args: ApproveBuilderFeeParameters): Promise<SuccessResponse>;
    createSubAccount(args: CreateSubAccountParameters): Promise<CreateSubAccountResponse>;
    setReferrer(args: SetReferrerParameters): Promise<SuccessResponse>;

    // Transfers & Withdrawals
    spotSend(args: SpotSendParameters): Promise<SuccessResponse>;
    subAccountTransfer(args: SubAccountTransferParameters): Promise<SuccessResponse>;
    usdClassTransfer(args: UsdClassTransferParameters): Promise<SuccessResponse>;
    usdSend(args: UsdSendParameters): Promise<SuccessResponse>;
    vaultTransfer(args: VaultTransferParameters): Promise<SuccessResponse>;
    withdraw3(args: Withdraw3Parameters): Promise<SuccessResponse>;
}
```

## Semantic Versioning

This library follows **Semantic Versioning (semver)** for its releases.

> **Note:** The Hyperliquid API types are updated independently and it is not possible to use a specific version of
> them, only the latest. As a result, updates to these types may change the patch version even if they include breaking
> changes.

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING](./CONTRIBUTING.md) file for guidelines on how to contribute to
this project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
