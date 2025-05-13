import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { HttpTransport, WalletClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const SUB_ACCOUNT_ADDRESS = "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1";
const TOKEN_ADDRESS = "USDC:0xeb62eee3685fc4c43992febcd9e75443";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<WalletClient["subAccountSpotTransfer"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("subAccountSpotTransfer", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check argument 'isDeposit'
        walletClient.subAccountSpotTransfer({
            subAccountUser: SUB_ACCOUNT_ADDRESS,
            isDeposit: true,
            token: TOKEN_ADDRESS,
            amount: "1",
        }),
        walletClient.subAccountSpotTransfer({
            subAccountUser: SUB_ACCOUNT_ADDRESS,
            isDeposit: false,
            token: TOKEN_ADDRESS,
            amount: "1",
        }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
