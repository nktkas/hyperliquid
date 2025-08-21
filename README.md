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
const wsTransport = new hl.WebSocketTransport({...}); // Accepts optional parameters (e.g. url, timeout, reconnect, etc.)
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
    allMids(): Promise<AllMids>;
    candleSnapshot(args: CandleSnapshotParameters): Promise<Candle[]>;
    fundingHistory(args: FundingHistoryParameters): Promise<FundingHistory[]>;
    l2Book(args: L2BookParameters): Promise<Book>;
    liquidatable(): Promise<unknown[]>;
    marginTable(args: MarginTableParameters): Promise<MarginTable>;
    maxMarketOrderNtls(): Promise<[number, string][]>;
    meta(): Promise<PerpsMeta>;
    metaAndAssetCtxs(): Promise<PerpsMetaAndAssetCtxs>;
    perpDeployAuctionStatus(): Promise<DeployAuctionStatus>;
    perpDexs(): Promise<(PerpDex | null)[]>;
    perpsAtOpenInterestCap(): Promise<string[]>;
    predictedFundings(): Promise<PredictedFunding[]>;
    spotDeployState(args: SpotDeployStateParameters): Promise<SpotDeployState>;
    spotMeta(): Promise<SpotMeta>;
    spotMetaAndAssetCtxs(): Promise<SpotMetaAndAssetCtxs>;
    spotPairDeployAuctionStatus(): Promise<DeployAuctionStatus>;
    tokenDetails(args: TokenDetailsParameters): Promise<TokenDetails>;

    // Account
    activeAssetData(args: ActiveAssetDataParameters): Promise<ActiveAssetData>;
    clearinghouseState(args: ClearinghouseStateParameters): Promise<PerpsClearinghouseState>;
    extraAgents(args: ExtraAgentsParameters): Promise<ExtraAgent[]>;
    isVip(args: IsVipParameters): Promise<boolean>;
    legalCheck(args: LegalCheckParameters): Promise<LegalCheck>;
    maxBuilderFee(args: MaxBuilderFeeParameters): Promise<number>;
    portfolio(args: PortfolioParameters): Promise<PortfolioPeriods>;
    preTransferCheck(args: PreTransferCheckParameters): Promise<PreTransferCheck>;
    referral(args: ReferralParameters): Promise<Referral>;
    spotClearinghouseState(args: SpotClearinghouseStateParameters): Promise<SpotClearinghouseState>;
    subAccounts(args: SubAccountsParameters): Promise<SubAccount[] | null>;
    userFees(args: UserFeesParameters): Promise<UserFees>;
    userFunding(args: UserFundingParameters): Promise<UserFundingUpdate[]>;
    userNonFundingLedgerUpdates(args: UserNonFundingLedgerUpdatesParameters): Promise<UserNonFundingLedgerUpdate[]>;
    userRateLimit(args: UserRateLimitParameters): Promise<UserRateLimit>;
    userRole(args: UserRoleParameters): Promise<UserRole>;
    userToMultiSigSigners(args: UserToMultiSigSignersParameters): Promise<MultiSigSigners | null>;

    // Order
    frontendOpenOrders(args: FrontendOpenOrdersParameters): Promise<FrontendOrder[]>;
    historicalOrders(args: HistoricalOrdersParameters): Promise<OrderStatus<FrontendOrder>[]>;
    openOrders(args: OpenOrdersParameters): Promise<Order[]>;
    orderStatus(args: OrderStatusParameters): Promise<OrderLookup>;
    twapHistory(args: TwapHistoryParameters): Promise<TwapHistory[]>;
    userFills(args: UserFillsParameters): Promise<Fill[]>;
    userFillsByTime(args: UserFillsByTimeParameters): Promise<Fill[]>;
    userTwapSliceFills(args: UserTwapSliceFillsParameters): Promise<TwapSliceFill[]>;
    userTwapSliceFillsByTime(args: UserTwapSliceFillsByTimeParameters): Promise<TwapSliceFill[]>;

    // Validator
    delegations(args: DelegationsParameters): Promise<Delegation[]>;
    delegatorHistory(args: DelegatorHistoryParameters): Promise<DelegatorUpdate[]>;
    delegatorRewards(args: DelegatorRewardsParameters): Promise<DelegatorReward[]>;
    delegatorSummary(args: DelegatorSummaryParameters): Promise<DelegatorSummary>;
    validatorL1Votes(): Promise<unknown[]>;
    validatorSummaries(): Promise<ValidatorSummary[]>;

    // Vault
    leadingVaults(args: LeadingVaultsParameters): Promise<VaultLeading[]>;
    userVaultEquities(args: UserVaultEquitiesParameters): Promise<VaultEquity[]>;
    vaultDetails(args: VaultDetailsParameters): Promise<VaultDetails | null>;
    vaultSummaries(): Promise<VaultSummary[]>;

    // Server
    exchangeStatus(): Promise<ExchangeStatus>;

    // Explorer (RPC endpoint)
    blockDetails(args: BlockDetailsParameters): Promise<BlockDetails>;
    txDetails(args: TxDetailsParameters): Promise<TxDetails>;
    userDetails(args: UserDetailsParameters): Promise<TxDetails[]>;
}
```

#### ExchangeClient

```ts
class ExchangeClient {
    constructor(args: {
        transport: HttpTransport | WebSocketTransport;
        wallet: AbstractWallet; // `viem`, `ethers` (v5 or v6), or private key directly
        isTestnet?: boolean; // Whether to use testnet (default: false)
        defaultVaultAddress?: Hex; // Vault address used by default if not provided in method call
        signatureChainId?: Hex | (() => MaybePromise<Hex>); // Chain ID used for signing (default: get chain id from wallet otherwise `0x1`)
        nonceManager?: () => MaybePromise<number>; // Function to get the next nonce (default: monotonically incrementing `Date.now()`)
    });

    // Order
    batchModify(args: BatchModifyParameters): Promise<OrderResponseSuccess>;
    cancel(args: CancelParameters): Promise<CancelResponseSuccess>;
    cancelByCloid(args: CancelByCloidParameters): Promise<CancelResponseSuccess>;
    modify(args: ModifyParameters): Promise<SuccessResponse>;
    order(args: OrderParameters): Promise<OrderResponseSuccess>;
    scheduleCancel(args?: ScheduleCancelParameters): Promise<SuccessResponse>;
    twapCancel(args: TwapCancelParameters): Promise<TwapCancelResponseSuccess>;
    twapOrder(args: TwapOrderParameters): Promise<TwapOrderResponseSuccess>;
    updateIsolatedMargin(args: UpdateIsolatedMarginParameters): Promise<SuccessResponse>;
    updateLeverage(args: UpdateLeverageParameters): Promise<SuccessResponse>;

    // Account
    approveAgent(args: ApproveAgentParameters): Promise<SuccessResponse>;
    approveBuilderFee(args: ApproveBuilderFeeParameters): Promise<SuccessResponse>;
    claimRewards(): Promise<SuccessResponse>;
    createSubAccount(args: CreateSubAccountParameters): Promise<CreateSubAccountResponse>;
    evmUserModify(args: EvmUserModifyParameters): Promise<SuccessResponse>;
    noop(): Promise<SuccessResponse>;
    registerReferrer(args: RegisterReferrerParameters): Promise<SuccessResponse>;
    reserveRequestWeight(args: ReserveRequestWeightParameters): Promise<SuccessResponse>;
    setDisplayName(args: SetDisplayNameParameters): Promise<SuccessResponse>;
    setReferrer(args: SetReferrerParameters): Promise<SuccessResponse>;
    subAccountModify(args: SubAccountModifyParameters): Promise<SuccessResponse>;
    spotUser(args: SpotUserParameters): Promise<SuccessResponse>;

    // Transfer
    sendAsset(args: SendAssetParameters): Promise<SuccessResponse>;
    spotSend(args: SpotSendParameters): Promise<SuccessResponse>;
    subAccountSpotTransfer(args: SubAccountSpotTransferParameters): Promise<SuccessResponse>;
    subAccountTransfer(args: SubAccountTransferParameters): Promise<SuccessResponse>;
    usdClassTransfer(args: UsdClassTransferParameters): Promise<SuccessResponse>;
    usdSend(args: UsdSendParameters): Promise<SuccessResponse>;
    withdraw3(args: Withdraw3Parameters): Promise<SuccessResponse>;

    // Staking
    cDeposit(args: CDepositParameters): Promise<SuccessResponse>;
    cWithdraw(args: CWithdrawParameters): Promise<SuccessResponse>;
    tokenDelegate(args: TokenDelegateParameters): Promise<SuccessResponse>;

    // Market
    perpDeploy(args: PerpDeployParameters): Promise<SuccessResponse>;
    spotDeploy(args: SpotDeployParameters): Promise<SuccessResponse>;

    // Vault
    createVault(args: CreateVaultParameters): Promise<CreateVaultResponse>;
    vaultDistribute(args: VaultDistributeParameters): Promise<SuccessResponse>;
    vaultModify(args: VaultModifyParameters): Promise<SuccessResponse>;
    vaultTransfer(args: VaultTransferParameters): Promise<SuccessResponse>;

    // Multi-Sign
    convertToMultiSigUser(args: ConvertToMultiSigUserParameters): Promise<SuccessResponse>;
    multiSig(args: MultiSigParameters): Promise<BaseExchangeResponse>;

    // Validator
    cSignerAction(args: CSignerActionParameters): Promise<SuccessResponse>;
    cValidatorAction(args: CValidatorActionParameters): Promise<SuccessResponse>;
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
    activeAssetCtx(args: EventActiveAssetCtxParameters, listener: (data: WsActiveAssetCtx | WsActiveSpotAssetCtx) => void): Promise<Subscription>;
    allMids(listener: (data: WsAllMids) => void): Promise<Subscription>;
    bbo(args: EventBboParameters, listener: (data: WsBbo) => void): Promise<Subscription>;
    candle(args: EventCandleParameters, listener: (data: Candle) => void): Promise<Subscription>;
    l2Book(args: EventL2BookParameters, listener: (data: Book) => void): Promise<Subscription>;
    trades(args: EventTradesParameters, listener: (data: WsTrade[]) => void): Promise<Subscription>;

    // Account
    activeAssetData(args: EventActiveAssetDataParameters, listener: (data: ActiveAssetData) => void): Promise<Subscription>;
    notification(args: EventNotificationParameters, listener: (data: WsNotification) => void): Promise<Subscription>;
    userEvents(args: EventUserEventsParameters, listener: (data: WsUserEvent) => void): Promise<Subscription>;
    userFundings(args: EventUserFundingsParameters, listener: (data: WsUserFundings) => void): Promise<Subscription>;
    userNonFundingLedgerUpdates(args: EventUserNonFundingLedgerUpdatesParameters, listener: (data: WsUserNonFundingLedgerUpdates) => void): Promise<Subscription>;
    webData2(args: EventWebData2Parameters, listener: (data: WsWebData2) => void): Promise<Subscription>;

    // Order
    orderUpdates(args: EventOrderUpdatesParameters, listener: (data: OrderStatus<Order>[]) => void): Promise<Subscription>;
    userFills(args: EventUserFillsParameters, listener: (data: WsUserFills) => void): Promise<Subscription>;
    userTwapHistory(args: EventUserTwapHistory, listener: (data: WsUserTwapHistory) => void): Promise<Subscription>;
    userTwapSliceFills(args: EventUserTwapSliceFills, listener: (data: WsUserTwapSliceFills) => void): Promise<Subscription>;

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

### `/types`

The import point gives access to all request/response types associated with Hyperliquid API.

### `/signing`

The import point gives access to functions that generate signatures for Hyperliquid API actions.

#### L1 Action

```ts
import { actionSorter, signL1Action } from "@nktkas/hyperliquid/signing";

const action = actionSorter.cancel({
    type: "cancel",
    cancels: [
        { a: 0, o: 12345 },
    ],
});
const nonce = Date.now();

const signature = await signL1Action({
    wallet: "0x...", // `viem`, `ethers`, or private key directly
    action,
    nonce,
});

// Send the signed action to the Hyperliquid API
const response = await fetch("https://api.hyperliquid.xyz/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, signature, nonce }), // recommended to send the same formatted action
});
const body = await response.json();
```

#### User Signed Action

```ts
import { actionSorter, signUserSignedAction, userSignedActionEip712Types } from "@nktkas/hyperliquid/signing";

const action = actionSorter.approveAgent({
    type: "approveAgent",
    signatureChainId: "0x66eee",
    hyperliquidChain: "Mainnet",
    agentAddress: "0x...",
    agentName: "Agent",
    nonce: Date.now(),
});

const signature = await signUserSignedAction({
    wallet: "0x...", // `viem`, `ethers`, or private key directly
    action,
    types: userSignedActionEip712Types[action.type],
});

// Send the signed action to the Hyperliquid API
const response = await fetch("https://api.hyperliquid.xyz/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, signature, nonce: action.nonce }), // recommended to send the same formatted action
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

## Contributing

We appreciate your help! To contribute, please read the [contributing instructions](CONTRIBUTING.md).
