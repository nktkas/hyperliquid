# Contributing to @nktkas/hyperliquid

Welcome, and thank you for taking time in contributing to SDK! You can contribute to SDK in different ways:

- Submit new features
- Report bugs
- Review code

## Testing

You can run most tests with the following command:

```bash
deno test -A
```

However, for complete testing, you will need a private key from a testnet account with funds (~100 usdc-perps, ~3
usdc-spot, ~0.0000001 hype-spot):

```bash
deno test -A -- YOUR_PRIVATE_KEY
```

## Coding Guidelines

- **Style**: After making all changes, run:
  - [`deno fmt`](https://docs.deno.com/runtime/reference/cli/fmt/) to format your code.
  - [`deno lint`](https://docs.deno.com/runtime/reference/cli/lint/) to check for linting errors.
  - [`deno check --doc`](https://docs.deno.com/runtime/reference/cli/check/) to ensure there are no type errors (try not
    to ignore errors).
- **Dependencies**: Try to use small and easily auditable dependencies (e.g.
  [@noble](https://github.com/paulmillr/noble-hashes) or [deno @std](https://docs.deno.com/runtime/reference/std/)).
- **Testing**: Write tests for any new functionality.
- **Docs**: Update or add JSDoc comments where appropriate.

## Common Tasks

### Add a new API method

1. Create a file with the method name in the appropriate directory:
   `src/api/[exchange|info|subscription]/[methodName].ts`
2. Implement the logic related to the new API (using ready-made patterns from other method files).
3. Update the `~client.ts` file to include the new method.
4. Add the raw function export to `~mod.ts`.
5. Create a test (use patterns from other tests) and run the test.
6. Update docs:
   - Update the [`API Reference`](/README.md#api-reference) section in [`README.md`](/README.md)
   - Update the helper message (function `printHelp`) in [`bin/cli.ts`](/bin/cli.ts).
7. Run [`deno fmt`](https://docs.deno.com/runtime/reference/cli/fmt/),
   [`deno lint`](https://docs.deno.com/runtime/reference/cli/lint/), and
   [`deno check --doc`](https://docs.deno.com/runtime/reference/cli/check/) to ensure code quality.
