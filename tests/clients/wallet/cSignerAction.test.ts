import { assertRejects } from "jsr:@std/assert@^1.0.10";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { ApiRequestError, HttpTransport, WalletClient } from "../../../mod.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;

// —————————— Test ——————————

// NOTE: This API is difficult to test with a successful response.
// So to prove that the method works, we will expect a specific error
Deno.test("cSignerAction", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    await Promise.all([
        assertRejects(
            () => walletClient.cSignerAction({ jailSelf: null }),
            ApiRequestError,
            "Signer invalid or inactive for current epoch",
        ),
        assertRejects(
            () => walletClient.cSignerAction({ unjailSelf: null }),
            ApiRequestError,
            "Signer invalid or inactive for current epoch",
        ),
    ]);
});
