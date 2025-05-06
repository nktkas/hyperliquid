import { assert, assertEquals } from "jsr:@std/assert@^1.0.10";
import { WalletClient } from "../../../mod.ts";

Deno.test("_nonceManager", async (t) => {
    // Save original Date.now for restoration later
    const originalNow = Date.now;

    try {
        // Mock Date.now to return a fixed timestamp
        const fixedTime = 1000;
        Date.now = () => fixedTime;

        // @ts-ignore - Creating minimal instance for testing
        let walletClient = new WalletClient({});

        await t.step("Get expected time", async () => {
            const nonce1 = await walletClient.nonceManager();
            assertEquals(nonce1, fixedTime, "First nonce should be the fixed timestamp");
        });

        await t.step("Get incremented nonce", async () => {
            const nonce2 = await walletClient.nonceManager();
            assertEquals(nonce2, fixedTime + 1, "Second nonce should increment when timestamp is the same");
        });

        // Restore original logic
        Date.now = originalNow;
        // @ts-ignore - Creating minimal instance for testing
        walletClient = new WalletClient({});

        await t.step("Get expected time difference", async () => {
            const nonce1 = await walletClient.nonceManager();
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const nonce2 = await walletClient.nonceManager();

            const timeDiff = nonce2 - nonce1;
            const allowedError = 150;
            const isWithinRange = timeDiff >= 1000 - allowedError && timeDiff <= 1000 + allowedError;

            assert(
                isWithinRange,
                `Time difference of ${timeDiff}ms should be approximately 1000ms (±${allowedError}ms)`,
            );
        });
    } finally {
        // Restore original Date.now
        Date.now = originalNow;
    }
});
