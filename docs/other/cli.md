# CLI

Command-line interface for interacting with Hyperliquid API without writing code.

## Usage

```sh
npx @nktkas/hyperliquid <endpoint> <method> [options]
```

### endpoint

- **Type:** `"info"` | `"exchange"`

API endpoint to use:

- `info` — query market data and account state
- `exchange` — execute trading operations (requires `--private-key`)

### method

Method name matching the SDK client methods (e.g., `allMids`, `order`, `cancel`).

Run `npx @nktkas/hyperliquid --help` for the full list.

### --testnet

Use testnet instead of mainnet.

```sh
npx @nktkas/hyperliquid info allMids --testnet
```

### --timeout

- **Type:** `number`
- **Default:** `10000`

Request timeout in milliseconds.

```sh
npx @nktkas/hyperliquid info allMids --timeout 5000
```

### --private-key

- **Type:** `` `0x${string}` ``

Private key for exchange operations. Required for `exchange` endpoint.

```sh
npx @nktkas/hyperliquid exchange cancel --private-key 0x... --cancels '[{"a":0,"o":12345}]'
```

> [!WARNING]
> Passing private keys via command line is insecure. Use environment variables:
>
> ```sh
> npx @nktkas/hyperliquid exchange cancel --private-key $PRIVATE_KEY --cancels '[{"a":0,"o":12345}]'
> ```

### --vault

- **Type:** `` `0x${string}` ``

Vault address for trading on behalf of a vault.

```sh
npx @nktkas/hyperliquid exchange order --private-key 0x... --vault 0x... --orders '[...]'
```

### --offline

Generate request payload without sending. Useful for debugging or signing transactions offline.

```sh
npx @nktkas/hyperliquid exchange order --private-key 0x... --offline --orders '[...]'
```

## Examples

### Info Endpoint

```sh
# Get all mid prices
npx @nktkas/hyperliquid info allMids

# Get ETH order book
npx @nktkas/hyperliquid info l2Book --coin ETH --nSigFigs 3

# Get user portfolio
npx @nktkas/hyperliquid info portfolio --user 0x...

# Get candle data
npx @nktkas/hyperliquid info candleSnapshot --coin BTC --interval 1h --startTime 1700000000000
```

### Exchange Endpoint

```sh
# Place limit order
npx @nktkas/hyperliquid exchange order --private-key 0x... \
  --orders '[{"a":0,"b":true,"p":"30000","s":"0.1","r":false,"t":{"limit":{"tif":"Gtc"}}}]'

# Cancel order
npx @nktkas/hyperliquid exchange cancel --private-key 0x... \
  --cancels '[{"a":0,"o":12345}]'

# Update leverage
npx @nktkas/hyperliquid exchange updateLeverage --private-key 0x... \
  --asset 0 --isCross true --leverage 5

# Withdraw funds
npx @nktkas/hyperliquid exchange withdraw3 --private-key 0x... \
  --destination 0x... --amount 100.5
```

## JSON Arguments

Some methods require JSON arguments. Escape quotes properly for your shell:

```sh
# Bash/Zsh
--orders '[{"a":0,"b":true}]'

# PowerShell
--orders '[{\"a\":0,\"b\":true}]'

# Windows CMD
--orders "[{\"a\":0,\"b\":true}]"
```

## Output

CLI outputs JSON to stdout. Format with [jq](https://jqlang.org/) or PowerShell:

```sh
# jq (cross-platform)
npx @nktkas/hyperliquid info allMids | jq .

# PowerShell (Windows)
npx @nktkas/hyperliquid info allMids | ConvertFrom-Json | ConvertTo-Json -Depth 10
```
