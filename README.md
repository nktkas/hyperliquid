# Hyperliquid API TypeScript SDK

[![NPM](https://img.shields.io/npm/v/@nktkas/hyperliquid?style=flat-square&color=blue)](https://www.npmjs.com/package/@nktkas/hyperliquid)
[![JSR](https://img.shields.io/jsr/v/@nktkas/hyperliquid?style=flat-square&color=blue)](https://jsr.io/@nktkas/hyperliquid)
[![Coveralls](https://img.shields.io/coverallsCoverage/github/nktkas/hyperliquid?style=flat-square)](https://coveralls.io/github/nktkas/hyperliquid)
[![bundlejs](https://img.shields.io/bundlejs/size/@nktkas/hyperliquid?style=flat-square)](https://bundlejs.com/?q=@nktkas/hyperliquid)

Unofficial [Hyperliquid API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api) SDK for all major JS
runtimes, written in TypeScript and provided with tests.

## Features

- 🖋️ **Typed**: Source code is 100% TypeScript.
- 🧪 **Tested**: Good code coverage and type-safe API responses.
- 📦 **Minimal dependencies**: A few small trusted dependencies.
- 🌐 **Cross-Environment Support**: Compatible with all major JS runtimes.
- 🔧 **Integratable**: Easy to use with [viem](https://github.com/wevm/viem),
  [ethers](https://github.com/ethers-io/ethers.js) and other wallet libraries.
- 📚 **Documented**: JSDoc annotations with usage examples in source code.

## Installation

```
# npm
npm i @nktkas/hyperliquid

# deno
deno add jsr:@nktkas/hyperliquid

# pnpm >=10.9.0
pnpm i jsr:@nktkas/hyperliquid

# yarn >=4.9.0
yarn add jsr:@nktkas/hyperliquid

# bun
bun i @nktkas/hyperliquid
```

## Quick Start

```ts
import * as hl from "@nktkas/hyperliquid";

const transport = new hl.HttpTransport();
const client = new hl.PublicClient({ transport });

const openOrders = await client.openOrders({ user: "0x..." }); // Change to your address
```

```ts
import * as hl from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x..."); // Change to your private key

const transport = new hl.HttpTransport();
const client = new hl.WalletClient({ wallet, transport });

const result = await client.order({
    orders: [{
        a: 0, // Asset index
        b: true, // Buy order
        p: "30000", // Price
        s: "0.1", // Size
        r: false, // Not reduce-only
        t: {
            limit: {
                tif: "Gtc", // Good-til-cancelled
            },
        },
    }],
    grouping: "na", // No grouping orders
});
```

```ts
import * as hl from "@nktkas/hyperliquid";

const transport = new hl.WebSocketTransport();
const client = new hl.EventClient({ transport });

// Subscribe to events
const sub = await client.allMids((event) => {
    // Handle the event
    console.log(event);
});

await sub.unsubscribe(); // Unsubscribe from the event
```

## Usage

### 1) Initialize Transport

First, choose and configure your transport layer (more details in the [API Reference](#transports)):

```ts
import * as hl from "@nktkas/hyperliquid"; // support ESM & Common.js

// HTTP Transport
const httpTransport = new hl.HttpTransport(); // Accepts optional parameters

// WebSocket Transport
const wsTransport = new hl.WebSocketTransport(); // Accepts optional parameters
```

### 2) Initialize Client

Next, initialize a client with the transport layer (more details in the [API Reference](#clients)):

#### Create PublicClient

```ts
import * as hl from "@nktkas/hyperliquid"; // support ESM & Common.js

const transport = new hl.HttpTransport(); // or WebSocketTransport
const client = new hl.PublicClient({ transport });
```

#### Create WalletClient

```ts
import * as hl from "@nktkas/hyperliquid"; // support ESM & Common.js
import { createWalletClient, custom } from "viem";
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
const externalWallet = createWalletClient({ account, transport: custom(window.ethereum) });
const viemMetamaskClient = new hl.WalletClient({ wallet: externalWallet, transport });

// 4. Using external wallet (e.g. MetaMask) via `window.ethereum` directly
const windowMetamaskClient = new hl.WalletClient({ wallet: window.ethereum, transport });
```

#### Create EventClient

```ts
import * as hl from "@nktkas/hyperliquid"; // support ESM & Common.js

const transport = new hl.WebSocketTransport(); // only WebSocketTransport
const client = new hl.EventClient({ transport });
```

### 3) Use Client

Finally, use client methods to interact with the Hyperliquid API (more details in the [API Reference](#clients)):

#### Example of using a public client

```ts
import * as hl from "@nktkas/hyperliquid";

const transport = new hl.HttpTransport();
const client = new hl.PublicClient({ transport });

// L2 Book
const l2Book = await client.l2Book({ coin: "BTC" });

// Account clearinghouse state
const clearinghouseState = await client.clearinghouseState({ user: "0x..." });

// Open orders
const openOrders = await client.openOrders({ user: "0x..." });
```

#### Example of using a wallet client

```ts
import * as hl from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount("0x...");
const transport = new hl.HttpTransport();
const client = new hl.WalletClient({ wallet: account, transport });

// Place an orders
const result = await client.order({
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
const result = await client.approveAgent({
    agentAddress: "0x...",
    agentName: "agentName",
});

// Withdraw funds
const result = await client.withdraw3({
    destination: account.address,
    amount: "100",
});
```

#### Example of using an event client

```ts
import * as hl from "@nktkas/hyperliquid";

const transport = new hl.WebSocketTransport();
const client = new hl.EventClient({ transport });

// L2 Book updates
const sub = await client.l2Book({ coin: "BTC" }, (data) => {
    console.log(data);
});
await sub.unsubscribe();

// User fills
const sub = await client.userFills({ user: "0x..." }, (data) => {
    console.log(data);
});
await sub.unsubscribe();

// Explorer block updates
const sub = await client.explorerBlock((data) => {
    console.log(data);
});
await sub.unsubscribe();
```

## API Reference

### Clients

A Client provides access to the Hyperliquid API endpoints.

#### Public Client

A Public Client which provides access to
[Info API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint) and Explorer API, such as
`l2Book` and `clearinghouseState`.

The Public Client class sets up with a given [Transport](#transports).

```ts
class PublicClient {
    constructor(args: {
        transport: HttpTransport | WebSocketTransport;
    });

    // Market
    allMids(args?: AllMidsParameters): Promise<AllMids>;
    candleSnapshot(args: CandleSnapshotParameters): Promise<Candle[]>;
    fundingHistory(args: FundingHistoryParameters): Promise<FundingHistory[]>;
    l2Book(args: L2BookParameters): Promise<Book>;
    meta(args?: MetaParameters): Promise<PerpsMeta>;
    metaAndAssetCtxs(): Promise<PerpsMetaAndAssetCtxs>;
    perpDexs(): Promise<(PerpDex | null)[]>;
    perpsAtOpenInterestCap(): Promise<string[]>;
    predictedFundings(): Promise<PredictedFunding[]>;
    spotDeployState(args: SpotDeployStateParameters): Promise<SpotDeployState>;
    spotMeta(): Promise<SpotMeta>;
    spotMetaAndAssetCtxs(): Promise<SpotMetaAndAssetCtxs>;
    tokenDetails(args: TokenDetailsParameters): Promise<TokenDetails>;

    // Account
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

    // Staking
    delegations(args: DelegationsParameters): Promise<Delegation[]>;
    delegatorHistory(args: DelegatorHistoryParameters): Promise<DelegatorUpdate[]>;
    delegatorRewards(args: DelegatorRewardsParameters): Promise<DelegatorReward[]>;
    delegatorSummary(args: DelegatorSummaryParameters): Promise<DelegatorSummary>;
    validatorSummaries(): Promise<ValidatorSummary[]>;

    // Vault
    userVaultEquities(args: UserVaultEquitiesParameters): Promise<VaultEquity[]>;
    vaultDetails(args: VaultDetailsParameters): Promise<VaultDetails | null>;
    vaultSummaries(): Promise<VaultSummary[]>;

    // Explorer
    blockDetails(args: BlockDetailsParameters): Promise<BlockDetailsResponse>;
    txDetails(args: TxDetailsParameters): Promise<TxDetailsResponse>;
    userDetails(args: UserDetailsParameters): Promise<UserDetailsResponse>;
}
```

#### Wallet Client

A Wallet Client which provides access to
[Exchange API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint), such as `order`
and `withdraw3`.

The Wallet Client class sets up with a given [Transport](#transports) and a wallet instance, which can be a
[viem](https://viem.sh/docs/clients/wallet), [ethers.js](https://docs.ethers.org/v6/api/providers/#Signer) or other
wallet libraries.

```ts
class WalletClient {
    constructor(args: {
        transport: HttpTransport | WebSocketTransport;
        wallet:
            | AbstractViemWalletClient // viem
            | AbstractEthersSigner // ethers
            | AbstractEthersV5Signer // ethers v5
            | AbstractExtendedViemWalletClient // privy
            | AbstractWindowEthereum; // window.ethereum (EIP-1193) directly
        isTestnet?: boolean; // Whether to use testnet (default: false)
        defaultVaultAddress?: Hex; // Vault address used by default if not provided in method call
        signatureChainId?: Hex | (() => MaybePromise<Hex>); // Chain ID used for signing (default: trying to guess based on wallet and isTestnet)
        nonceManager?: () => MaybePromise<number>; // Function to get the next nonce (default: auto-incrementing Date.now())
    });

    // Order
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

    // Account
    approveAgent(args: ApproveAgentParameters): Promise<SuccessResponse>;
    approveBuilderFee(args: ApproveBuilderFeeParameters): Promise<SuccessResponse>;
    claimRewards(): Promise<SuccessResponse>;
    createSubAccount(args: CreateSubAccountParameters): Promise<CreateSubAccountResponse>;
    evmUserModify(args: EvmUserModifyParameters): Promise<SuccessResponse>;
    registerReferrer(args: RegisterReferrerParameters): Promise<SuccessResponse>;
    reserveRequestWeight(args: ReserveRequestWeightParameters): Promise<SuccessResponse>;
    setDisplayName(args: SetDisplayNameParameters): Promise<SuccessResponse>;
    setReferrer(args: SetReferrerParameters): Promise<SuccessResponse>;
    spotUser(args: SpotUserParameters): Promise<SuccessResponse>;

    // Transfers & Withdrawals
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
}
```

#### Event Client

A Event Client which provides access to
[Subscriptions API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions), such as
real-time updates for `l2Book` and `userFills`.

The Event Client class sets up with a given [WebSocket Transport](#websocket-transport).

<!-- deno-fmt-ignore-start -->
```ts
class EventClient {
    constructor(args: {
        transport: WebSocketTransport;
    });

    // Market
    activeAssetCtx(args: EventActiveAssetCtxParameters, listener: (data: WsActiveAssetCtx | WsActiveSpotAssetCtx) => void): Promise<Subscription>;
    activeAssetData(args: EventActiveAssetDataParameters, listener: (data: WsActiveAssetData) => void): Promise<Subscription>;
    allMids(listener: (data: WsAllMids) => void): Promise<Subscription>;
    bbo(args: EventBboParameters, listener: (data: WsBbo) => void): Promise<Subscription>;
    candle(args: EventCandleParameters, listener: (data: Candle) => void): Promise<Subscription>;
    l2Book(args: EventL2BookParameters, listener: (data: Book) => void): Promise<Subscription>;
    trades(args: EventTradesParameters, listener: (data: WsTrade[]) => void): Promise<Subscription>;

    // Account
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

    // Explorer
    explorerBlock(listener: (data: WsBlockDetails[]) => void): Promise<Subscription>;
    explorerTx(listener: (data: TxDetails[]) => void): Promise<Subscription>;
}
```
<!-- deno-fmt-ignore-end -->

### Transports

A [Client](#clients) is instantiated with a Transport, which is the intermediary layer that is responsible for executing
outgoing requests (ie. API calls and event listeners).

There are two types of Transports in the sdk:

#### HTTP Transport

A HTTP Transport that executes requests via a [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch)
API.

```ts
class HttpTransport {
    constructor(options?: {
        isTestnet?: boolean; // Whether to use testnet url (default: false)
        timeout?: number; // Request timeout in ms (default: 10_000)
        server?: "api" | "api2" | "api-ui"; // Server URL (default: "api" = "https://api.hyperliquid.xyz")
        fetchOptions?: RequestInit; // A custom fetch options
        onRequest?: (request: Request) => MaybePromise<Request | void | null | undefined>; // A callback before request is sent
        onResponse?: (response: Response) => MaybePromise<Response | void | null | undefined>; // A callback after response is received
    });

    request(endpoint: "info" | "exchange" | "explorer", payload: unknown, signal?: AbortSignal): Promise<unknown>;
}
```

#### WebSocket Transport

A WebSocket Transport that executes requests and subscribes to events via a
[WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) connection.

```ts
class WebSocketTransport {
    constructor(options?: {
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
        };
    });

    request(endpoint: "info" | "exchange", payload: unknown, signal?: AbortSignal): Promise<unknown>;
    subscribe(
        channel: string,
        payload: unknown,
        listener: (data: CustomEvent) => void,
        signal?: AbortSignal,
    ): Promise<Subscription>;

    ready(signal?: AbortSignal): Promise<void>;
    close(signal?: AbortSignal): Promise<void>;
}
```

## Additional Import Points

The SDK exports additional import points to access internal functions.

### `/types`

The import point gives access to all Hyperliquid-related types, including the base types on which class methods are
based.

Useful if you want to get all Hyperliquid types.

### `/signing`

The import point gives access to functions that generate signatures for Hyperliquid transactions.

Useful if you want to sign a Hyperliquid transaction yourself.

### Examples

#### Cancel an order without a client

```ts
import { signL1Action } from "@nktkas/hyperliquid/signing";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x..."); // Change to your private key

const action = {
    type: "cancel",
    cancels: [
        { a: 0, o: 12345 },
    ],
};
const nonce = Date.now();

const signature = await signL1Action({
    wallet,
    action,
    nonce,
    isTestnet: true, // Change to false for mainnet
});

const response = await fetch("https://api.hyperliquid-testnet.xyz/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, signature, nonce }),
});
const body = await response.json();
```

#### Approve an agent without a client

```ts
import { signUserSignedAction } from "@nktkas/hyperliquid/signing";
import { privateKeyToAccount } from "viem/accounts";

const wallet = privateKeyToAccount("0x..."); // Change to your private key

const action = {
    type: "approveAgent",
    hyperliquidChain: "Testnet", // "Mainnet" or "Testnet"
    signatureChainId: "0x66eee",
    nonce: Date.now(),
    agentAddress: "0x...",
    agentName: "Agent",
};

const signature = await signUserSignedAction({
    wallet,
    action,
    types: {
        "HyperliquidTransaction:ApproveAgent": [
            { name: "hyperliquidChain", type: "string" },
            { name: "agentAddress", type: "address" },
            { name: "agentName", type: "string" },
            { name: "nonce", type: "uint64" },
        ],
    },
    chainId: parseInt(action.signatureChainId, 16),
});

const response = await fetch("https://api.hyperliquid-testnet.xyz/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, signature, nonce: action.nonce }),
});
const body = await response.json();
```
