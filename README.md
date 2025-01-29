# Hyperliquid API TypeScript SDK

[![JSR](https://jsr.io/badges/@nktkas/hyperliquid)](https://jsr.io/@nktkas/hyperliquid)
[![JSR Score](https://jsr.io/badges/@nktkas/hyperliquid/score)](https://jsr.io/@nktkas/hyperliquid)
![bundlephobia](https://badgen.net/bundlephobia/minzip/@nktkas/hyperliquid)

Unofficial [Hyperliquid API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api) SDK for all major JS
runtimes, written in TypeScript and provided with tests.

## Features

- 🖋️ **Typed**: Source code is 100% TypeScript.
- 🧪 **Tested**: Good code coverage and type validation.
- 📦 **Minimal dependencies**: Few small dependencies, standard JS is favored.
- 🌐 **Cross-Environment Support**: Compatible with all major JS runtimes, including Node.js, Deno, Bun, and browser
  environments.
- 🔧 **Extensible**: Easily integrates with [viem](https://github.com/wevm/viem) and
  [ethers](https://github.com/ethers-io/ethers.js).
- 📚 **Documented**: Comprehensive documentation and usage examples, provided directly in JSDoc annotations within the
  source code.

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
deno add jsr:@nktkas/hyperliquid

# web (import directly)
import * as hl from "https://esm.sh/jsr/@nktkas/hyperliquid"
```

## Usage

### Initialize Transport

First, choose and configure your transport layer (more details in the [API Reference](#transports)):

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

Next, initialize the client with the transport layer (more details in the [API Reference](#clients)):

#### Create PublicClient

```typescript
import * as hl from "@nktkas/hyperliquid";

const transport = new hl.HttpTransport(); // or WebSocketTransport
const client = new hl.PublicClient({ transport });
```

#### Create WalletClient

```typescript
import * as hl from "@nktkas/hyperliquid";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { ethers } from "ethers";

const transport = new hl.HttpTransport(); // or WebSocketTransport

// 1. Using Viem with private key
const viemAccount = privateKeyToAccount("0x...");
const viemClient = new hl.WalletClient({ wallet: viemAccount, transport });

// 2. Using Ethers (or Ethers V5) with private key
const ethersWallet = new ethers.Wallet("0x...");
const ethersClient = new hl.WalletClient({ wallet: ethersWallet, transport });

// 3. Using external wallet (e.g. MetaMask) via Viem
const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
const externalWallet = createWalletClient({
    account,
    chain: arbitrum,
    transport: custom(window.ethereum),
});
const metamaskClient = new hl.WalletClient({ wallet: externalWallet, transport });
```

#### Create EventClient

```typescript
import * as hl from "@nktkas/hyperliquid";

const transport = new hl.WebSocketTransport();
const client = new hl.EventClient({ transport });
```

## API Reference

### Clients

A **Client** provides access to the Hyperliquid API endpoints.

There are three types of **Clients** in the sdk:

#### Public Client

A Public Client which provides access to
[Info API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint) and Explorer API, such as
`l2Book` and `clearinghouseState`.

The Public Client class sets up with a given [Transport](#transports).

```typescript
interface PublicClientParameters<T extends IRequestTransport = IRequestTransport> {
    transport: T; // HttpTransport or WebSocketTransport
}

class PublicClient<T extends IRESTTransport> {
    constructor(args: PublicClientParameters<T>);

    // Market
    allMids(): Promise<AllMids>;
    candleSnapshot(args: CandleSnapshotParameters): Promise<CandleSnapshot[]>;
    fundingHistory(args: FundingHistoryParameters): Promise<FundingHistory[]>;
    l2Book(args: L2BookParameters): Promise<L2Book>;
    meta(): Promise<Meta>;
    metaAndAssetCtxs(): Promise<MetaAndAssetCtxs>;
    predictedFundings(): Promise<PredictedFunding[]>;
    spotDeployState(args: SpotDeployStateParameters): Promise<SpotDeployState>;
    spotMeta(): Promise<SpotMeta>;
    spotMetaAndAssetCtxs(): Promise<SpotMetaAndAssetCtxs>;
    tokenDetails(args: TokenDetailsParameters): Promise<TokenDetails>;

    // Account
    clearinghouseState(args: ClearinghouseStateParameters): Promise<ClearinghouseState>;
    extraAgents(args: ExtraAgentsParameters): Promise<ExtraAgent[]>;
    maxBuilderFee(args: MaxBuilderFeeParameters): Promise<number>;
    referral(args: ReferralParameters): Promise<Referral>;
    spotClearinghouseState(args: SpotClearinghouseStateParameters): Promise<SpotClearinghouseState>;
    subAccounts(args: SubAccountsParameters): Promise<SubAccount[]>;
    userFees(args: UserFeesParameters): Promise<UserFees>;
    userFunding(args: UserFundingParameters): Promise<UserFunding[]>;
    userNonFundingLedgerUpdates(args: UserNonFundingLedgerUpdatesParameters): Promise<UserNonFundingLedgerUpdates[]>;
    userRateLimit(args: UserRateLimitParameters): Promise<UserRateLimit>;

    // Order
    frontendOpenOrders(args: FrontendOpenOrdersParameters): Promise<FrontendOpenOrder[]>;
    historicalOrders(args: HistoricalOrdersParameters): Promise<OrderStatus[]>;
    openOrders(args: OpenOrdersParameters): Promise<OpenOrder[]>;
    orderStatus(args: OrderStatusParameters): Promise<OrderStatusResponse>;
    twapHistory(args: TwapHistoryParameters): Promise<TwapHistory>;
    userFills(args: UserFillsParameters): Promise<UserFill[]>;
    userFillsByTime(args: UserFillsByTimeParameters): Promise<UserFill[]>;
    userTwapSliceFills(args: UserTwapSliceFillsParameters): Promise<UserTwapSliceFill[]>;

    // Vault
    userVaultEquities(args: UserVaultEquitiesParameters): Promise<UserVaultEquity[]>;
    vaultDetails(args: VaultDetailsParameters): Promise<VaultDetails | null>;
    vaultSummaries(): Promise<VaultSummary[]>;

    // Blockchain
    blockDetails(args: BlockDetailsParameters): Promise<BlockDetailsResponse>;
    txDetails(args: TxDetailsParameters): Promise<TxDetailsResponse>;
}
```

#### Wallet Client

A Wallet Client which provides access to
[Exchange API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint), such as `order`
and `withdraw3`.

The Wallet Client class sets up with a given [Transport](#transports) and a wallet instance, which can be a
[Viem Wallet](https://viem.sh/docs/clients/wallet) or an
[Ethers Wallet](https://docs.ethers.org/v6/api/providers/#Signer).

```typescript
interface WalletClientParameters<
    T extends ISubscriptionTransport,
    W extends AbstractViemWalletClient | AbstractEthersSigner | AbstractEthersV5Signer,
> {
    transport: T; // HttpTransport or WebSocketTransport
    wallet: W; // viem, ethers, or ethers v5
    isTestnet?: boolean; // Whether to use testnet API (default: false)
    defaultVaultAddress?: Hex; // Vault address used by default if not provided in method call
}

class WalletClient<
    T extends IRESTTransport,
    W extends AbstractViemWalletClient | AbstractEthersSigner | AbstractEthersV5Signer,
> {
    constructor(args: WalletClientParameters<T, W>);

    // Order Management
    batchModify(args: BatchModifyParameters): Promise<OrderResponseSuccess>;
    cancel(args: CancelParameters): Promise<CancelResponseSuccess>;
    cancelByCloid(args: CancelByCloidParameters): Promise<CancelResponseSuccess>;
    modify(args: ModifyParameters): Promise<SuccessResponse>;
    order(args: OrderParameters): Promise<OrderResponseSuccess>;
    scheduleCancel(args: ScheduleCancelParameters): Promise<SuccessResponse>;
    twapCancel(args: TwapCancelParameters): Promise<TwapCancelResponseSuccess>;
    twapOrder(args: TwapOrderParameters): Promise<TwapOrderResponseSuccess>;
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

#### Event Client

A Event Client which provides access to
[Subscriptions API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions), such as
real-time updates for `l2Book` and `userFills`.

The Event Client class sets up with a given [WebSocket Transport](#websocket-transport).

<!-- deno-fmt-ignore-start -->
```typescript
interface EventClientParameters<T extends ISubscriptionTransport> {
    transport: T; // WebSocketTransport
}

class EventClient<T extends ISubscriptionTransport> {
    constructor(args: EventClientParameters<T>);

    // Market Data
    activeAssetCtx(args: EventActiveAssetCtxParameters, listener: (data: WsActiveAssetCtx | WsActiveSpotAssetCtx) => void): Promise<Subscription>;
    activeAssetData(args: EventActiveAssetDataParameters, listener: (data: WsActiveAssetData) => void): Promise<Subscription>;
    allMids(listener: (data: WsAllMids) => void): Promise<Subscription>;
    candle(args: EventCandleParameters, listener: (data: Candle) => void): Promise<Subscription>;
    l2Book(args: EventL2BookParameters, listener: (data: Book) => void): Promise<Subscription>;
    trades(args: EventTradesParameters, listener: (data: WsTrade[]) => void): Promise<Subscription>;

    // Account/User Data
    notification(args: EventNotificationParameters, listener: (data: WsNotification) => void): Promise<Subscription>;
    userEvents(args: EventUserEventsParameters, listener: (data: WsUserEvent) => void): Promise<Subscription>;
    userFundings(args: EventUserFundingsParameters, listener: (data: WsUserFundings) => void): Promise<Subscription>;
    userNonFundingLedgerUpdates(args: EventUserNonFundingLedgerUpdatesParameters, listener: (data: WsUserNonFundingLedgerUpdates) => void): Promise<Subscription>;
    webData2(args: EventWebData2Parameters, listener: (data: WsWebData2) => void): Promise<Subscription>;

    // Order Management
    orderUpdates(args: EventOrderUpdatesParameters, listener: (data: OrderStatus) => void): Promise<Subscription>;
    userFills(args: EventUserFillsParameters, listener: (data: WsUserFills) => void): Promise<Subscription>;
    userTwapHistory(args: EventUserTwapHistory, listener: (data: WsUserTwapHistory) => void): Promise<Subscription>;
    userTwapSliceFills(args: EventUserTwapSliceFills, listener: (data: WsUserTwapSliceFills) => void): Promise<Subscription>;
}
```
<!-- deno-fmt-ignore-end -->

### Transports

A [Client](#clients) is instantiated with a **Transport**, which is the intermediary layer that is responsible for
executing outgoing requests (ie. API calls and event listeners).

There are two types of **Transports** in the sdk:

#### HTTP Transport

A HTTP Transport that executes requests via a [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch)
API.

```typescript
class HttpTransport implements IRequestTransport, HttpTransportOptions {
    constructor(options?: HttpTransportOptions);

    request(endpoint: "info" | "action" | "explorer", payload: unknown, signal?: AbortSignal): Promise<unknown>;
}

interface HttpTransportOptions {
    url?: string | URL; // Base URL for API endpoints (default: "https://api.hyperliquid.xyz")
    timeout?: number; // Request timeout in ms (default: 10_000)
    fetchOptions?: RequestInit; // A custom fetch options
    onRequest?: (request: Request) => MaybePromise<Request | void | null | undefined>; // A callback before request is sent
    onResponse?: (response: Response) => MaybePromise<Response | void | null | undefined>; // A callback after response is received
}
```

#### WebSocket Transport

A WebSocket Transport that executes requests and subscribes to events via a
[WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) connection.

```typescript
class WebSocketTransport implements IRESTTransport, ISubscriptionTransport {
    constructor(options?: WebSocketTransportOptions);

    request(endpoint: "info" | "action" | "explorer", payload: unknown, signal?: AbortSignal): Promise<unknown>;
    subscribe(
        channel: string,
        payload: unknown,
        listener: (data: CustomEvent) => void,
        signal?: AbortSignal,
    ): Promise<Subscription>;

    ready(signal?: AbortSignal): Promise<void>;
    close(signal?: AbortSignal): Promise<void>;
}

interface WebSocketTransportOptions {
    url?: string | URL; // WebSocket URL (default: "wss://api.hyperliquid.xyz/ws")
    timeout?: number; // Request timeout in ms (default: 10_000)
    keepAlive?: { // Keep-alive configuration
        interval?: number; // Ping interval in ms (default: 20_000)
    };
    reconnect?: { // Reconnection policy configuration for closed connections
        maxRetries?: number; // Maximum number of reconnection attempts (default: 3)
        connectionTimeout?: number; // Connection timeout in ms (default: 10_000)
        connectionDelay?: number | ((attempt: number) => number | Promise<number>); // Delay between reconnection (default: Exponential backoff (max 10s))
        shouldReconnect?: (event: CloseEvent) => boolean | Promise<boolean>; // Custom reconnection logic (default: Always reconnect)
        messageBuffer?: MessageBufferStrategy; // Message buffering strategy between reconnection (default: FIFO buffer)
        WebSocketConstructor?: typeof WebSocket; // Custom WebSocket constructor (default: globalThis.WebSocket)
    };
}
```

## Semantic Versioning

This library follows [Semantic Versioning](https://semver.org/) (or rather
[this proposal](https://github.com/semver/semver/pull/923)) for its releases.

> [!IMPORTANT]
> To avoid rapid increase in the main version of the SDK due to changes in Hyperliquid API types, such changes are
> reflected in updates to the patch version of this SDK.

## CI/CD and Release

Before publishing a new version of the SDK, tests are always run in
[Github Actions](https://github.com/nktkas/hyperliquid/actions). Only if all tests pass successfully, the process of
publishing the package takes place.

For more details, see our [CI/CD configuration files](./.github/workflows/).

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING](./CONTRIBUTING.md) file for guidelines on how to contribute to
this project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
