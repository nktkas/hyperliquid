import { type Args, parseArgs } from "jsr:@std/cli@1/parse-args";
import { privateKeyToAccount } from "npm:viem@2/accounts";
import { ExchangeClient, type Hex, HttpTransport } from "../../../mod.ts";
import { schemaGenerator } from "../../_utils/schema/schemaGenerator.ts";
import { schemaCoverage } from "../../_utils/schema/schemaCoverage.ts";

// —————————— Arguments ——————————

const args = parseArgs(Deno.args, { default: { wait: 1500 }, string: ["_"] }) as Args<{ wait: number }>;

const PRIVATE_KEY = args._[0] as Hex;
const SUB_ACCOUNT_ADDRESS = "0xcb3f0bd249a89e45e86a44bcfc7113e4ffe84cd1";

// —————————— Type schema ——————————

export type MethodReturnType = Awaited<ReturnType<ExchangeClient["subAccountTransfer"]>>;
const MethodReturnType = schemaGenerator(import.meta.url, "MethodReturnType");

// —————————— Test ——————————

Deno.test("subAccountTransfer", { ignore: !PRIVATE_KEY }, async () => {
    await new Promise((r) => setTimeout(r, args.wait));

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
