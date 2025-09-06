# Hyperliquid API TypeScript SDK

[![npm](https://img.shields.io/npm/v/@nktkas/hyperliquid?style=flat-square&color=blue)](https://www.npmjs.com/package/@nktkas/hyperliquid)
[![jsr](https://img.shields.io/jsr/v/@nktkas/hyperliquid?style=flat-square&color=blue)](https://jsr.io/@nktkas/hyperliquid)
[![coveralls](https://img.shields.io/coverallsCoverage/github/nktkas/hyperliquid?style=flat-square)](https://coveralls.io/github/nktkas/hyperliquid)
[![bundlephobia](https://img.shields.io/bundlephobia/minzip/@nktkas/hyperliquid?style=flat-square)](https://bundlephobia.com/package/@nktkas/hyperliquid)

Unofficial [Hyperliquid API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api) SDK for all major JS
runtimes, written in TypeScript.

## Features

- 🖋️ **Typed**: Source code is 100% TypeScript.
- 🧪 **Tested**: Good code coverage and type relevance.
- 📦 **Minimal dependencies**: A few small trusted dependencies.
- 🌐 **Cross-Environment Support**: Compatible with all major JS runtimes.
- 🔧 **Integratable**: Easy to use with wallet providers ([viem](https://github.com/wevm/viem),
  [ethers](https://github.com/ethers-io/ethers.js), private key directly).
- 📚 **Documented**: JSDoc annotations with usage examples in source code.

## Installation

> [!NOTE]
> While this library is in TypeScript, it can also be used in JavaScript and supports ESM/CommonJS.

### Node.js (choose your package manager)

```
npm i @nktkas/hyperliquid

pnpm add @nktkas/hyperliquid

yarn add @nktkas/hyperliquid
```

### Deno

```
deno add jsr:@nktkas/hyperliquid
```

### Web

```html
<script type="module">
    import * as hl from "https://esm.sh/jsr/@nktkas/hyperliquid";
</script>
```

### React Native

<details>
<summary>For React Native, you need to import polyfills before importing the SDK:</summary>

```js
// React Native v0.79 / Expo v53
// Issues:
// - signing: does not support private keys directly, use `viem` or `ethers`

import "event-target-polyfill";

if (!globalThis.CustomEvent) {
    globalThis.CustomEvent = function (type, params) {
        params = params || {};
        const event = new Event(type, params);
        event.detail = params.detail || null;
        return event;
    };
}

if (!AbortSignal.timeout) {
    AbortSignal.timeout = function (delay) {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), delay);
        return controller.signal;
    };
}

if (!Promise.withResolvers) {
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}
```

</details>

## Quick Start

### [Info endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint)

```ts
// 1. Import module
import * as hl from "@nktkas/hyperliquid";

// 2. Set up client with transport
const infoClient = new hl.InfoClient({
    transport: new hl.HttpTransport(), // or `WebSocketTransport`
});

// 3. Query data
const openOrders = await infoClient.openOrders({ user: "0x..." });
```

### [Exchange endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint)

```ts
// 1. Import module
import * as hl from "@nktkas/hyperliquid";

// 2. Set up client with wallet and transport
const exchClient = new hl.ExchangeClient({
    wallet: "0x...", // `viem`, `ethers`, or private key directly
    transport: new hl.HttpTransport(), // or `WebSocketTransport`
});

// 3. Execute an action
const result = await exchClient.order({
    orders: [{
        a: 0,
        b: true,
        p: "30000",
        s: "0.1",
        r: false,
        t: {
            limit: {
                tif: "Gtc",
            },
        },
    }],
    grouping: "na",
});
```

### [Subscription](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions)

```ts
// 1. Import module
import * as hl from "@nktkas/hyperliquid";

// 2. Set up client with transport
const subsClient = new hl.SubscriptionClient({
    transport: new hl.WebSocketTransport(),
});

// 3. Subscribe to events
const sub = await subsClient.allMids((event) => {
    console.log(event);
});
await sub.unsubscribe();
```

### [Multi-Sign](https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/multi-sig)

```ts
// 1. Import module
import * as hl from "@nktkas/hyperliquid";

// 2. Set up client with transport, multi-sign address, and signers
const multiSignClient = new hl.MultiSignClient({
    transport: new hl.HttpTransport(), // or `WebSocketTransport`
    multiSignAddress: "0x...",
    signers: [
        "0x...", // `viem`, `ethers`, or private key directly
    ],
});

// 3. Execute an action (same as `ExchangeClient`)
await multiSignClient.approveAgent({ agentAddress: "0x..." });
```

## Usage

### 1) Initialize Transport

First, choose and configure your transport layer (more details in the [API Reference](#transports)):

```ts
import * as hl from "@nktkas/hyperliquid";

// 1. HTTP Transport: suitable for one-time requests or serverless environments
const httpTransport = new hl.HttpTransport({...}); // Accepts optional parameters (e.g. isTestnet, timeout, etc.)

// 2. WebSocket Transport: has better network latency than HTTP transport
const wsTransport = new hl.WebSocketTransport({...}); // Accepts optional parameters (e.g. url, isTestnet, timeout, reconnect, etc.)
```

### 2) Initialize Client

Next, initialize a client with the transport layer (more details in the [API Reference](#clients)):

#### Create [InfoClient](#infoclient)

```ts
import * as hl from "@nktkas/hyperliquid";

const infoClient = new hl.InfoClient({
    transport: new hl.HttpTransport(), // or `WebSocketTransport`
});
```

#### Create [ExchangeClient](#exchangeclient)

```ts
import * as hl from "@nktkas/hyperliquid";
import { createWalletClient, custom } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ethers } from "ethers";

const transport = new hl.HttpTransport(); // or `WebSocketTransport`

// 1. Using private key directly
const privateKey = "0x...";
const exchClient = new hl.ExchangeClient({ wallet: privateKey, transport });

// 2. Using Viem
const viemAccount = privateKeyToAccount("0x...");
const exchClient = new hl.ExchangeClient({ wallet: viemAccount, transport });

// 3. Using Ethers (V5 or V6)
const ethersWallet = new ethers.Wallet("0x...");
const exchClient = new hl.ExchangeClient({ wallet: ethersWallet, transport });

// 4. Using external wallet (e.g. MetaMask) via Viem
const [account] = await window.ethereum.request({ method: "eth_requestAccounts" }) as `0x${string}`[];
const externalWallet = createWalletClient({ account, transport: custom(window.ethereum) });
const exchClient = new hl.ExchangeClient({ wallet: externalWallet, transport });
```

#### Create [SubscriptionClient](#subscriptionclient)

```ts
import * as hl from "@nktkas/hyperliquid";

const subsClient = new hl.SubscriptionClient({
    transport: new hl.WebSocketTransport(),
});
```

#### Create [MultiSignClient](#multisignclient)

```ts
import * as hl from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";
import { ethers } from "ethers";

const multiSignClient = new hl.MultiSignClient({
    transport: new hl.HttpTransport(), // or `WebSocketTransport`
    multiSignAddress: "0x...",
    signers: [
        privateKeyToAccount("0x..."), // first is leader for multi-sign transaction (signs transaction 2 times)
        new ethers.Wallet("0x..."),
        { // can be a custom async wallet
            async signTypedData(params: {
                domain: {
                    name: string;
                    version: string;
                    chainId: number;
                    verifyingContract: Hex;
                };
                types: {
                    [key: string]: {
                        name: string;
                        type: string;
                    }[];
                };
                primaryType: string;
                message: Record<string, unknown>;
            }): Promise<Hex> {
                // Custom signer logic
                return "0x..."; // return hex signature
            },
        },
        "0x...", // private key directly
        // ... more signers
    ],
});
```

### 3) Use Client

Finally, use client methods to interact with the Hyperliquid API (more details in the [API Reference](#clients)):

#### Example of using an [InfoClient](#infoclient)

```ts
import * as hl from "@nktkas/hyperliquid";

const infoClient = new hl.InfoClient({
    transport: new hl.HttpTransport(), // or `WebSocketTransport`
});

// L2 Book
const l2Book = await infoClient.l2Book({ coin: "ETH" });

// User clearinghouse state
const clearinghouseState = await infoClient.clearinghouseState({ user: "0x..." });

// User open orders
const openOrders = await infoClient.openOrders({ user: "0x..." });
```

#### Example of using an [ExchangeClient](#exchangeclient)

```ts
import * as hl from "@nktkas/hyperliquid";

const exchClient = new hl.ExchangeClient({
    wallet: "0x...", // `viem`, `ethers`, or private key directly
    transport: new hl.HttpTransport(), // or `WebSocketTransport`
});

// Place an orders
const result = await exchClient.order({
    orders: [{
        a: 0,
        b: true,
        p: "30000",
        s: "0.1",
        r: false,
        t: {
            limit: {
                tif: "Gtc",
            },
        },
    }],
    grouping: "na",
});

// Approve an agent
const result = await exchClient.approveAgent({ agentAddress: "0x..." });

// Withdraw funds
const result = await exchClient.withdraw3({ destination: "0x...", amount: "100" });
```

#### Example of using a [SubscriptionClient](#subscriptionclient)

```ts
import * as hl from "@nktkas/hyperliquid";

const subsClient = new hl.SubscriptionClient({
    transport: new hl.WebSocketTransport(),
});

// L2 Book updates
await subsClient.l2Book({ coin: "ETH" }, (data) => {
    console.log(data);
});

// User fills
await subsClient.userFills({ user: "0x..." }, (data) => {
    console.log(data);
});

// Candle updates
await subsClient.candle({ coin: "ETH", interval: "1h" }, (data) => {
    console.log(data);
});
```

#### Example of using a [MultiSignClient](#multisignclient)

```ts
import * as hl from "@nktkas/hyperliquid";

const multiSignClient = new hl.MultiSignClient({
    transport: new hl.HttpTransport(), // or `WebSocketTransport`
    multiSignAddress: "0x...",
    signers: [
        "0x...", // `viem`, `ethers`, or private key directly
        // ... more signers
    ],
});

// Interaction is the same as with `ExchangeClient`
```

## API Reference

### Clients

A client is an interface through which you can interact with the Hyperliquid API.

#### InfoClient

```ts
class InfoClient {
    constructor(args: {
        transport: HttpTransport | WebSocketTransport;
    });

    // Market
    allMids(params?: AllMidsParameters): Promise<AllMids>;
    candleSnapshot(params: CandleSnapshotParameters): Promise<Candle[]>;
    fundingHistory(params: FundingHistoryParameters): Promise<FundingHistory[]>;
    l2Book(params: L2BookParameters): Promise<Book>;
    liquidatable(): Promise<unknown[]>;
    marginTable(params: MarginTableParameters): Promise<MarginTable>;
    maxMarketOrderNtls(): Promise<[number, string][]>;
    meta(params?: MetaParameters): Promise<PerpsMeta>;
    metaAndAssetCtxs(params?: MetaAndAssetCtxsParameters): Promise<PerpsMetaAndAssetCtxs>;
    perpDeployAuctionStatus(): Promise<DeployAuctionStatus>;
    perpDexLimits(params: PerpDexLimitsParameters): Promise<PerpDexLimits | null>;
    perpDexs(): Promise<(PerpDex | null)[]>;
    perpsAtOpenInterestCap(params?: PerpsAtOpenInterestCapParameters): Promise<string[]>;
    predictedFundings(): Promise<PredictedFunding[]>;
    recentTrades(params: RecentTradesParameters): Promise<Trade[]>;
    spotDeployState(params: SpotDeployStateParameters): Promise<SpotDeployState>;
    spotMeta(): Promise<SpotMeta>;
    spotMetaAndAssetCtxs(): Promise<SpotMetaAndAssetCtxs>;
    spotPairDeployAuctionStatus(): Promise<DeployAuctionStatus>;
    tokenDetails(params: TokenDetailsParameters): Promise<TokenDetails>;

    // Account
    activeAssetData(params: ActiveAssetDataParameters): Promise<ActiveAssetData>;
    clearinghouseState(params: ClearinghouseStateParameters): Promise<PerpsClearinghouseState>;
    extraAgents(params: ExtraAgentsParameters): Promise<ExtraAgent[]>;
    isVip(params: IsVipParameters): Promise<boolean | null>;
    legalCheck(params: LegalCheckParameters): Promise<LegalCheck>;
    maxBuilderFee(params: MaxBuilderFeeParameters): Promise<number>;
    portfolio(params: PortfolioParameters): Promise<PortfolioPeriods>;
    preTransferCheck(params: PreTransferCheckParameters): Promise<PreTransferCheck>;
    referral(params: ReferralParameters): Promise<Referral>;
    spotClearinghouseState(params: SpotClearinghouseStateParameters): Promise<SpotClearinghouseState>;
    subAccounts(params: SubAccountsParameters): Promise<SubAccount[] | null>;
    userFees(params: UserFeesParameters): Promise<UserFees>;
    userFunding(params: UserFundingParameters): Promise<UserFundingUpdate[]>;
    userNonFundingLedgerUpdates(params: UserNonFundingLedgerUpdatesParameters): Promise<UserNonFundingLedgerUpdate[]>;
    userRateLimit(params: UserRateLimitParameters): Promise<UserRateLimit>;
    userRole(params: UserRoleParameters): Promise<UserRole>;
    userToMultiSigSigners(params: UserToMultiSigSignersParameters): Promise<MultiSigSigners | null>;

    // Order
    frontendOpenOrders(params: FrontendOpenOrdersParameters): Promise<FrontendOrder[]>;
    historicalOrders(params: HistoricalOrdersParameters): Promise<FrontendOrderStatus[]>;
    openOrders(params: OpenOrdersParameters): Promise<Order[]>;
    orderStatus(params: OrderStatusParameters): Promise<OrderLookup>;
    twapHistory(params: TwapHistoryParameters): Promise<TwapHistory[]>;
    userFills(params: UserFillsParameters): Promise<Fill[]>;
    userFillsByTime(params: UserFillsByTimeParameters): Promise<Fill[]>;
    userTwapSliceFills(params: UserTwapSliceFillsParameters): Promise<TwapSliceFill[]>;
    userTwapSliceFillsByTime(params: UserTwapSliceFillsByTimeParameters): Promise<TwapSliceFill[]>;

    // Validator
    gossipRootIps(): Promise<GossipRootIps>;
    delegations(params: DelegationsParameters): Promise<Delegation[]>;
    delegatorHistory(params: DelegatorHistoryParameters): Promise<DelegatorUpdate[]>;
    delegatorRewards(params: DelegatorRewardsParameters): Promise<DelegatorReward[]>;
    delegatorSummary(params: DelegatorSummaryParameters): Promise<DelegatorSummary>;
    validatorL1Votes(): Promise<unknown[]>;
    validatorSummaries(): Promise<ValidatorSummary[]>;

    // Vault
    leadingVaults(params: LeadingVaultsParameters): Promise<VaultLeading[]>;
    userVaultEquities(params: UserVaultEquitiesParameters): Promise<VaultEquity[]>;
    vaultDetails(params: VaultDetailsParameters): Promise<VaultDetails | null>;
    vaultSummaries(): Promise<VaultSummary[]>;

    // Server
    exchangeStatus(): Promise<ExchangeStatus>;

    // Explorer (RPC endpoint)
    blockDetails(params: BlockDetailsParameters): Promise<BlockDetails>;
    txDetails(params: TxDetailsParameters): Promise<TxDetails>;
    userDetails(params: UserDetailsParameters): Promise<TxDetails[]>;
}
```

#### ExchangeClient

```ts
class ExchangeClient {
    constructor(args: {
        transport: HttpTransport | WebSocketTransport;
        wallet: AbstractWallet; // `viem`, `ethers` (v5 or v6), or private key directly
        defaultVaultAddress?: Hex; // Vault address used by default if not provided in method call
        signatureChainId?: Hex | (() => MaybePromise<Hex>); // Chain ID used for signing (default: get chain id from wallet otherwise `0x1`)
        nonceManager?: () => MaybePromise<number>; // Function to get the next nonce (default: monotonically incrementing `Date.now()`)
    });

    // Order
    batchModify(params: BatchModifyParameters): Promise<OrderResponseSuccess>;
    cancel(params: CancelParameters): Promise<CancelResponseSuccess>;
    cancelByCloid(params: CancelByCloidParameters): Promise<CancelResponseSuccess>;
    modify(params: ModifyParameters): Promise<SuccessResponse>;
    order(params: OrderParameters): Promise<OrderResponseSuccess>;
    scheduleCancel(params?: ScheduleCancelParameters): Promise<SuccessResponse>;
    twapCancel(params: TwapCancelParameters): Promise<TwapCancelResponseSuccess>;
    twapOrder(params: TwapOrderParameters): Promise<TwapOrderResponseSuccess>;
    updateIsolatedMargin(params: UpdateIsolatedMarginParameters): Promise<SuccessResponse>;
    updateLeverage(params: UpdateLeverageParameters): Promise<SuccessResponse>;

    // Account
    approveAgent(params: ApproveAgentParameters): Promise<SuccessResponse>;
    approveBuilderFee(params: ApproveBuilderFeeParameters): Promise<SuccessResponse>;
    claimRewards(): Promise<SuccessResponse>;
    createSubAccount(params: CreateSubAccountParameters): Promise<CreateSubAccountResponse>;
    evmUserModify(params: EvmUserModifyParameters): Promise<SuccessResponse>;
    noop(): Promise<SuccessResponse>;
    registerReferrer(params: RegisterReferrerParameters): Promise<SuccessResponse>;
    reserveRequestWeight(params: ReserveRequestWeightParameters): Promise<SuccessResponse>;
    setDisplayName(params: SetDisplayNameParameters): Promise<SuccessResponse>;
    setReferrer(params: SetReferrerParameters): Promise<SuccessResponse>;
    subAccountModify(params: SubAccountModifyParameters): Promise<SuccessResponse>;
    spotUser(params: SpotUserParameters): Promise<SuccessResponse>;

    // Transfer
    sendAsset(params: SendAssetParameters): Promise<SuccessResponse>;
    spotSend(params: SpotSendParameters): Promise<SuccessResponse>;
    subAccountSpotTransfer(params: SubAccountSpotTransferParameters): Promise<SuccessResponse>;
    subAccountTransfer(params: SubAccountTransferParameters): Promise<SuccessResponse>;
    usdClassTransfer(params: UsdClassTransferParameters): Promise<SuccessResponse>;
    usdSend(params: UsdSendParameters): Promise<SuccessResponse>;
    withdraw3(params: Withdraw3Parameters): Promise<SuccessResponse>;

    // Staking
    cDeposit(params: CDepositParameters): Promise<SuccessResponse>;
    cWithdraw(params: CWithdrawParameters): Promise<SuccessResponse>;
    tokenDelegate(params: TokenDelegateParameters): Promise<SuccessResponse>;

    // Market
    perpDeploy(params: PerpDeployParameters): Promise<SuccessResponse>;
    spotDeploy(params: SpotDeployParameters): Promise<SuccessResponse>;

    // Vault
    createVault(params: CreateVaultParameters): Promise<CreateVaultResponse>;
    vaultDistribute(params: VaultDistributeParameters): Promise<SuccessResponse>;
    vaultModify(params: VaultModifyParameters): Promise<SuccessResponse>;
    vaultTransfer(params: VaultTransferParameters): Promise<SuccessResponse>;

    // Multi-Sign
    convertToMultiSigUser(params: ConvertToMultiSigUserParameters): Promise<SuccessResponse>;
    multiSig(params: MultiSigParameters): Promise<
        | SuccessResponse
        | CancelSuccessResponse
        | CreateSubAccountResponse
        | CreateVaultResponse
        | OrderSuccessResponse
        | TwapOrderSuccessResponse
        | TwapCancelSuccessResponse
    >;

    // Validator
    cSignerAction(params: CSignerActionParameters): Promise<SuccessResponse>;
    cValidatorAction(params: CValidatorActionParameters): Promise<SuccessResponse>;
}
```

#### SubscriptionClient

<!-- deno-fmt-ignore-start -->
```ts
class SubscriptionClient {
    constructor(args: {
        transport: WebSocketTransport;
    });

    // Market
    activeAssetCtx(params: WsActiveAssetCtxParameters, listener: (data: WsActiveAssetCtx | WsActiveSpotAssetCtx) => void): Promise<Subscription>;
    allMids(params?: WsAllMidsParameters, listener: (data: WsAllMids) => void): Promise<Subscription>;
    assetCtxs(params?: WsAssetCtxsParameters, listener: (data: WsAssetCtxs) => void): Promise<Subscription>;
    bbo(params: WsBboParameters, listener: (data: WsBbo) => void): Promise<Subscription>;
    candle(params: WsCandleParameters, listener: (data: Candle) => void): Promise<Subscription>;
    l2Book(params: WsL2BookParameters, listener: (data: Book) => void): Promise<Subscription>;
    trades(params: WsTradesParameters, listener: (data: WsTrade[]) => void): Promise<Subscription>;

    // Account
    activeAssetData(params: WsActiveAssetDataParameters, listener: (data: ActiveAssetData) => void): Promise<Subscription>;
    clearinghouseState(params: WsClearinghouseStateParameters, listener: (data: WsClearinghouseState) => void): Promise<Subscription>;
    notification(params: WsNotificationParameters, listener: (data: WsNotification) => void): Promise<Subscription>;
    userEvents(params: WsUserEventsParameters, listener: (data: WsUserEvent) => void): Promise<Subscription>;
    userFundings(params: WsUserFundingsParameters, listener: (data: WsUserFundings) => void): Promise<Subscription>;
    userNonFundingLedgerUpdates(params: WsUserNonFundingLedgerUpdatesParameters, listener: (data: WsUserNonFundingLedgerUpdates) => void): Promise<Subscription>;
    webData2(params: WsWebData2Parameters, listener: (data: WsWebData2) => void): Promise<Subscription>;

    // Order
    openOrders(params: WsOpenOrdersParameters, listener: (data: WsOpenOrders) => void): Promise<Subscription>;
    orderUpdates(params: WsOrderUpdatesParameters, listener: (data: OrderStatus[]) => void): Promise<Subscription>;
    userFills(params: WsUserFillsParameters, listener: (data: WsUserFills) => void): Promise<Subscription>;
    userTwapHistory(params: WsUserTwapHistoryParameters, listener: (data: WsUserTwapHistory) => void): Promise<Subscription>;
    userTwapSliceFills(params: WsUserTwapSliceFillsParameters, listener: (data: WsUserTwapSliceFills) => void): Promise<Subscription>;

    // Explorer (RPC endpoint)
    explorerBlock(listener: (data: WsBlockDetails[]) => void): Promise<Subscription>;
    explorerTxs(listener: (data: TxDetails[]) => void): Promise<Subscription>;
}
```
<!-- deno-fmt-ignore-end -->

#### MultiSignClient

```ts
class MultiSignClient extends ExchangeClient {
    constructor(
        args:
            & Omit<ExchangeClientParameters, "wallet"> // instead of `wallet`, you should specify the following parameters:
            & {
                multiSignAddress: Hex;
                signers: [
                    AbstractWallet, // first is leader for multi-sign transaction (signs transaction 2 times)
                    ...AbstractWallet[], // may be additional signers
                ];
            },
    );

    // Same methods as `ExchangeClient`
}
```

### Transports

Transport acts as a layer between class requests and Hyperliquid servers.

#### HTTP Transport

**Features:**

- Uses [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for requests. Can be configured using
  [`fetchOptions`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit).
- Automatically determines the target URL based on the request + `isTestnet` flag.

```ts
class HttpTransport {
    constructor(options?: {
        isTestnet?: boolean; // Whether to use testnet url (default: false)
        timeout?: number; // Request timeout in ms (default: 10_000)
        server?: { // Custom server URLs
            mainnet?: { api?: string | URL; rpc?: string | URL };
            testnet?: { api?: string | URL; rpc?: string | URL };
        };
        fetchOptions?: RequestInit; // A custom fetch options
        onRequest?: (request: Request) => MaybePromise<Request | void | null | undefined>; // A callback before request is sent
        onResponse?: (response: Response) => MaybePromise<Response | void | null | undefined>; // A callback after response is received
    });
}
```

#### WebSocket Transport

**Features:**

- Uses [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) for requests.
- Supports [subscriptions](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions)
  and [post requests](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests).
- Automatically restores connection after loss and resubscribes to previous subscriptions.
- Smart keep alive (pings only when idle).
- Lazy initialization with message buffering during connection establishment.

**Limitations:**

- Cannot mix api/explorer endpoints or mainnet/testnet in single connection. Need to create separate instances for
  different endpoints.
- Cannot send explorer post-requests via WebSocket. Use [HTTP transport](#http-transport).

```ts
class WebSocketTransport {
    constructor(options?: {
        url?: string | URL; // WebSocket URL (default: "wss://api.hyperliquid.xyz/ws")
        isTestnet?: boolean; // Indicates this transport uses testnet endpoint (default: false)
        timeout?: number; // Request timeout in ms (default: 10_000)
        keepAlive?: {
            interval?: number; // Ping interval in ms (default: 30_000)
            timeout?: number; // Pong timeout in ms (default: same as `timeout` for requests)
        };
        reconnect?: {
            maxRetries?: number; // Maximum number of reconnection attempts (default: 3)
            connectionTimeout?: number; // Connection timeout in ms (default: 10_000)
            connectionDelay?: number | ((attempt: number) => number | Promise<number>); // Delay between reconnection (default: Exponential backoff (max 10s))
            shouldReconnect?: (event: CloseEvent) => boolean | Promise<boolean>; // Custom reconnection logic (default: Always reconnect)
            messageBuffer?: MessageBufferStrategy; // Message buffering strategy between reconnection (default: FIFO buffer)
        };
        autoResubscribe?: boolean; // Whether to automatically resubscribe to events after reconnection (default: true)
    });
    ready(signal?: AbortSignal): Promise<void>;
    close(signal?: AbortSignal): Promise<void>;
}
```

## Additional Import Points

### `/schemas`

This module provides [valibot](https://valibot.dev) schemas for validating, formatting, and inferring types for data
used in the Hyperliquid API.

```ts
import { OrderRequest, parser } from "@nktkas/hyperliquid/schemas";
//       ^^^^^^^^^^^^
//       both a valibot schema and a typescript type

const action = {
    type: "order",
    orders: [{
        a: 0,
        b: true,
        p: "50000",
        s: "0.1",
        r: false,
        t: { limit: { tif: "Gtc" } },
    }],
    grouping: "na",
} satisfies OrderRequest["action"]; // can be used as type

//                             or as valibot schema
//                             ⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄
const validatedAction = parser(OrderRequest.entries.action)(action);
//                      ^^^^^^
//                      validates, formats, sorts object keys for correct signature generation
//                      and returns typed data
```

Also valibot schema can be converted to JSON Schema:

```ts
import { OrderRequest } from "@nktkas/hyperliquid/schemas";
import { toJsonSchema } from "@valibot/to-json-schema";

const schema = toJsonSchema(OrderRequest, { errorMode: "ignore" });

console.log(JSON.stringify(schema, null, 2));
// {
//   "$schema": "http://json-schema.org/draft-07/schema#",
//   "type": "object",
//   "properties": {
//     "action": {
//       "type": "object",
//       "properties": {
//         "type": { "const": "order" },
//         "orders": { "type": "array", "items": {...} },
//         "grouping": { "anyOf": [...] },
//         "builder": { "type": "object", ... }
//       },
//       "required": ["type", "orders", "grouping"]
//     },
//     "nonce": { "type": "number" },
//     "signature": {
//       "type": "object",
//       "properties": {
//         "r": { "type": "string", ... },
//         "s": { "type": "string", ... },
//         "v": { "anyOf": [{"const": 27}, {"const": 28}] }
//       },
//       "required": ["r", "s", "v"]
//     },
//     "vaultAddress": { "type": "string", ... },
//     "expiresAfter": { "type": "number" }
//   },
//   "required": ["action", "nonce", "signature"]
// }
```

### `/signing`

This module contains functions for generating Hyperliquid transaction signatures.

#### L1 Action

```ts
import { signL1Action } from "@nktkas/hyperliquid/signing";
import { CancelRequest, parser } from "@nktkas/hyperliquid/schemas";

const privateKey = "0x..."; // `viem`, `ethers`, or private key directly

const action = parser(CancelRequest.entries.action)({ // for correct signature generation
    type: "cancel",
    cancels: [
        { a: 0, o: 12345 },
    ],
});
const nonce = Date.now();

const signature = await signL1Action({ wallet: privateKey, action, nonce });

// Send the signed action to the Hyperliquid API
const response = await fetch("https://api.hyperliquid.xyz/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, signature, nonce }),
});
const body = await response.json();
```

#### User Signed Action

```ts
import { signUserSignedAction, userSignedActionEip712Types } from "@nktkas/hyperliquid/signing";
import { ApproveAgentRequest, parser } from "@nktkas/hyperliquid/schemas";

const privateKey = "0x..."; // `viem`, `ethers`, or private key directly

const action = parser(ApproveAgentRequest.entries.action)({ // for correct signature generation
    type: "approveAgent",
    signatureChainId: "0x66eee",
    hyperliquidChain: "Mainnet",
    agentAddress: "0x...",
    agentName: "Agent",
    nonce: Date.now(),
});

const signature = await signUserSignedAction({
    wallet: privateKey,
    action,
    types: userSignedActionEip712Types[action.type],
});

// Send the signed action to the Hyperliquid API
const response = await fetch("https://api.hyperliquid.xyz/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, signature, nonce: action.nonce }),
});
const body = await response.json();
```

## FAQ

### How to execute an L1 action via an external wallet (e.g. MetaMask)?

Hyperliquid requires chain `1337` for L1 action signatures. To handle this with external wallets:

- (recommended) Create an
  [Agent Wallet](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#api-wallets)
  and execute all L1 actions through it
- Change a user's chain to `1337`, however, the user will sign unreadable data

### How to create a market order?

Hyperliquid doesn't have traditional market orders, but you can achieve market-like execution by placing limit order
with `tif: "Ioc"` and price that guarantee immediate execution:

- For buys: set limit price >= current best ask
- For sells: set limit price <= current best bid

### How to use the [Agent Wallet](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#api-wallets) / [Vault](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#subaccounts-and-vaults) / [Sub-Account](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#subaccounts-and-vaults) in `ExchangeClient`?

**Agent Wallet**: Use agent's private key in constructor instead of master account's private key.

**Vault and Sub-Account**: Pass vault or sub-account address via `vaultAddress` options to methods or set
`defaultVaultAddress` in constructor.

### How to use Testnet?

[**HttpTransport**](#http-transport): Set the `isTestnet` flag to `true`.

[**WebSocketTransport**](#websocket-transport): Set the `isTestnet` flag to `true` and provide the testnet `url` when initializing the transport.

## Contributing

We appreciate your help! To contribute, please read the [contributing instructions](CONTRIBUTING.md).
