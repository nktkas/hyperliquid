# Contributing to @nktkas/hyperliquid

Welcome, and thank you for taking time in contributing to SDK! You can contribute to SDK in different ways:

- Submit new features
- Report and fix bugs
- Review code

## Development Setup

You will need [Deno](https://deno.com) 2.0+.

1. Fork this repository to your own GitHub account.
2. Clone the repository to your local device.
3. Create a new branch `git checkout -b BRANCH_NAME`.
4. Change code.
5. [Push your branch to Github after all tests passed.](#Testing)
6. Make a [pull request](https://github.com/nktkas/hyperliquid/pulls).
7. Merge to master branch by our maintainers.

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

- **TypeScript**: Ensure your code passes TypeScript compilation without errors. Try not to ignore typescript errors and
  avoid creating unsafe types.
- **Style**: Follow Deno formatting convention ([deno fmt](https://docs.deno.com/runtime/reference/cli/fmt/)) and code
  style ([deno lint](https://docs.deno.com/runtime/reference/cli/lint/)).
- **Dependencies**: Try to use trusted small dependencies (e.g. [@noble](https://github.com/paulmillr/noble-hashes) or
  [deno @std](https://github.com/denoland/std)).
- **Docs**: Update or add JSDoc comments where appropriate.
