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

const wallet = createWalletClient({
  chain: arbitrum,
  transport: custom(window.ethereum!),
});

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
is by design, because the action is never signed directly.

To avoid repeated popups and hide unreadable L1 signatures from users, approve an
[agent wallet](agent-wallets-and-vaults.md#agent-wallets) once with the browser wallet, then use the agent's private key
for all subsequent trades:

```ts
// 1. Approve agent once (triggers wallet popup)
await client.approveAgent({
  agentAddress: "0x...",
  agentName: "browser-agent",
});

// 2. Trade with agent (no popups)
import { privateKeyToAccount } from "viem/accounts";

const agentClient = new ExchangeClient({
  transport,
  wallet: privateKeyToAccount("0x..."), // agent's private key
});

await agentClient.order({ orders: [/* ... */], grouping: "na" });
```
