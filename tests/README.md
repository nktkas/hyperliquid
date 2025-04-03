# Tests

These tests ensure the internal logic is correct and matches real data types.

## Running tests

The library is written in [Deno](https://deno.com/), which is also used for test execution.

> [!NOTE]
> If you want to learn more about how these tests are structured, check out
> [Deno’s testing fundamentals](https://docs.deno.com/runtime/fundamentals/testing/) and the
> [CLI test command reference](https://docs.deno.com/runtime/reference/cli/test/).

### Basic Usage

Run most of the tests with:

```bash
deno test --allow-net --allow-read
```

### Advanced Usage

Some tests require a testnet account with a funded balance and a private key. Pass them as additional arguments to run
all tests:

```bash
deno test --allow-net --allow-read -- PRIVATE_KEY SUB_ACCOUNT_ADDRESS VAULT_ADDRESS
```

> **Note**: `--allow-read` is necessary for dynamically building type schemas during the test process.
