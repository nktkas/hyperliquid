import { assertRejects } from "jsr:@std/assert@^1.0.10";
import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { ApiRequestError, HttpTransport, WalletClient } from "../../../mod.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;

// —————————— Test ——————————

// NOTE: Only 10 sub-accounts can be created. And for a temporary wallet you need to somehow trade $100000 in volume.
// So to prove that the method works, we will expect a specific error when >10 sub-accounts are created.
Deno.test("createSubAccount", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    await assertRejects(
        () => walletClient.createSubAccount({ name: String(Date.now()) }),
        ApiRequestError,
        "Too many sub-accounts",
    );
});
