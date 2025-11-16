# Contributing to @nktkas/hyperliquid

Welcome, and thank you for taking time in contributing to SDK! You can contribute to SDK in different ways:

- Submit new features
- Report bugs
- Review code

## Testing

```bash
npm run test
```

Set `PRIVATE_KEY` env for complete tests. Required testnet balance: ~100 usdc-perps, ~3 usdc-spot, ~0.0000001 hype-spot.

## Coding Guidelines

- **Style**: After making all changes, run:
  - `npm run fmt` to format code.
  - `npm run lint` to check lint.
  - `npm run typecheck` to check typescript.
- **Dependencies**: Use small and easily auditable dependencies from npm (e.g.
  [@noble/hashes](https://www.npmjs.com/package/@noble/hashes)).
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
7. Run `npm run fmt`, `npm run lint`, and `npm run typecheck` to ensure code quality.

### Update API schemas/types

1. Go to `src/api/[exchange|info|subscription]/[methodName].ts`
2. Update the [valibot](https://valibot.dev/) schemas in the "Schemas" section (types are inferred from schemas).
3. Run the test at `tests/api/[exchange|info|subscription]/[methodName].ts` to check the schemas against the actual API
   response.
