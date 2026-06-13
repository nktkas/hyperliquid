# Contributing to @nktkas/hyperliquid

Welcome, and thank you for taking time in contributing to SDK! You can contribute to SDK in different ways:

- Submit new features
- Report bugs
- Review code

## Dev Environment Setup

If you want to read or modify the SDK code, set up your development environment as follows:

1. Install [Deno](https://deno.com).
2. Use [VSCode Deno LSP](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) or a
   [similar extension](https://docs.deno.com/runtime/getting_started/setup_your_environment/) if you are using a
   different editor.

## Testing

```bash
deno test -A
```

Optional: Set `PRIVATE_KEY` env for complete tests. Required testnet balance: ~100 usdc-perps, ~3 usdc-spot, ~0.0000001
hype-spot.

## Coding Guidelines

- **Style**: After making all changes, run: `deno task check`
- **Dependencies**: Use small and easily auditable dependencies (e.g.
  [@noble/hashes](https://www.npmjs.com/package/@noble/hashes) or [@std](https://jsr.io/@std)).
- **Testing**: Write tests for any new functionality.
- **Docs**: Update or add JSDoc comments where appropriate.

## Common Tasks

### Add a new API method

1. Create a file named after the method in the matching group's `_methods` directory:
   `src/api/[exchange|info|subscription|explorer]/_methods/[methodName].ts`
2. Implement it using the patterns from existing method files.
3. Re-export the file from the group barrel: add `export * from "./_methods/[methodName].ts";` to
   `src/api/[group]/mod.ts`.
4. Add the matching wrapper method to the client in `src/api/[group]/client.ts`.
5. Create a test at `tests/api/[group]/[methodName].test.ts` (use patterns from other tests) and run it.
6. Run the `deno task check` command and fix any errors that are reported.

### Update API schemas/types

1. Go to `src/api/[group]/_methods/[methodName].ts`
2. Update the [valibot](https://valibot.dev/) schemas in the "Schemas" section (types are inferred from schemas).
3. Run the test at `tests/api/[group]/[methodName].test.ts` to check the schemas against the actual API response.
