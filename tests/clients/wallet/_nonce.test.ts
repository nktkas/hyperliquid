import { assertEquals, assertGreater } from "jsr:@std/assert@^1.0.10";
import { WalletClient } from "../../../mod.ts";

Deno.test("_nonce", async (t) => {
    // @ts-ignore - We need a minimum instance
    const walletClient = new WalletClient({});

    await t.step("Should get a fresh nonce if the last one is less.", () => {
        // @ts-ignore - Accessing private property for testing
        const lastNonce = walletClient._lastNonce = 0;
        assertGreater(
            // @ts-ignore - Accessing private property for testing
            walletClient._nonce,
            lastNonce,
            "Fresh nonce should be greater than the last nonce.",
        );

        assertGreater(
            // @ts-ignore - Accessing private property for testing
            walletClient._lastNonce,
            lastNonce,
            "Last nonce should be updated.",
        );
    });

    await t.step("Should get `_lastNonce + 1` if the fresh nonce matches", () => {
        // @ts-ignore - Accessing private property for testing
        const lastNonce = walletClient._lastNonce = Date.now();
        assertEquals(
            // @ts-ignore - Accessing private property for testing
            walletClient._nonce,
            lastNonce + 1,
        );

        assertGreater(
            // @ts-ignore - Accessing private property for testing
            walletClient._lastNonce,
            lastNonce,
            "Last nonce should be updated.",
        );
    });
});
