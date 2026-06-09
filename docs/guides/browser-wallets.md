# Browser wallets

The SDK works with browser extension wallets like MetaMask.

## Setup

{% tabs %}

{% tab title="viem" %}

Connect via a [JSON-RPC Account](https://viem.sh/docs/clients/wallet#json-rpc-accounts):

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { createWalletClient, custom } from "viem";
import { arbitrum } from "viem/chains";

const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" }) as `0x${string}`[];
const wallet = createWalletClient({ account, chain: arbitrum, transport: custom(window.ethereum!) });

const transport = new HttpTransport();
const client = new ExchangeClient({ transport, wallet });
```

{% endtab %}

{% tab title="ethers" %}

Connect via a [BrowserProvider](https://docs.ethers.org/v6/api/providers/#BrowserProvider):

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { BrowserProvider } from "ethers";

const provider = new BrowserProvider(window.ethereum!);
const wallet = await provider.getSigner();

const transport = new HttpTransport();
const client = new ExchangeClient({ transport, wallet });
```

{% endtab %}

{% endtabs %}

## Signature prompts

Every exchange action triggers a wallet popup that the user must approve. [L1 actions](../signing.md#l1-action) (trading
and position management) show a [phantom agent](../signing.md#l1-action) hash instead of human-readable details — this
is by Hyperliquid design.

To avoid repeated popups and hide unreadable L1 signatures from users, approve an
[agent wallet](agent-wallets-and-vaults.md#agent-wallets) once with the browser wallet, then use the agent's private key
for all subsequent trades:

```ts
import { ExchangeClient, HttpTransport } from "@nktkas/hyperliquid";
import { createWalletClient, custom } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { arbitrum } from "viem/chains";

// Browser wallet (MetaMask, etc.)
const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" }) as `0x${string}`[];
const wallet = createWalletClient({ account, chain: arbitrum, transport: custom(window.ethereum!) });

const transport = new HttpTransport();
const client = new ExchangeClient({ transport, wallet });

// Agent — persist the key to reuse the agent
const agentPrivateKey = generatePrivateKey();
const agentSigner = privateKeyToAccount(agentPrivateKey);

// 1. Approve agent once (triggers browser wallet popup)
await client.approveAgent({
  agentAddress: agentSigner.address,
  agentName: "browser-agent",
});

// 2. Trade with agent (no popups)
const agentClient = new ExchangeClient({ transport, wallet: agentSigner });
await agentClient.order({ orders: [/* ... */], grouping: "na" });
```
