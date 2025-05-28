import { privateKeyToAccount } from "npm:viem@^2.21.7/accounts";
import { HttpTransport, ExchangeClient } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Constants ——————————

const PRIVATE_KEY = Deno.args[0] as `0x${string}`;
const SUB_ACCOUNT_ADDRESS = "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["subAccountTransfer"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("subAccountTransfer", async () => {
    if (!Deno.args.includes("--not-wait")) await new Promise((resolve) => setTimeout(resolve, 1000));

    // —————————— Prepare ——————————

    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = new HttpTransport({ isTestnet: true });
    const exchClient = new ExchangeClient({ wallet: account, transport, isTestnet: true });

    // —————————— Test ——————————

    const data = await Promise.all([
        // Check argument 'isDeposit'
        exchClient.subAccountTransfer({ subAccountUser: SUB_ACCOUNT_ADDRESS, isDeposit: true, usd: 1 }),
        exchClient.subAccountTransfer({ subAccountUser: SUB_ACCOUNT_ADDRESS, isDeposit: false, usd: 1 }),
    ]);

    schemaCoverage(MethodReturnType, data);
});
