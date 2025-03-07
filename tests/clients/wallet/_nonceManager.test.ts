import { assertEquals } from "jsr:@std/assert@^1.0.10";
import { WalletClient } from "../../../mod.ts";

Deno.test("_nonceManager", async () => {
    // Save original Date.now for restoration later
    const originalNow = Date.now;

    try {
        // Set a fixed timestamp for testing
        const fixedTime = 1000;
        Date.now = () => fixedTime;

        // @ts-ignore - Creating minimal instance for testing
        const walletClient = new WalletClient({});

        // First call should use the fixed timestamp because lastNonce is 0
        const nonce1 = await walletClient.nonceManager();
        assertEquals(nonce1, fixedTime, "First nonce should be the fixed timestamp");

        // Second call should increment since timestamp hasn't changed
        const nonce2 = await walletClient.nonceManager();
        assertEquals(nonce2, fixedTime + 1, "Second nonce should increment when timestamp is the same");
    } finally {
        // Restore original Date.now
        Date.now = originalNow;
    }
});
