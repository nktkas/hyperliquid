# Contributing to @nktkas/hyperliquid

First off, thanks for considering contributing to the Hyperliquid TypeScript SDK!

## How Can You Contribute?

### Report Issues

If you find bugs or have suggestions for improvements, please open an issue on GitHub. Provide as much detail as
possible to help us understand and address the problem.

### Submit Pull Requests

- **Fork the Repository**: Click the "Fork" button at the top-right corner of the repository page.
- **Clone Your Fork**: Clone your forked repository to your local machine.

```bash
git clone https://github.com/your-username/hyperliquid.git
```

- **Create a Branch**: Create a new branch for your feature or bug fix.

```bash
git checkout -b feature/your-feature-name
```

- **Make Your Changes**: Implement your feature or fix the bug.
- **Commit Your Changes**:

```bash
git commit -am "Add new feature or fix"
```

- **Push to Your Fork**:

```bash
git push origin feature/your-feature-name
```

- **Create a Pull Request**: Go to the original repository and click on "New Pull Request". Select your branch and
  submit the pull request.

#### Coding Guidelines

- **TypeScript**: Ensure your code passes TypeScript compilation without errors. Try not to ignore typescript errors and
  avoid creating unsafe types.
- **Style**: Follow Deno formatting convention ([deno fmt](https://docs.deno.com/runtime/reference/cli/fmt/)) and code
  style ([deno lint](https://docs.deno.com/runtime/reference/cli/lint/)).
- **Dependencies**: Try to use trusted small dependencies (e.g. [@noble](https://github.com/paulmillr/noble-hashes) or
  [deno @std](https://github.com/denoland/std)).
- **Docs**: Update or add JSDoc comments where appropriate.

#### Testing

Before submitting your pull request:

- Run existing tests to ensure nothing breaks.
- If you add new features, consider adding tests for them.
