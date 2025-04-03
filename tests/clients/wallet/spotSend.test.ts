import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { HttpTransport, WalletClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const DESTINATION_ADDRESS = "0x0000000000000000000000000000000000000000";
const TOKEN_ADDRESS = "USDC:0xeb62eee3685fc4c43992febcd9e75443";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<WalletClient["spotSend"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("spotSend", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
    const transport = new HttpTransport({ isTestnet: true });
    const walletClient = new WalletClient({ wallet: account, transport, isTestnet: true });

    // Preparation of balance
    await walletClient.usdClassTransfer({
        amount: "1",
        toPerp: false,
    });

    // —————————— Test ——————————

    const data = await walletClient.spotSend({
        destination: DESTINATION_ADDRESS,
        token: TOKEN_ADDRESS,
        amount: "1",
    });

    schemaCoverage(MethodReturnType, [data]);
});
