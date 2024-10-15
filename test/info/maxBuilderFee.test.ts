import { type Hex, InfoClient } from "../../index.ts";
import { assert } from "jsr:@std/assert@^1.0.4";

const USER_ADDRESS: Hex = "0xe019d6167E7e324aEd003d94098496b6d986aB05";
const BUILDER_ADDRESS: Hex = "0xe019d6167E7e324aEd003d94098496b6d986aB05";

Deno.test(
    "maxBuilderFee",
    { permissions: { net: true } },
    async () => {
        // Create client
        const client = new InfoClient("https://api.hyperliquid-testnet.xyz/info");

        // Test
        const data = await client.maxBuilderFee({ user: USER_ADDRESS, builder: BUILDER_ADDRESS });

        assert(typeof data === "number", `Returned data is not a number, but ${typeof data}`);
    },
);
